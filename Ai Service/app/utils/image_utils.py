from pathlib import Path
from typing import Tuple

import numpy as np
from PIL import Image


def validate_image_size(
    image: Image.Image, min_size: int = 32
) -> bool:
    w, h = image.size
    return w >= min_size and h >= min_size


def tensor_to_pil(tensor) -> Image.Image:
    import torch
    mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
    std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
    denorm = tensor * std + mean
    denorm = denorm.clamp(0, 1)
    array = (denorm.permute(1, 2, 0).numpy() * 255).astype(np.uint8)
    return Image.fromarray(array)


def get_image_metadata(path: str | Path) -> dict:
    path = Path(path)
    with Image.open(path) as img:
        return {
            "filename": path.name,
            "format": img.format,
            "mode": img.mode,
            "width": img.width,
            "height": img.height,
            "size_bytes": path.stat().st_size,
        }