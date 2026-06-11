"""
app/training/train_cnn.py
──────────────────────────
CNN training script using real MedMNIST medical images.

Usage:
    # Train on chest X-rays (14 diseases):
    python -c "from app.training.train_cnn import train_cnn; train_cnn(dataset_name='chest_xray')"

    # Train on ALL datasets:
    python -c "from app.training.train_cnn import train_all; train_all()"
"""

from pathlib import Path
from typing import Optional

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
    logger.warning("MLflow not available — training without experiment tracking.")


def _build_model(architecture: str, num_classes: int) -> nn.Module:
    arch = architecture.lower()
    if arch == "resnet50":
        return ResNet50Classifier(num_classes=num_classes, pretrained=True, freeze_backbone=True)
    elif arch == "vgg16":
        return VGG16Classifier(num_classes=num_classes, pretrained=True, freeze_backbone=True)
    elif arch == "inceptionv3":
        return InceptionV3Classifier(num_classes=num_classes, pretrained=True, freeze_backbone=True)
    raise ValueError(f"Unknown architecture: {architecture}")


def train_cnn(
    architecture: str = "resnet50",
    dataset_name: str = "chest_xray",
    epochs: int = 50,
    lr: float = 0.0001,
    batch_size: int = 32,
    run_name: Optional[str] = None,
    early_stopping: bool = False,
    early_stopping_patience: int = 10,
    unfreeze_after: int = 10,
) -> str:
    """
    Train CNN on real MedMNIST medical images.

    Args:
        architecture:            CNN backbone (resnet50 | vgg16 | inceptionv3).
        dataset_name:            Dataset: chest_xray | pneumonia | organ_ct |
                                 skin | retinal | blood | pathology
        epochs:                  Total training epochs.
        lr:                      Initial learning rate.
        batch_size:              Training batch size.
        run_name:                MLflow run name.
        early_stopping:          Enable early stopping.
        early_stopping_patience: Epochs without improvement before stop.
        unfreeze_after:          Epoch to unfreeze backbone for fine-tuning.

    Returns:
        Path to saved best model checkpoint.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    num_classes = get_num_classes(dataset_name)
    class_names = get_class_names(dataset_name)

    logger.info("=" * 60)
    logger.info(f"CNN Training Starting")
    logger.info(f"  Architecture : {architecture}")
    logger.info(f"  Dataset      : {dataset_name}")
    logger.info(f"  Classes      : {num_classes}")
    logger.info(f"  Epochs       : {epochs}")
    logger.info(f"  Device       : {device}")
    logger.info(f"  Batch size   : {batch_size}")
    logger.info("=" * 60)

    model = _build_model(architecture, num_classes).to(device)

    logger.info("Loading datasets from F:\\datasets\\medmnist ...")
    try:
        train_ds = get_dataset(dataset_name, split="train")
        val_ds   = get_dataset(dataset_name, split="val")
        logger.info(f"  Train: {len(train_ds)} | Val: {len(val_ds)}")
    except Exception as e:
        logger.error(f"Dataset load failed: {e}")
        logger.error("Run: python download_datasets.py first!")
        raise

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=batch_size, shuffle=False, num_workers=0)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=lr, weight_decay=1e-4
    )
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)

    best_model_path = (
        Path(settings.model_registry_path) / "cnn" /
        f"{architecture}_{dataset_name}_best.pt"
    )
    best_model_path.parent.mkdir(parents=True, exist_ok=True)

    def _log_params(p):
        if MLFLOW_AVAILABLE:
            try: mlflow.log_params(p)
            except: pass

    def _log_metrics(m, step):
        if MLFLOW_AVAILABLE:
            try: mlflow.log_metrics(m, step=step)
            except: pass

    if MLFLOW_AVAILABLE:
        try:
            mlflow.set_tracking_uri(settings.mlflow_tracking_uri)
            mlflow.set_experiment(settings.mlflow_experiment_name)
            active_run = mlflow.start_run(run_name=run_name or f"{architecture}_{dataset_name}")
        except:
            active_run = None
    else:
        active_run = None

    try:
        _log_params({
            "architecture": architecture, "dataset": dataset_name,
            "num_classes": num_classes, "epochs": epochs, "lr": lr,
        })

        best_val_acc     = 0.0
        no_improve_count = 0
        prev_best        = 0.0

        for epoch in range(1, epochs + 1):

            # Unfreeze backbone for fine-tuning after N epochs
            if unfreeze_after > 0 and epoch == unfreeze_after:
                if hasattr(model, "unfreeze_all"):
                    model.unfreeze_all()
                    optimizer = torch.optim.Adam(
                        model.parameters(), lr=lr * 0.1, weight_decay=1e-4
                    )
                    scheduler = CosineAnnealingLR(
                        optimizer, T_max=epochs - epoch, eta_min=1e-7
                    )
                    logger.info(f"Epoch {epoch}: Backbone unfrozen for fine-tuning")

            # Training loop
            model.train()
            train_loss, correct, total = 0.0, 0, 0

            for batch_idx, (images, labels) in enumerate(train_loader):
                images, labels = images.to(device), labels.to(device)
                optimizer.zero_grad()
                logits, _ = model(images)
                loss = criterion(logits, labels)
                loss.backward()
                nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()

                train_loss += loss.item() * images.size(0)
                correct    += (logits.argmax(1) == labels).sum().item()
                total      += images.size(0)

                if (batch_idx + 1) % 100 == 0:
                    logger.info(
                        f"  Epoch {epoch} | Batch {batch_idx+1}/{len(train_loader)} | "
                        f"Loss: {loss.item():.4f}"
                    )

            train_acc      = correct / total
            avg_train_loss = train_loss / total

            val_acc, val_loss = evaluate_model(model, val_loader, criterion, device)
            scheduler.step()

            _log_metrics({
                "train_loss": avg_train_loss, "train_acc": train_acc,
                "val_loss": val_loss, "val_acc": val_acc,
            }, step=epoch)

            logger.info(
                f"Epoch {epoch}/{epochs} | "
                f"train_acc={train_acc:.4f} ({train_acc*100:.1f}%) | "
                f"val_acc={val_acc:.4f} ({val_acc*100:.1f}%) | "
                f"lr={scheduler.get_last_lr()[0]:.6f}"
            )

            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save({
                    "epoch": epoch, "architecture": architecture,
                    "dataset": dataset_name, "num_classes": num_classes,
                    "class_names": class_names,
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "val_acc": val_acc,
                }, best_model_path)
                logger.info(f"  ✅ Best model saved! val_acc={val_acc*100:.1f}%")

            if early_stopping:
                if val_acc - prev_best > 0.001:
                    prev_best        = val_acc
                    no_improve_count = 0
                else:
                    no_improve_count += 1
                if no_improve_count >= early_stopping_patience:
                    logger.info(f"Early stopping at epoch {epoch}")
                    break

        _log_metrics({"best_val_acc": best_val_acc}, step=epochs)

    finally:
        if MLFLOW_AVAILABLE and active_run is not None:
            try: mlflow.end_run()
            except: pass

    logger.info("=" * 60)
    logger.info(f"✅ Training Complete!")
    logger.info(f"   Dataset      : {dataset_name}")
    logger.info(f"   Best val_acc : {best_val_acc*100:.1f}%")
    logger.info(f"   Saved to     : {best_model_path}")
    logger.info("=" * 60)
    return str(best_model_path)


def train_all(architecture: str = "resnet50", epochs: int = 50) -> None:
    """Train CNN on ALL available datasets sequentially."""
    datasets = [
        "chest_xray",
        "pneumonia",
        "organ_ct",
        "skin",
        "retinal",
        "blood",
    ]
    logger.info(f"Training on {len(datasets)} datasets sequentially...")
    for dataset_name in datasets:
        logger.info(f"\n{'='*60}")
        logger.info(f"Starting: {dataset_name}")
        logger.info(f"{'='*60}")
        try:
            path = train_cnn(
                architecture=architecture,
                dataset_name=dataset_name,
                epochs=epochs,
            )
            logger.info(f"✅ {dataset_name} complete → {path}")
        except Exception as e:
            logger.error(f"❌ {dataset_name} failed: {e}")
    logger.info("\n🎉 All datasets trained!")