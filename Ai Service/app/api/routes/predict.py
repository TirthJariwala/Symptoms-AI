import pathlib
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.dependencies import get_current_user, require_role
from app.core.config import settings
from app.core.constants import SUPPORTED_IMAGE_FORMATS
from app.core.logger import logger
from app.schemas.prediction_schema import (
    VALID_DOMAINS,
    BatchPredictionRequest,
    PredictionRequest,
    PredictionResponse,
)
from app.services.inference_service import run_batch_inference, run_inference
from app.services.storage_service import storage_service

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post(
    "",
    response_model=PredictionResponse,
    summary="Single image disease prediction",
    description=(
        "Upload a medical image (JPEG/PNG/DICOM) and receive a structured "
        "diagnostic prediction with Grad-CAM explainability. "
        "Leave domain as 'auto' to let the AI pick the best domain automatically."
    ),
)
async def predict_single(
    file: UploadFile = File(..., description="Medical image file (JPEG, PNG, or DICOM)."),
    cnn_architecture: str = Form(default="resnet50"),
    domain: str = Form(
        default="auto",          # ← changed from "chest_xray" to "auto"
        description=f"Model domain. One of: {sorted(VALID_DOMAINS)}. "
                    "Use 'auto' (default) to let the AI try all domains and return the best result.",
    ),
    patient_age: int = Form(default=None),
    patient_sex: str = Form(default=None),
    current_user: dict = Depends(get_current_user),
) -> PredictionResponse:
    # ── Validate file extension ───────────────────────────────────
    suffix = pathlib.Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED_IMAGE_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file format '{suffix}'. Allowed: {SUPPORTED_IMAGE_FORMATS}",
        )

    # ── Validate domain ───────────────────────────────────────────
    if domain not in VALID_DOMAINS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid domain '{domain}'. Must be one of: {sorted(VALID_DOMAINS)}",
        )

    saved_path = storage_service.save(file.file, file.filename or "upload")

    try:
        request = PredictionRequest(
            file_path=saved_path,
            cnn_architecture=cnn_architecture,
            domain=domain,
            patient_age=patient_age,
            patient_sex=patient_sex,
        )
    except Exception as val_exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_exc),
        )

    try:
        response = await run_inference(request)
    except Exception as exc:
        logger.error(f"Inference error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {str(exc)}",
        )

    logger.info(
        f"[AUDIT] user={current_user.get('sub')} | prediction"
        f" | case={response.case_id} | domain={domain}"
    )
    return response


@router.post(
    "/batch",
    response_model=List[PredictionResponse],
    summary="Batch image prediction (up to 100 images)",
    description="Run predictions on multiple pre-uploaded images. Use domain='auto' to detect best domain per image.",
    dependencies=[Depends(require_role("clinician", "admin", "data_scientist"))],
)
async def predict_batch(
    request: BatchPredictionRequest,
    current_user: dict = Depends(get_current_user),
) -> List[PredictionResponse]:
    if len(request.file_paths) > settings.max_batch_size:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Batch size exceeds maximum of {settings.max_batch_size}.",
        )

    try:
        results = await run_batch_inference(request)
    except Exception as exc:
        logger.error(f"Batch inference error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    logger.info(
        f"[AUDIT] user={current_user.get('sub')} | batch_prediction"
        f" | n={len(results)} | domain={request.domain}"
    )
    return results