from typing import Tuple

import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import Inception_V3_Weights


class InceptionV3Classifier(nn.Module):
    EMBEDDING_DIM = 2048  # InceptionV3 pool output

    def __init__(
        self,
        num_classes: int = 5,
        pretrained: bool = True,
        freeze_backbone: bool = False,
    ) -> None:
        super().__init__()
        weights = Inception_V3_Weights.IMAGENET1K_V1 if pretrained else None
        base = models.inception_v3(weights=weights, aux_logits=False)

        # Remove original FC classifier
        self.backbone = nn.Sequential(
            *list(base.children())[:-1]   # everything except the final Linear
        )

        self.pool = nn.AdaptiveAvgPool2d((1, 1))

        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(self.EMBEDDING_DIM, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes),
        )

        if freeze_backbone:
            for param in self.backbone.parameters():
                param.requires_grad = False

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        # InceptionV3 works best with 299×299; interpolate if needed
        if x.shape[-1] != 299:
            x = torch.nn.functional.interpolate(x, size=(299, 299), mode="bilinear", align_corners=False)

        features = self.backbone(x)
        if isinstance(features, torch.Tensor) and features.dim() == 4:
            features = self.pool(features)
        embedding = torch.flatten(features, 1)       # (B, 2048)
        logits = self.classifier(embedding)
        return logits, embedding

    def extract_embedding(self, x: torch.Tensor) -> torch.Tensor:
        _, embedding = self.forward(x)
        return embedding