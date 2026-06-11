import random
from typing import Tuple

import numpy as np
import torch
from PIL import Image, ImageFilter


def random_flip(image: Image.Image) -> Image.Image:
    if random.random() > 0.5:
        image = image.transpose(Image.FLIP_LEFT_RIGHT)
    if random.random() > 0.5:
        image = image.transpose(Image.FLIP_TOP_BOTTOM)
    return image


def random_rotation(image: Image.Image, max_degrees: float = 15.0) -> Image.Image:
    angle = random.uniform(-max_degrees, max_degrees)
    return image.rotate(angle, resample=Image.BILINEAR, expand=False)


def random_zoom(
    image: Image.Image, scale_range: Tuple[float, float] = (0.9, 1.1)
) -> Image.Image:
    scale = random.uniform(*scale_range)
    w, h = image.size
    new_w, new_h = int(w * scale), int(h * scale)
    image = image.resize((new_w, new_h), resample=Image.BILINEAR)
    # Centre-crop back to original size
    left = max(0, (new_w - w) // 2)
    top = max(0, (new_h - h) // 2)
    return image.crop((left, top, left + w, top + h))


def random_brightness_contrast(
    image: Image.Image,
    brightness_delta: float = 0.2,
    contrast_delta: float = 0.2,
) -> Image.Image:
    from PIL import ImageEnhance
    b_factor = random.uniform(1 - brightness_delta, 1 + brightness_delta)
    c_factor = random.uniform(1 - contrast_delta, 1 + contrast_delta)
    image = ImageEnhance.Brightness(image).enhance(b_factor)
    return ImageEnhance.Contrast(image).enhance(c_factor)


def random_gaussian_noise(
    image: Image.Image, sigma: float = 5.0
) -> Image.Image:
    arr = np.array(image, dtype=np.float32)
    noise = np.random.normal(0, sigma, arr.shape).astype(np.float32)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def apply_all_augmentations(image: Image.Image) -> Image.Image:
    if random.random() > 0.5:
        image = random_flip(image)
    if random.random() > 0.5:
        image = random_rotation(image)
    if random.random() > 0.5:
        image = random_zoom(image)
    if random.random() > 0.5:
        image = random_brightness_contrast(image)
    if random.random() > 0.5:
        image = random_gaussian_noise(image)
    return image