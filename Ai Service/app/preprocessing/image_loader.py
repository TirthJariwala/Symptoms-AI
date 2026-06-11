import io
import base64
from pathlib import Path
from typing import Optional

import torch
from PIL import Image

from app.core.config import settings
from app.core.logger import logger
from app.preprocessing.dicom_processor import dicom_to_pil, load_dicom
from app.preprocessing.normalization import get_inference_transforms, get_training_transforms


def load_image_tensor(
    file_path: Optional[str] = None,
    image_base64: Optional[str] = None,
    training: bool = False,
) -> torch.Tensor:
    transform = (
        get_training_transforms(settings.image_size)
        if training
        else get_inference_transforms(settings.image_size)
    )

    pil_image = _load_pil(file_path, image_base64)
    tensor = transform(pil_image).unsqueeze(0)  # add batch dim
    logger.debug(f"Image tensor shape: {tensor.shape}, dtype: {tensor.dtype}")
    return tensor


def _load_pil(file_path: Optional[str], image_base64: Optional[str]) -> Image.Image:
    if file_path:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Image file not found: {path}")

        suffix = path.suffix.lower()

        if suffix == ".dcm":
            pixel_array, _ = load_dicom(path)
            return dicom_to_pil(pixel_array)

        # ✅ All standard image formats supported by Pillow
        elif suffix in {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}:
            return Image.open(path).convert("RGB")

        else:
            raise ValueError(
                f"Unsupported file format '{suffix}'. "
                f"Allowed: .jpg .jpeg .png .bmp .tiff .tif .webp .dcm"
            )

    elif image_base64:
        raw_bytes = base64.b64decode(image_base64)
        return Image.open(io.BytesIO(raw_bytes)).convert("RGB")

    else:
        raise ValueError("Provide either file_path or image_base64.")