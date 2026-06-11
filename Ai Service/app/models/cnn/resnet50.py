from typing import Tuple

import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import ResNet50_Weights


class ResNet50Classifier(nn.Module):
    def __init__(
        self,
        num_classes: int = 5,
        pretrained: bool = True,
        freeze_backbone: bool = False,
    ) -> None:
        super().__init__()
        weights = ResNet50_Weights.IMAGENET1K_V2 if pretrained else None
        base = models.resnet50(weights=weights)

        # ── Feature extractor (everything up to the final avgpool) ─
        self.feature_extractor = nn.Sequential(
            base.conv1,
            base.bn1,
            base.relu,
            base.maxpool,
            base.layer1,
            base.layer2,
            base.layer3,
            base.layer4,
        )
        self.avgpool = base.avgpool          # -> (B, 2048, 1, 1)
        self.embedding_dim = 2048

        self.classifier = nn.Sequential(
            nn.Dropout(p=0.5),
            nn.Linear(self.embedding_dim, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.3),
            nn.Linear(512, num_classes),
        )

        if freeze_backbone:
            self._freeze_backbone()


    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        features = self.feature_extractor(x)
        pooled = self.avgpool(features)
        embedding = torch.flatten(pooled, 1)
        logits = self.classifier(embedding)
        return logits, embedding

    def extract_embedding(self, x: torch.Tensor) -> torch.Tensor:
        _, embedding = self.forward(x)
        return embedding


    def _freeze_backbone(self) -> None:
        for param in self.feature_extractor.parameters():
            param.requires_grad = False

    def unfreeze_all(self) -> None:
        for param in self.parameters():
            param.requires_grad = True