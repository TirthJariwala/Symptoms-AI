import numpy as np
import torch
from torchvision import transforms

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def get_inference_transforms(image_size: int = 224) -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )


def get_training_transforms(image_size: int = 224) -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(degrees=15),
            transforms.RandomResizedCrop(
                size=image_size, scale=(0.9, 1.1), ratio=(0.9, 1.1)
            ),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )


def zscore_normalize_array(array: np.ndarray) -> np.ndarray:
    array = array.astype(np.float64)
    mean = array.mean()
    std = array.std()
    if std < 1e-8:
        return array - mean          # avoid division by zero for flat arrays
    return (array - mean) / std


def minmax_normalize_array(array: np.ndarray) -> np.ndarray:
    array = array.astype(np.float64)
    lo, hi = array.min(), array.max()
    if hi == lo:
        return np.zeros_like(array)
    return (array - lo) / (hi - lo)