from pathlib import Path
from typing import Dict, Tuple

import numpy as np
import pydicom
from PIL import Image

from app.core.logger import logger
from app.preprocessing.normalization import minmax_normalize_array


def load_dicom(file_path: str | Path) -> Tuple[np.ndarray, Dict]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"DICOM file not found: {path}")

    ds = pydicom.dcmread(str(path))
    logger.debug(f"Loaded DICOM: {path.name}")

    # ── Extract pixel data ────────────────────────────────────────
    raw_pixels = ds.pixel_array.astype(np.float32)

    # Apply DICOM window / rescale if present
    slope = float(getattr(ds, "RescaleSlope", 1))
    intercept = float(getattr(ds, "RescaleIntercept", 0))
    raw_pixels = raw_pixels * slope + intercept

    # Normalize to [0, 1]
    pixels_normalized = minmax_normalize_array(raw_pixels).astype(np.float32)

    # ── Extract metadata ──────────────────────────────────────────
    metadata = {
        "modality": str(getattr(ds, "Modality", "UNKNOWN")),
        "acquisition_date": str(getattr(ds, "AcquisitionDate", "")),
        "study_description": str(getattr(ds, "StudyDescription", "")),
        "rows": int(getattr(ds, "Rows", raw_pixels.shape[0])),
        "columns": int(getattr(ds, "Columns", raw_pixels.shape[1])),
        # Hash patient ID to avoid storing raw PHI (HIPAA)
        "patient_id_hash": _hash_patient_id(getattr(ds, "PatientID", "")),
        "bits_allocated": int(getattr(ds, "BitsAllocated", 16)),
    }

    return pixels_normalized, metadata


def dicom_to_pil(pixel_array: np.ndarray) -> Image.Image:
    uint8_array = (pixel_array * 255).clip(0, 255).astype(np.uint8)
    gray_image = Image.fromarray(uint8_array, mode="L")
    return gray_image.convert("RGB")


def _hash_patient_id(patient_id: str) -> str:
    """One-way SHA-256 hash of patient ID for HIPAA-safe logging."""
    import hashlib
    return hashlib.sha256(patient_id.encode()).hexdigest()[:16]