from pathlib import Path
from typing import List

from app.core.config import settings
from app.core.logger import logger
from app.models.hybrid.cnn_rl_pipeline import CNNRLPipeline

# Maps domain key → Settings attribute name for CNN weights
DOMAIN_CNN_MAP: dict[str, str] = {
    "chest_xray": "cnn_model_path_chest_xray",
    "blood":      "cnn_model_path_blood",
    "breast":     "cnn_model_path_breast",
    "organ_ct":   "cnn_model_path_organ_ct",
    "pneumonia":  "cnn_model_path_pneumonia",
    "skin":       "cnn_model_path_skin",
}

# Maps domain key → Settings attribute name for RL weights
DOMAIN_RL_MAP: dict[str, str] = {
    "chest_xray": "rl_model_path_chest_xray",
    "blood":      "rl_model_path_blood",
    "breast":     "rl_model_path_breast",
    "organ_ct":   "rl_model_path_organ_ct",
    "pneumonia":  "rl_model_path_pneumonia",
    "skin":       "rl_model_path_skin",
}

# CNN architecture names — used to detect positional-arg misuse
_KNOWN_ARCHITECTURES = {"resnet50", "vgg16", "inceptionv3"}


class ModelRegistry:
    def __init__(self) -> None:
        self._pipelines: dict[str, CNNRLPipeline] = {}
        self._rl_available: bool = True

    def get_pipeline(
        self,
        domain: str = "chest_xray",
        architecture: str = "resnet50",
    ) -> CNNRLPipeline:
        # Guard: detect old-style positional call get_pipeline("resnet50")
        if domain in _KNOWN_ARCHITECTURES:
            logger.warning(
                f"get_pipeline() called with architecture '{domain}' as positional arg. "
                "Use get_pipeline(domain=..., architecture=...) instead. Auto-correcting."
            )
            architecture = domain
            domain = "chest_xray"

        # Normalise domain to lowercase
        domain = domain.lower()

        # Fallback unknown domains to chest_xray
        if domain not in DOMAIN_CNN_MAP:
            logger.warning(f"Unknown domain '{domain}'. Falling back to 'chest_xray'.")
            domain = "chest_xray"

        key = f"{architecture.lower()}_{domain}"
        if key not in self._pipelines:
            self._pipelines[key] = self._load(domain, architecture)
        return self._pipelines[key]

    def _load(self, domain: str, architecture: str) -> CNNRLPipeline:
        # ── Get correct classes for this domain ───────────────────
        domain_classes: List[str] = settings.domain_classes.get(
            domain, settings.disease_classes
        )

        pipeline = CNNRLPipeline(
            cnn_architecture=architecture,
            agent_type="dqn",
            num_classes=len(domain_classes),
            disease_classes=domain_classes,
        )

        # ── CNN weights ───────────────────────────────────────────
        cnn_attr = DOMAIN_CNN_MAP[domain]
        cnn_path = Path(getattr(settings, cnn_attr))

        if cnn_path.exists():
            try:
                pipeline.load_cnn_weights(str(cnn_path))
                logger.info(f"Loaded CNN weights | domain='{domain}' | path={cnn_path}")
            except Exception as exc:
                logger.warning(
                    f"CNN weights load failed | domain='{domain}': {exc}. "
                    "Using random weights."
                )
        else:
            logger.warning(
                f"CNN model file not found | domain='{domain}' | path={cnn_path}. "
                "Using uninitialised weights. Run training before serving predictions."
            )

        # ── RL weights (per domain) ───────────────────────────────
        rl_attr = DOMAIN_RL_MAP[domain]
        rl_path = Path(getattr(settings, rl_attr))

        if rl_path.exists():
            try:
                pipeline.load_rl_weights(str(rl_path))
                logger.info(f"Loaded RL weights  | domain='{domain}' | path={rl_path}")
            except Exception as exc:
                logger.warning(
                    f"RL model load failed | domain='{domain}': {exc}. "
                    "Predictions will use CNN-only output (graceful degradation)."
                )
                self._rl_available = False
        else:
            logger.warning(
                f"RL model file not found | domain='{domain}' | path={rl_path}. "
                "Predictions will use random RL policy. Run training before serving."
            )

        return pipeline

    def get_available_domains(self) -> list[str]:
        """Return all domain keys that have both CNN and RL model files on disk."""
        available = []
        for domain in DOMAIN_CNN_MAP:
            cnn_path = Path(getattr(settings, DOMAIN_CNN_MAP[domain]))
            rl_path  = Path(getattr(settings, DOMAIN_RL_MAP[domain]))
            if cnn_path.exists() and rl_path.exists():
                available.append(domain)
        return available

    @property
    def rl_available(self) -> bool:
        return self._rl_available


model_registry = ModelRegistry()