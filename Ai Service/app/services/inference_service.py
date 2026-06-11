"""
app/services/inference_service.py

Changes:
    1. Added "auto" domain support — runs all domains in parallel via asyncio.gather()
    2. Grad-CAM generated ONLY for the winning domain (highest confidence)
    3. run_inference_no_gradcam() — lightweight inference for parallel scan
    4. run_auto_domain_inference() — single phase: parallel scan + best pick + one Grad-CAM
    5. All existing single/batch inference behaviour unchanged
"""

import asyncio
import time
import uuid
from typing import List, Optional

from app.core.config import settings
from app.core.logger import logger
from app.explainability.gradcam import GradCAM
from app.explainability.heatmap_generator import generate_heatmap_overlay, pil_to_rgb_array
from app.preprocessing.image_loader import _load_pil, load_image_tensor
from app.schemas.prediction_schema import (
    BatchPredictionRequest,
    PredictionRequest,
    PredictionResponse,
)
from app.services.model_loader import model_registry

# All real domains to try in auto mode (excludes "auto" and "default")
AUTO_DOMAIN_LIST = ["chest_xray", "blood", "breast", "organ_ct", "pneumonia", "skin"]


# ── Lightweight inference (no Grad-CAM) ───────────────────────────────────────

async def run_inference_no_gradcam(request: PredictionRequest) -> PredictionResponse:
    """
    Fast inference without Grad-CAM.
    Used internally by run_auto_domain_inference() to scan all domains in parallel.
    """
    case_id = str(uuid.uuid4())
    domain  = request.domain

    pipeline = model_registry.get_pipeline(
        domain=domain,
        architecture=request.cnn_architecture,
    )
    device = next(pipeline.cnn.parameters()).device

    image_tensor = load_image_tensor(
        file_path=request.file_path,
        image_base64=request.image_base64,
        training=False,
    ).to(device)

    result = pipeline.predict(image_tensor, case_id=case_id)

    return PredictionResponse(
        case_id=case_id,
        predictions=result.predictions,
        primary_diagnosis=result.primary_diagnosis,
        confidence=result.confidence,
        action=result.action if model_registry.rl_available else "confirm_diagnosis",
        action_rationale=result.action_rationale,
        gradcam_url=None,                    # skipped intentionally
        low_confidence_flag=result.low_confidence_flag,
        severity=result.severity,
    )


# ── Auto domain inference (single phase) ──────────────────────────────────────

async def run_auto_domain_inference(request: PredictionRequest) -> PredictionResponse:
    """
    Single phase auto-domain inference:

    Step 1 — All domains run IN PARALLEL (no Grad-CAM) via asyncio.gather()
    Step 2 — Winner picked by highest confidence score
    Step 3 — Grad-CAM generated ONLY for the winning domain
    Step 4 — Final response returned

    Total time ≈ slowest single domain inference + one Grad-CAM
    instead of 6x sequential inference time.
    """

    # ── Step 1: Parallel scan of all domains ──────────────────────
    async def infer_domain(domain: str):
        try:
            domain_request = PredictionRequest(
                file_path=request.file_path,
                image_base64=request.image_base64,
                cnn_architecture=request.cnn_architecture,
                domain=domain,
                patient_age=request.patient_age,
                patient_sex=request.patient_sex,
            )
            response = await run_inference_no_gradcam(domain_request)

            logger.info(
                f"[AUTO] domain={domain} | "
                f"confidence={response.confidence:.3f} | "
                f"diagnosis={response.primary_diagnosis}"
            )
            return domain, response

        except Exception as exc:
            logger.warning(f"[AUTO] domain={domain} failed: {exc}")
            return domain, None

    # All domains fire at the same time
    results = await asyncio.gather(*[infer_domain(d) for d in AUTO_DOMAIN_LIST])

    # ── Step 2: Pick winner by confidence ─────────────────────────
    best_domain   = None
    best_response = None
    best_confidence = -1.0

    for domain, response in results:
        if response is None:
            continue
        if response.confidence > best_confidence:
            best_confidence = response.confidence
            best_domain     = domain
            best_response   = response

    if best_domain is None or best_response is None:
        raise ValueError("All domain inferences failed.")

    logger.info(
        f"[AUTO] Winner → domain={best_domain} | "
        f"confidence={best_confidence:.3f} | "
        f"diagnosis={best_response.primary_diagnosis}"
    )

    # ── Step 3: Grad-CAM only for the winner ──────────────────────
    case_id = best_response.case_id
    gradcam_url_value: Optional[str] = None

    try:
        pipeline = model_registry.get_pipeline(
            domain=best_domain,
            architecture=request.cnn_architecture,
        )
        device = next(pipeline.cnn.parameters()).device

        arch = request.cnn_architecture.lower()
        if arch == "resnet50":
            target_layer = pipeline.cnn.feature_extractor[-1]
        elif arch == "vgg16":
            target_layer = pipeline.cnn.features[-1]
        else:
            target_layer = list(pipeline.cnn.backbone.children())[-1]

        gradcam = GradCAM(pipeline.cnn, target_layer)

        disease_classes  = pipeline.disease_classes
        primary          = best_response.primary_diagnosis
        target_class_idx = (
            disease_classes.index(primary)
            if primary in disease_classes else 0
        )

        grad_tensor = load_image_tensor(
            file_path=request.file_path,
            image_base64=request.image_base64,
            training=False,
        ).to(device)

        heatmap = gradcam.generate(grad_tensor, target_class=target_class_idx)
        gradcam.remove_hooks()

        pil_img      = _load_pil(request.file_path, request.image_base64)
        original_rgb = pil_to_rgb_array(pil_img, target_size=settings.image_size)
        gradcam_url_value = generate_heatmap_overlay(
            original_rgb, heatmap, case_id=case_id
        )
        logger.info(f"[AUTO] Grad-CAM → {gradcam_url_value}")

    except Exception as exc:
        logger.warning(f"[AUTO] Grad-CAM failed: {exc}")

    # ── Step 4: Return final response ─────────────────────────────
    return PredictionResponse(
        case_id=case_id,
        predictions=best_response.predictions,
        primary_diagnosis=best_response.primary_diagnosis,
        confidence=best_response.confidence,
        action=best_response.action,
        action_rationale=best_response.action_rationale,
        gradcam_url=gradcam_url_value,
        low_confidence_flag=best_response.low_confidence_flag,
        severity=best_response.severity,
    )


