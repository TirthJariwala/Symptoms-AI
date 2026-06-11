from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

# Valid domains matching DOMAIN_MODEL_MAP in model_loader.py
# "auto" = system tries all domains and picks highest confidence
VALID_DOMAINS = {"auto", "default", "chest_xray", "blood", "breast", "organ_ct", "pneumonia", "skin"}


class PredictionRequest(BaseModel):
    image_base64: Optional[str] = Field(
        None, description="Base64-encoded image bytes (JPEG/PNG)."
    )
    file_path: Optional[str] = Field(
        None, description="Server-side path to uploaded image / DICOM file."
    )
    cnn_architecture: str = Field(
        "resnet50", description="CNN backbone: resnet50 | vgg16 | inceptionv3"
    )
    domain: str = Field(
        "auto",                  # ← changed from "chest_xray" to "auto"
        description="Model domain: auto | chest_xray | blood | breast | organ_ct | pneumonia | skin | default. "
                    "Use 'auto' to let the system try all domains and return the highest confidence result.",
    )
    patient_age: Optional[int] = Field(None, ge=0, le=130)
    patient_sex: Optional[str] = Field(None, pattern="^(M|F|O)$")
    clinical_notes: Optional[str] = Field(None, max_length=2000)

    @field_validator("cnn_architecture")
    @classmethod
    def validate_arch(cls, v: str) -> str:
        allowed = {"resnet50", "vgg16", "inceptionv3"}
        if v not in allowed:
            raise ValueError(f"cnn_architecture must be one of {allowed}")
        return v

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        if v not in VALID_DOMAINS:
            raise ValueError(f"domain must be one of {VALID_DOMAINS}")
        return v                 # "auto" passes through, resolved in inference_service


class BatchPredictionRequest(BaseModel):
    file_paths: List[str] = Field(..., min_length=1, max_length=100)
    cnn_architecture: str = "resnet50"
    domain: str = Field(
        "auto",                  # ← changed from "chest_xray" to "auto"
        description="Model domain applied to all images in the batch. "
                    "Use 'auto' to let the system detect the best domain per image.",
    )

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        if v not in VALID_DOMAINS:
            raise ValueError(f"domain must be one of {VALID_DOMAINS}")
        return v


class PredictionResponse(BaseModel):
    case_id: str
    predictions: Dict[str, float] = Field(
        ..., description="Disease class → probability mapping."
    )
    primary_diagnosis: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    action: str = Field(
        ..., description="RL-selected action: confirm_diagnosis | refer_specialist | request_further_imaging"
    )
    action_rationale: str
    gradcam_url: Optional[str] = None
    low_confidence_flag: bool = False
    severity: str = Field(..., description="normal | borderline | pathology")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    model_version: str = "1.0.0"