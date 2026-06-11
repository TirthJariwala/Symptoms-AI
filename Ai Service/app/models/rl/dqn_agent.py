import math
import random
from pathlib import Path
from typing import List, Optional

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from app.core.config import settings
from app.core.logger import logger
from app.models.rl.replay_buffer import ReplayBuffer

class QNetwork(nn.Module):
    def __init__(self, state_dim: int = 2048, n_actions: int = 3) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 512),
            nn.ReLU(inplace=True),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Linear(256, n_actions),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)

class DQNAgent:
    def __init__(
        self,
        state_dim: int = 2048,
        n_actions: int = 3,
        action_labels: Optional[List[str]] = None,
        device: Optional[str] = None,
        epsilon_start: float = settings.rl_epsilon_start,
        epsilon_end: float = settings.rl_epsilon_end,
        epsilon_decay_steps: int = settings.rl_epsilon_decay,
        gamma: float = settings.rl_gamma,
        lr: float = settings.cnn_learning_rate,
        batch_size: int = settings.rl_batch_size,
        target_update_freq: int = 10,
    ) -> None:
        self.n_actions = n_actions
        self.action_labels = action_labels or settings.rl_actions
        self.device = torch.device(
            device or ("cuda" if torch.cuda.is_available() else "cpu")
        )
        self.gamma = gamma
        self.batch_size = batch_size
        self.target_update_freq = target_update_freq

        # Epsilon schedule
        self._epsilon = epsilon_start
        self._epsilon_end = epsilon_end
        self._epsilon_decay = epsilon_decay_steps
        self._steps_done = 0

        # Networks
        self.policy_net = QNetwork(state_dim, n_actions).to(self.device)
        self.target_net = QNetwork(state_dim, n_actions).to(self.device)
        self._sync_target()

        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=lr)
        self.replay_buffer = ReplayBuffer(settings.rl_replay_buffer_size)

        self._episode = 0
        logger.info(
            f"DQNAgent initialised | actions={n_actions} | device={self.device}"
        )

    @property
    def epsilon(self) -> float:
        return self._epsilon

    def select_action(self, state: np.ndarray) -> int:
        if random.random() < self._epsilon:
            return random.randrange(self.n_actions)

        with torch.no_grad():
            state_t = torch.tensor(state, dtype=torch.float32).unsqueeze(0).to(self.device)
            q_values = self.policy_net(state_t)
            return int(q_values.argmax(dim=1).item())

    def action_label(self, action_idx: int) -> str:
        return self.action_labels[action_idx]

    def store_transition(
        self,
        state: np.ndarray,
        action: int,
        reward: float,
        next_state: np.ndarray,
        done: bool,
    ) -> None:
        self.replay_buffer.push(state, action, reward, next_state, done)

    def update(self) -> Optional[float]:
        if not self.replay_buffer.is_ready(self.batch_size):
            return None

        states, actions, rewards, next_states, dones = self.replay_buffer.sample(
            self.batch_size
        )
        states = states.to(self.device)
        actions = actions.to(self.device)
        rewards = rewards.to(self.device)
        next_states = next_states.to(self.device)
        dones = dones.to(self.device)

        current_q = self.policy_net(states).gather(1, actions.unsqueeze(1)).squeeze(1)

        with torch.no_grad():
            max_next_q = self.target_net(next_states).max(dim=1)[0]
            target_q = rewards + self.gamma * max_next_q * (1.0 - dones)

        loss = nn.SmoothL1Loss()(current_q, target_q)

        self.optimizer.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(self.policy_net.parameters(), max_norm=10.0)
        self.optimizer.step()

        return loss.item()

    def end_episode(self) -> None:
        self._episode += 1
        # Exponential epsilon decay (SRS FR-002)
        self._epsilon = max(
            self._epsilon_end,
            self._epsilon_end
            + (settings.rl_epsilon_start - self._epsilon_end)
            * math.exp(-self._episode / self._epsilon_decay),
        )

        if self._episode % self.target_update_freq == 0:
            self._sync_target()
            logger.debug(
                f"[DQN] Episode {self._episode} | ε={self._epsilon:.4f} | target synced"
            )

    def save(self, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save(
            {
                "policy_state_dict": self.policy_net.state_dict(),
                "target_state_dict": self.target_net.state_dict(),
                "optimizer_state_dict": self.optimizer.state_dict(),
                "episode": self._episode,
                "epsilon": self._epsilon,
            },
            path,
        )
        logger.info(f"DQN agent saved → {path}")

    def load(self, path: str | Path) -> None:
        path = Path(path)
        ckpt = torch.load(path, map_location=self.device)
        self.policy_net.load_state_dict(ckpt["policy_state_dict"])
        self.target_net.load_state_dict(ckpt["target_state_dict"])
        self.optimizer.load_state_dict(ckpt["optimizer_state_dict"])
        self._episode = ckpt.get("episode", 0)
        self._epsilon = ckpt.get("epsilon", self._epsilon_end)
        logger.info(f"DQN agent loaded ← {path} | episode={self._episode}")

    def _sync_target(self) -> None:
        self.target_net.load_state_dict(self.policy_net.state_dict())