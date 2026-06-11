import random
from collections import deque
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np
import torch


@dataclass
class Transition:
    state: np.ndarray
    action: int
    reward: float
    next_state: np.ndarray
    done: bool


class ReplayBuffer:
    def __init__(self, capacity: int = 10_000) -> None:
        self.capacity = capacity
        self._buffer: deque = deque(maxlen=capacity)

    def push(
        self,
        state: np.ndarray,
        action: int,
        reward: float,
        next_state: np.ndarray,
        done: bool,
    ) -> None:
        self._buffer.append(Transition(state, action, reward, next_state, done))

    def sample(self, batch_size: int) -> Tuple[
        torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor
    ]:
        if len(self._buffer) < batch_size:
            raise ValueError(
                f"Buffer has {len(self._buffer)} samples, need {batch_size}."
            )

        batch: List[Transition] = random.sample(self._buffer, batch_size)

        states = torch.tensor(
            np.stack([t.state for t in batch]), dtype=torch.float32
        )
        actions = torch.tensor(
            [t.action for t in batch], dtype=torch.long
        )
        rewards = torch.tensor(
            [t.reward for t in batch], dtype=torch.float32
        )
        next_states = torch.tensor(
            np.stack([t.next_state for t in batch]), dtype=torch.float32
        )
        dones = torch.tensor(
            [t.done for t in batch], dtype=torch.float32
        )
        return states, actions, rewards, next_states, dones

    def __len__(self) -> int:
        return len(self._buffer)

    def is_ready(self, batch_size: int) -> bool:
        return len(self._buffer) >= batch_size