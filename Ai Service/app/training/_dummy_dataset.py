import numpy as np
import torch
from torch.utils.data import Dataset


class DummyMedicalDataset(Dataset):
    def __init__(
        self,
        n_samples: int = 200,
        num_classes: int = 5,
        image_size: int = 224,
    ) -> None:
        self.n_samples = n_samples
        self.num_classes = num_classes
        self.image_size = image_size

        rng = np.random.default_rng(seed=42)
        self._images = rng.random(
            (n_samples, 3, image_size, image_size), dtype=np.float32
        )
        self._labels = rng.integers(0, num_classes, size=n_samples)

    def __len__(self) -> int:
        return self.n_samples

    def __getitem__(self, idx: int):
        image = torch.tensor(self._images[idx])
        label = int(self._labels[idx])
        return image, label