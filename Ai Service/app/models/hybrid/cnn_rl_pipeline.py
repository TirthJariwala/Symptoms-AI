from dataclasses import dataclass
from typing import Dict, List, Optional

import numpy as np
import torch
import torch.nn.functional as F

from app.core.config import settings
from app.core.constants import SEVERITY_AMBER, SEVERITY_GREEN, SEVERITY_RED
from app.core.logger import logger
from app.models.cnn.resnet50 import ResNet50Classifier
from app.models.cnn.vgg16 import VGG16Classifier
from app.models.cnn.inceptionv3 import InceptionV3Classifier
from app.models.rl.dqn_agent import DQNAgent
from app.models.rl.ddpg_agent import DDPGAgent


@dataclass
class PredictionResult:
    case_id: str
    predictions: Dict[str, float]
    primary_diagnosis: str
    confidence: float
    action: str
    action_rationale: str
    embedding: np.ndarray
    low_confidence_flag: bool = False
    severity: str = SEVERITY_GREEN
    gradcam_heatmap: Optional[np.ndarray] = None


def _build_cnn(architecture: str, num_classes: int, device: torch.device):
    arch = architecture.lower()
    if arch == "resnet50":
        return ResNet50Classifier(num_classes=num_classes, pretrained=False).to(device)
    elif arch == "vgg16":
        return VGG16Classifier(num_classes=num_classes, pretrained=False).to(device)
    elif arch == "inceptionv3":
        return InceptionV3Classifier(num_classes=num_classes, pretrained=False).to(device)
    else:
        raise ValueError(f"Unknown CNN architecture: {architecture}")


class CNNRLPipeline:
    def __init__(
        self,
        cnn_architecture: str = "resnet50",
        agent_type: str = "dqn",
        device: Optional[str] = None,
        num_classes: Optional[int] = None,
        disease_classes: Optional[List[str]] = None,
    ) -> None:
        self.device = torch.device(
            device or ("cuda" if torch.cuda.is_available() else "cpu")
        )

        # ✅ Use domain-specific classes if provided, else fall back to global
        self.disease_classes: List[str] = (
            disease_classes if disease_classes is not None
            else settings.disease_classes
        )
        self.action_labels: List[str] = settings.rl_actions

        # ✅ Use provided num_classes or derive from disease_classes
        resolved_num_classes = (
            num_classes if num_classes is not None
            else len(self.disease_classes)
        )

        # CNN backbone built with correct class count
        self.cnn = _build_cnn(cnn_architecture, resolved_num_classes, self.device)
        self.cnn.eval()

        # RL agent
        self.agent_type = agent_type.lower()
        if self.agent_type == "dqn":
            self.agent: DQNAgent | DDPGAgent = DQNAgent(
                state_dim=settings.embedding_dim,
                n_actions=len(self.action_labels),
                action_labels=self.action_labels,
            )
        elif self.agent_type == "ddpg":
            self.agent = DDPGAgent(
                state_dim=settings.embedding_dim,
                action_dim=len(self.action_labels),
            )
        else:
            raise ValueError(f"Unknown agent type: {agent_type}")

        logger.info(
            f"CNNRLPipeline ready | CNN={cnn_architecture} | RL={agent_type} "
            f"| classes={resolved_num_classes} | device={self.device}"
        )

    @torch.no_grad()
    def predict(
        self, image_tensor: torch.Tensor, case_id: str = "case_000"
    ) -> PredictionResult:
        image_tensor = image_tensor.to(self.device)
        logits, embedding = self._forward(image_tensor)
        probs = F.softmax(logits, dim=1).squeeze(0).cpu().numpy()
        embedding_np = embedding.squeeze(0).cpu().numpy()
        return self._build_result(case_id, probs, embedding_np)

    def forward_with_gradients(
        self, image_tensor: torch.Tensor
    ) -> tuple[torch.Tensor, torch.Tensor]:
        image_tensor = image_tensor.to(self.device)
        return self._forward(image_tensor)

    def _forward(
        self, image_tensor: torch.Tensor
    ) -> tuple[torch.Tensor, torch.Tensor]:
        return self.cnn(image_tensor)

    def _build_result(
        self, case_id: str, probs: np.ndarray, embedding_np: np.ndarray
    ) -> PredictionResult:
        predictions = {
            cls: float(round(float(p), 4))
            for cls, p in zip(self.disease_classes, probs)
        }
        primary_idx = int(probs.argmax())
        primary_diagnosis = self.disease_classes[primary_idx]
        confidence = float(probs[primary_idx])

        if self.agent_type == "dqn":
            action_idx = self.agent.select_action(embedding_np)  # type: ignore[union-attr]
        else:
            action_idx = self.agent.select_discrete_action(embedding_np)  # type: ignore[union-attr]

        action = self.action_labels[action_idx]
        low_confidence = confidence < settings.confidence_threshold
        severity = _determine_severity(primary_diagnosis, confidence)
        rationale = _build_rationale(action, confidence, low_confidence, primary_diagnosis)

        return PredictionResult(
            case_id=case_id,
            predictions=predictions,
            primary_diagnosis=primary_diagnosis,
            confidence=round(confidence, 4),
            action=action,
            action_rationale=rationale,
            embedding=embedding_np,
            low_confidence_flag=low_confidence,
            severity=severity,
        )

    def load_cnn_weights(self, path: str) -> None:
        state = torch.load(path, map_location=self.device, weights_only=True)
        if isinstance(state, dict) and "model_state_dict" in state:
            state = state["model_state_dict"]

        missing, unexpected = self.cnn.load_state_dict(state, strict=False)

        if missing:
            logger.warning(f"CNN load | missing keys (random init): {missing}")
        if unexpected:
            logger.warning(f"CNN load | unexpected keys (ignored): {unexpected}")

        self.cnn.eval()
        logger.info(f"CNN weights loaded ← {path}")

    def load_rl_weights(self, path: str) -> None:
        self.agent.load(path)
        logger.info(f"RL weights loaded ← {path}")


def _determine_severity(primary: str, confidence: float) -> str:
    if primary == "normal":
        return SEVERITY_GREEN
    if confidence >= 0.70:
        return SEVERITY_RED
    return SEVERITY_AMBER


def _build_rationale(
    action: str, confidence: float, low_confidence: bool, primary: str
) -> str:
    if low_confidence:
        return (
            f"Confidence {confidence:.0%} is below the {settings.confidence_threshold:.0%} "
            "threshold. Clinician review strongly recommended before any clinical decision."
        )
    rationales = {
        "confirm_diagnosis": (
            f"High confidence detection of {primary} ({confidence:.0%}). "
            "Radiologist confirmation is recommended before treatment initiation."
        ),
        "refer_specialist": (
            f"Moderate confidence ({confidence:.0%}). Specialist referral recommended "
            "for further evaluation of detected findings."
        ),
        "request_further_imaging": (
            f"Imaging findings require additional views or modalities. "
            f"Current confidence: {confidence:.0%}."
        ),
    }
    return rationales.get(action, "See prediction details.")