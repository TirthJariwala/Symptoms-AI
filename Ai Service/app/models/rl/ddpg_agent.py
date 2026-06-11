from pathlib import Path
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from app.core.config import settings
from app.core.logger import logger
from app.models.rl.replay_buffer import ReplayBuffer


class Actor(nn.Module):
    def __init__(self, state_dim: int, action_dim: int) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 512),
            nn.ReLU(inplace=True),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Linear(256, action_dim),
            nn.Tanh(),   # bound output to [-1, 1]
        )

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        return self.net(state)


class Critic(nn.Module):
    def __init__(self, state_dim: int, action_dim: int) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim + action_dim, 512),
            nn.ReLU(inplace=True),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Linear(256, 1),
        )

    def forward(self, state: torch.Tensor, action: torch.Tensor) -> torch.Tensor:
        return self.net(torch.cat([state, action], dim=-1))


class DDPGAgent:
    def __init__(
        self,
        state_dim: int = 2048,
        action_dim: int = 3,
        device: Optional[str] = None,
        lr_actor: float = 1e-4,
        lr_critic: float = 1e-3,
        gamma: float = settings.rl_gamma,
        tau: float = 0.005,
        noise_std: float = 0.1,
    ) -> None:
        self.device = torch.device(
            device or ("cuda" if torch.cuda.is_available() else "cpu")
        )
        self.gamma = gamma
        self.tau = tau
        self.noise_std = noise_std
        self.action_dim = action_dim

        self.actor = Actor(state_dim, action_dim).to(self.device)
        self.actor_target = Actor(state_dim, action_dim).to(self.device)
        self._copy_weights(self.actor, self.actor_target)

        self.critic = Critic(state_dim, action_dim).to(self.device)
        self.critic_target = Critic(state_dim, action_dim).to(self.device)
        self._copy_weights(self.critic, self.critic_target)

        self.actor_opt = optim.Adam(self.actor.parameters(), lr=lr_actor)
        self.critic_opt = optim.Adam(self.critic.parameters(), lr=lr_critic)

        self.replay_buffer = ReplayBuffer(settings.rl_replay_buffer_size)
        logger.info(f"DDPGAgent initialised | action_dim={action_dim} | device={self.device}")

    def select_action(self, state: np.ndarray, add_noise: bool = True) -> np.ndarray:
        state_t = torch.tensor(state, dtype=torch.float32).unsqueeze(0).to(self.device)
        self.actor.eval()
        with torch.no_grad():
            action = self.actor(state_t).cpu().numpy().flatten()
        self.actor.train()

        if add_noise:
            noise = np.random.normal(0, self.noise_std, size=action.shape)
            action = np.clip(action + noise, -1.0, 1.0)

        return action

    def select_discrete_action(self, state: np.ndarray) -> int:
        """Return the discrete action index via argmax of the actor output."""
        action = self.select_action(state, add_noise=False)
        return int(np.argmax(action))

    def store_transition(
        self,
        state: np.ndarray,
        action: int,
        reward: float,
        next_state: np.ndarray,
        done: bool,
    ) -> None:
        self.replay_buffer.push(state, action, reward, next_state, done)

    def update(self, batch_size: int = 64) -> Optional[float]:
        if not self.replay_buffer.is_ready(batch_size):
            return None

        states, actions, rewards, next_states, dones = self.replay_buffer.sample(batch_size)
        states = states.to(self.device)
        rewards = rewards.unsqueeze(1).to(self.device)
        next_states = next_states.to(self.device)
        dones = dones.unsqueeze(1).to(self.device)

        action_onehot = torch.zeros(batch_size, self.action_dim, device=self.device)
        action_onehot.scatter_(1, actions.unsqueeze(1).to(self.device), 1.0)

        with torch.no_grad():
            next_action = self.actor_target(next_states)
            target_q = rewards + self.gamma * self.critic_target(next_states, next_action) * (1 - dones)

        current_q = self.critic(states, action_onehot)
        critic_loss = nn.MSELoss()(current_q, target_q)

        self.critic_opt.zero_grad()
        critic_loss.backward()
        self.critic_opt.step()

        actor_loss = -self.critic(states, self.actor(states)).mean()

        self.actor_opt.zero_grad()
        actor_loss.backward()
        self.actor_opt.step()

        self._soft_update(self.actor, self.actor_target)
        self._soft_update(self.critic, self.critic_target)

        return critic_loss.item()

    def save(self, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save(
            {
                "actor": self.actor.state_dict(),
                "critic": self.critic.state_dict(),
                "actor_target": self.actor_target.state_dict(),
                "critic_target": self.critic_target.state_dict(),
            },
            path,
        )
        logger.info(f"DDPGAgent saved → {path}")

    def load(self, path: str | Path) -> None:
        ckpt = torch.load(path, map_location=self.device)
        self.actor.load_state_dict(ckpt["actor"])
        self.critic.load_state_dict(ckpt["critic"])
        self.actor_target.load_state_dict(ckpt["actor_target"])
        self.critic_target.load_state_dict(ckpt["critic_target"])
        logger.info(f"DDPGAgent loaded ← {path}")

    def _soft_update(self, source: nn.Module, target: nn.Module) -> None:
        for sp, tp in zip(source.parameters(), target.parameters()):
            tp.data.copy_(self.tau * sp.data + (1.0 - self.tau) * tp.data)

    @staticmethod
    def _copy_weights(source: nn.Module, target: nn.Module) -> None:
        target.load_state_dict(source.state_dict())