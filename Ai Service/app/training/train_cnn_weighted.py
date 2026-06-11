"""
app/training/train_cnn_weighted.py
────────────────────────────────────
CNN training with weighted loss to fix class imbalance.
Fixes the Atelectasis-always problem in chest_xray model.

Usage:
    python -c "from app.training.train_cnn_weighted import train_cnn_weighted; train_cnn_weighted()"
"""

from pathlib import Path
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader

from app.core.config import settings
from app.core.logger import logger
from app.models.cnn.resnet50 import ResNet50Classifier
from app.models.cnn.vgg16 import VGG16Classifier
from app.models.cnn.inceptionv3 import InceptionV3Classifier
from app.training.evaluate import evaluate_model
from app.training.medmnist_dataset import (
    get_dataset,
    get_num_classes,
    get_class_names,
)

try:
    import mlflow
    MLFLOW_AVAILABLE = True
except Exception:
    MLFLOW_AVAILABLE = False
    logger.warning("MLflow not available.")


def _build_model(architecture: str, num_classes: int) -> nn.Module:
    arch = architecture.lower()
    if arch == "resnet50":
        return ResNet50Classifier(
            num_classes=num_classes, pretrained=True, freeze_backbone=True
        )
    elif arch == "vgg16":
        return VGG16Classifier(
            num_classes=num_classes, pretrained=True, freeze_backbone=True
        )
    elif arch == "inceptionv3":
        return InceptionV3Classifier(
            num_classes=num_classes, pretrained=True, freeze_backbone=True
        )
    raise ValueError(f"Unknown architecture: {architecture}")


def _compute_class_weights(
    dataset, num_classes: int, device: torch.device
) -> torch.Tensor:
    """
    Compute inverse frequency class weights.
    Rare classes get higher weights so model learns them better.

    Formula: weight[c] = total_samples / (num_classes * count[c])
    """
    logger.info("Computing class weights for balanced training...")

    loader = DataLoader(dataset, batch_size=512, shuffle=False, num_workers=0)
    class_counts = torch.zeros(num_classes)

    for _, labels in loader:
        for label in labels:
            class_counts[int(label)] += 1

    # Avoid division by zero
    class_counts = class_counts.clamp(min=1)

    # Inverse frequency weighting
    total = class_counts.sum()
    weights = total / (num_classes * class_counts)

    # Normalize weights
    weights = weights / weights.sum() * num_classes

    logger.info("Class weights computed:")
    class_names = get_class_names("chest_xray")
    for i, (name, count, weight) in enumerate(
        zip(class_names, class_counts, weights)
    ):
        logger.info(
            f"  {name:25s} | count={int(count):6d} | weight={weight:.4f}"
        )

    return weights.to(device)


