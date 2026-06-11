from functools import lru_cache
from pathlib import Path
from typing import Dict, List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        protected_namespaces=("settings_",),
    )

    # ── Application ───────────────────────────────────────────────
    app_name: str = "SmartDiseasePredictionSystem"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "production"

    # ── Security ──────────────────────────────────────────────────
    secret_key: str = "changeme"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # ── Database ──────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://user:pass@localhost/sdps_db"
    redis_url: str = "redis://localhost:6379/0"

    # ── Storage ───────────────────────────────────────────────────
    storage_backend: str = "local"
    local_storage_path: Path = Path("./datasets")
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_bucket: str = "sdps-medical-images"

    # ── CNN Model Paths ───────────────────────────────────────────
    cnn_model_path_chest_xray: Path = Path("./saved_models/cnn/resnet50_chest_xray_best.pt")
    cnn_model_path_blood: Path = Path("./saved_models/cnn/resnet50_blood_best.pt")
    cnn_model_path_breast: Path = Path("./saved_models/cnn/resnet50_breast_best.pt")
    cnn_model_path_organ_ct: Path = Path("./saved_models/cnn/resnet50_organ_ct_best.pt")
    cnn_model_path_pneumonia: Path = Path("./saved_models/cnn/resnet50_pneumonia_best.pt")
    cnn_model_path_skin: Path = Path("./saved_models/cnn/resnet50_skin_best.pt")

    # ── RL Model Paths (per dataset) ──────────────────────────────
    rl_model_path_chest_xray: Path = Path("./saved_models/rl/dqn_chest_xray_policy.pt")
    rl_model_path_blood: Path = Path("./saved_models/rl/dqn_blood_policy.pt")
    rl_model_path_breast: Path = Path("./saved_models/rl/dqn_breast_policy.pt")
    rl_model_path_organ_ct: Path = Path("./saved_models/rl/dqn_organ_ct_policy.pt")
    rl_model_path_pneumonia: Path = Path("./saved_models/rl/dqn_pneumonia_policy.pt")
    rl_model_path_skin: Path = Path("./saved_models/rl/dqn_skin_policy.pt")

    model_registry_path: Path = Path("./saved_models")

    # ── ML Hyperparameters ────────────────────────────────────────
    cnn_learning_rate: float = 1e-4
    rl_gamma: float = 0.95
    rl_epsilon_start: float = 1.0
    rl_epsilon_end: float = 0.05
    rl_epsilon_decay: int = 300
    rl_replay_buffer_size: int = 10_000
    rl_batch_size: int = 64

    # ── Inference ─────────────────────────────────────────────────
    confidence_threshold: float = 0.70
    max_batch_size: int = 100

    # ── MLflow ────────────────────────────────────────────────────
    mlflow_tracking_uri: str = "http://localhost:5000"
    mlflow_experiment_name: str = "SDPS_Experiments"

    # ── CORS ──────────────────────────────────────────────────────
    allowed_origins: List[str] = ["http://localhost:3000"]

    # ── Image processing constants ────────────────────────────────
    image_size: int = 224
    embedding_dim: int = 2048

    # ── Disease classes per domain (must match training labels) ───
    disease_classes: List[str] = [
        "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
        "Mass", "Nodule", "Pneumonia", "Pneumothorax", "Consolidation",
        "Edema", "Emphysema", "Fibrosis", "Pleural Thickening", "Hernia",
    ]

    domain_classes: Dict[str, List[str]] = {
        "chest_xray": [
            "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
            "Mass", "Nodule", "Pneumonia", "Pneumothorax", "Consolidation",
            "Edema", "Emphysema", "Fibrosis", "Pleural Thickening", "Hernia",
        ],
        "blood": [
            "Basophil", "Eosinophil", "Erythroblast",
            "Immature Granulocyte", "Lymphocyte", "Monocyte",
            "Neutrophil", "Platelet",
        ],
        "breast": [
            "Benign", "Malignant",
        ],
        "organ_ct": [
            "Bladder", "Femur Left", "Femur Right", "Heart",
            "Kidney Left", "Kidney Right", "Liver", "Lung Left",
            "Lung Right", "Spleen", "Urinary Bladder",
        ],
        "pneumonia": [
            "Normal", "Pneumonia",
        ],
        "skin": [
            "Actinic Keratosis", "Basal Cell Carcinoma", "Dermatofibroma",
            "Melanoma", "Nevus", "Seborrheic Keratosis", "Vascular Lesion",
        ],
    }

    # ── RL actions ────────────────────────────────────────────────
    rl_actions: List[str] = [
        "confirm_diagnosis",
        "refer_specialist",
        "request_further_imaging",
    ]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton (thread-safe via lru_cache)."""
    return Settings()


settings = get_settings()