import uuid
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from PIL import Image

from app.core.config import settings
from app.core.logger import logger

HEATMAP_DIR = Path("./reports/gradcam")
HEATMAP_DIR.mkdir(parents=True, exist_ok=True)


def generate_heatmap_overlay(
    original_image: np.ndarray,
    heatmap: np.ndarray,
    case_id: Optional[str] = None,
    alpha: float = 0.4,
) -> str:
    case_id = case_id or str(uuid.uuid4())[:8]

    h, w = original_image.shape[:2]
    if heatmap.shape != (h, w):
        heatmap = cv2.resize(heatmap, (w, h), interpolation=cv2.INTER_LINEAR)

    heatmap_uint8 = np.uint8(255 * heatmap)
    colormap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    colormap_rgb = cv2.cvtColor(colormap, cv2.COLOR_BGR2RGB)

    overlay = cv2.addWeighted(original_image, 1 - alpha, colormap_rgb, alpha, 0)

    output_path = HEATMAP_DIR / f"{case_id}_gradcam.png"
    Image.fromarray(overlay).save(output_path)
    logger.debug(f"Heatmap saved → {output_path}")

    return f"/reports/gradcam/{case_id}_gradcam.png"


def pil_to_rgb_array(image: Image.Image, target_size: int = 224) -> np.ndarray:
    image = image.resize((target_size, target_size)).convert("RGB")
    return np.array(image, dtype=np.uint8)