def train_cnn_weighted(
    architecture: str = "resnet50",
    dataset_name: str = "chest_xray",
    epochs: int = 100,
    lr: float = 0.0001,
    batch_size: int = 32,
    unfreeze_after: int = 10,
    run_name: Optional[str] = None,
) -> str:
    """
    Train CNN with weighted loss to fix class imbalance.

    Key improvements over original train_cnn:
        1. Weighted CrossEntropyLoss — rare diseases get higher weight
        2. More epochs (100) — more time to learn rare classes
        3. Label smoothing — prevents overconfidence on majority class
        4. Gradient clipping — stable training
        5. Best model tracking per class accuracy

    Args:
        architecture:  CNN backbone.
        dataset_name:  Dataset name (chest_xray recommended).
        epochs:        Training epochs (100 recommended).
        lr:            Learning rate.
        batch_size:    Batch size.
        unfreeze_after: Epoch to unfreeze backbone.
        run_name:      MLflow run name.

    Returns:
        Path to saved best model.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    num_classes = get_num_classes(dataset_name)
    class_names = get_class_names(dataset_name)

    logger.info("=" * 60)
    logger.info("CNN Training WITH Weighted Loss (Class Imbalance Fix)")
    logger.info(f"  Architecture : {architecture}")
    logger.info(f"  Dataset      : {dataset_name}")
    logger.info(f"  Classes      : {num_classes}")
    logger.info(f"  Epochs       : {epochs}")
    logger.info(f"  Device       : {device}")
    logger.info("=" * 60)

    model = _build_model(architecture, num_classes).to(device)

    # ── Load datasets ─────────────────────────────────────────────
    logger.info("Loading datasets from F:\\datasets\\medmnist ...")
    train_ds = get_dataset(dataset_name, split="train")
    val_ds   = get_dataset(dataset_name, split="val")
    logger.info(f"  Train: {len(train_ds)} | Val: {len(val_ds)}")

    train_loader = DataLoader(
        train_ds, batch_size=batch_size,
        shuffle=True, num_workers=0
    )
    val_loader = DataLoader(
        val_ds, batch_size=batch_size,
        shuffle=False, num_workers=0
    )

    # ── Compute class weights ─────────────────────────────────────
    class_weights = _compute_class_weights(train_ds, num_classes, device)

    # ── Weighted loss with label smoothing ────────────────────────
    criterion = nn.CrossEntropyLoss(
        weight=class_weights,
        label_smoothing=0.1,   # prevents overconfidence
    )

    # ── Optimizer ─────────────────────────────────────────────────
    optimizer = torch.optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=lr,
        weight_decay=1e-4,
    )
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)

    # ── Save path ─────────────────────────────────────────────────
    best_model_path = (
        Path(settings.model_registry_path) / "cnn" /
        f"{architecture}_{dataset_name}_weighted_best.pt"
    )
    best_model_path.parent.mkdir(parents=True, exist_ok=True)

    best_val_acc     = 0.0
    no_improve_count = 0
    prev_best        = 0.0

    logger.info("Starting training with weighted loss...")

    for epoch in range(1, epochs + 1):

        # ── Unfreeze backbone ─────────────────────────────────────
        if unfreeze_after > 0 and epoch == unfreeze_after:
            if hasattr(model, "unfreeze_all"):
                model.unfreeze_all()
                optimizer = torch.optim.AdamW(
                    model.parameters(),
                    lr=lr * 0.1,
                    weight_decay=1e-4,
                )
                scheduler = CosineAnnealingLR(
                    optimizer, T_max=epochs - epoch, eta_min=1e-7
                )
                logger.info(f"Epoch {epoch}: Backbone unfrozen")

        # ── Training ──────────────────────────────────────────────
        model.train()
        train_loss, correct, total = 0.0, 0, 0

        for batch_idx, (images, labels) in enumerate(train_loader):
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            logits, _ = model(images)
            loss = criterion(logits, labels)
            loss.backward()

            # Gradient clipping
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            correct    += (logits.argmax(1) == labels).sum().item()
            total      += images.size(0)

            if (batch_idx + 1) % 200 == 0:
                logger.info(
                    f"  Epoch {epoch} | Batch {batch_idx+1}/"
                    f"{len(train_loader)} | Loss: {loss.item():.4f}"
                )

        train_acc      = correct / total
        avg_train_loss = train_loss / total

        # ── Validation ────────────────────────────────────────────
        val_acc, val_loss = evaluate_model(
            model, val_loader, criterion, device
        )
        scheduler.step()

        logger.info(
            f"Epoch {epoch}/{epochs} | "
            f"train_acc={train_acc*100:.1f}% | "
            f"val_acc={val_acc*100:.1f}% | "
            f"lr={scheduler.get_last_lr()[0]:.6f}"
        )

        # ── Per-class accuracy check (every 10 epochs) ────────────
        if epoch % 10 == 0:
            _log_per_class_accuracy(
                model, val_loader, device, class_names, num_classes
            )

        # ── Save best ─────────────────────────────────────────────
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                "epoch":                epoch,
                "architecture":         architecture,
                "dataset":              dataset_name,
                "num_classes":          num_classes,
                "class_names":          class_names,
                "model_state_dict":     model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc":              val_acc,
                "weighted_loss":        True,
            }, best_model_path)
            logger.info(
                f"  ✅ Best model saved! val_acc={val_acc*100:.1f}%"
            )

    logger.info("=" * 60)
    logger.info("✅ Weighted Training Complete!")
    logger.info(f"   Best val_acc : {best_val_acc*100:.1f}%")
    logger.info(f"   Saved to     : {best_model_path}")
    logger.info("=" * 60)

    # ── Update .env suggestion ────────────────────────────────────
    logger.info(
        f"\n📝 Update your .env:\n"
        f"CNN_MODEL_PATH=./saved_models/cnn/"
        f"{architecture}_{dataset_name}_weighted_best.pt"
    )

    return str(best_model_path)


def _log_per_class_accuracy(
    model, loader, device, class_names, num_classes
) -> None:
    """Log per-class accuracy to identify which diseases are being missed."""
    model.eval()
    class_correct = torch.zeros(num_classes)
    class_total   = torch.zeros(num_classes)

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            logits, _ = model(images)
            preds = logits.argmax(1).cpu()

            for label, pred in zip(labels, preds):
                class_total[label] += 1
                if label == pred:
                    class_correct[label] += 1

    logger.info("  Per-class accuracy:")
    for i, name in enumerate(class_names):
        if class_total[i] > 0:
            acc = class_correct[i] / class_total[i]
            bar = "█" * int(acc * 20)
            logger.info(
                f"    {name:25s} | {acc*100:5.1f}% | {bar}"
            )