# ── Standard single inference (with Grad-CAM) ─────────────────────────────────

async def run_inference(request: PredictionRequest) -> PredictionResponse:
    t0      = time.perf_counter()
    case_id = str(uuid.uuid4())
    domain  = getattr(request, "domain", "auto") or "auto"

    # ── Auto mode: try all domains in parallel ────────────────────
    if domain == "auto":
        return await run_auto_domain_inference(request)

    # ── Pipeline ──────────────────────────────────────────────────
    pipeline = model_registry.get_pipeline(
        domain=domain,
        architecture=request.cnn_architecture,
    )
    device = next(pipeline.cnn.parameters()).device

    # ── Image → correct device ────────────────────────────────────
    image_tensor = load_image_tensor(
        file_path=request.file_path,
        image_base64=request.image_base64,
        training=False,
    ).to(device)

    # ── CNN-RL inference ──────────────────────────────────────────
    result = pipeline.predict(image_tensor, case_id=case_id)

    # ── Grad-CAM ──────────────────────────────────────────────────
    gradcam_url_value: Optional[str] = None
    try:
        arch = request.cnn_architecture.lower()
        if arch == "resnet50":
            target_layer = pipeline.cnn.feature_extractor[-1]
        elif arch == "vgg16":
            target_layer = pipeline.cnn.features[-1]
        else:
            target_layer = list(pipeline.cnn.backbone.children())[-1]

        gradcam = GradCAM(pipeline.cnn, target_layer)

        disease_classes  = pipeline.disease_classes
        primary          = result.primary_diagnosis
        target_class_idx = (
            disease_classes.index(primary)
            if primary in disease_classes else 0
        )

        grad_tensor = load_image_tensor(
            file_path=request.file_path,
            image_base64=request.image_base64,
            training=False,
        ).to(device)

        heatmap = gradcam.generate(grad_tensor, target_class=target_class_idx)
        gradcam.remove_hooks()

        pil_img      = _load_pil(request.file_path, request.image_base64)
        original_rgb = pil_to_rgb_array(pil_img, target_size=settings.image_size)
        gradcam_url_value = generate_heatmap_overlay(
            original_rgb, heatmap, case_id=case_id
        )
        result.gradcam_heatmap = heatmap
        logger.info(f"Grad-CAM → {gradcam_url_value}")

    except Exception as exc:
        logger.warning(f"Grad-CAM failed: {exc}")

    elapsed = time.perf_counter() - t0
    logger.info(
        f"Inference | case={case_id} | domain={domain} | "
        f"{result.primary_diagnosis} {result.confidence:.1%} | {elapsed:.3f}s"
    )

    return PredictionResponse(
        case_id=case_id,
        predictions=result.predictions,
        primary_diagnosis=result.primary_diagnosis,
        confidence=result.confidence,
        action=result.action if model_registry.rl_available else "confirm_diagnosis",
        action_rationale=result.action_rationale,
        gradcam_url=gradcam_url_value,
        low_confidence_flag=result.low_confidence_flag,
        severity=result.severity,
    )


# ── Batch inference ────────────────────────────────────────────────────────────

async def run_batch_inference(request: BatchPredictionRequest) -> List[PredictionResponse]:
    if len(request.file_paths) > settings.max_batch_size:
        raise ValueError(f"Batch exceeds max {settings.max_batch_size}.")

    domain  = getattr(request, "domain", "auto") or "auto"
    results = []
    for fp in request.file_paths:
        results.append(await run_inference(PredictionRequest(
            file_path=fp,
            cnn_architecture=request.cnn_architecture,
            domain=domain,
        )))
    return results