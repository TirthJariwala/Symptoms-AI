from typing import Tuple

import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import VGG16_Weights


class VGG16Classifier(nn.Module):
    EMBEDDING_DIM = 2048

    def __init__(
        self,
        num_classes: int = 5,
        pretrained: bool = True,
        freeze_backbone: bool = False,
    ) -> None:
        super().__init__()
        weights = VGG16_Weights.IMAGENET1K_V1 if pretrained else None
        base = models.vgg16(weights=weights)

        self.features = base.features          # conv stack
        self.avgpool = base.avgpool            # adaptive avgpool -> (512, 7, 7)

        self.neck = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512 * 7 * 7, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, self.EMBEDDING_DIM),
            nn.ReLU(inplace=True),
        )

        self.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(self.EMBEDDING_DIM, num_classes),
        )

        if freeze_backbone:
            for param in self.features.parameters():
                param.requires_grad = False

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        features = self.features(x)
        pooled = self.avgpool(features)
        embedding = self.neck(pooled)
        logits = self.classifier(embedding)
        return logits, embedding

    def extract_embedding(self, x: torch.Tensor) -> torch.Tensor:
        _, embedding = self.forward(x)
        return embedding