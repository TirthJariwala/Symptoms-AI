from typing import Tuple

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from app.core.logger import logger
from app.utils.metrics import compute_f1, compute_sensitivity_specificity


def evaluate_model(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Tuple[float, float]:

    model.eval()
    total_loss, correct, total = 0.0, 0, 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            logits, _ = model(images)
            loss = criterion(logits, labels)

            total_loss += loss.item() * images.size(0)
            preds = logits.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += images.size(0)

    accuracy = correct / total if total > 0 else 0.0
    avg_loss = total_loss / total if total > 0 else 0.0
    return accuracy, avg_loss


def full_evaluation_report(
    model: nn.Module,
    loader: DataLoader,
    device: torch.device,
    class_names: list[str],
) -> dict:
    model.eval()
    all_preds, all_labels = [], []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            logits, _ = model(images)
            preds = logits.argmax(dim=1).cpu().numpy()
            all_preds.extend(preds.tolist())
            all_labels.extend(labels.numpy().tolist())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)

    accuracy = float((all_preds == all_labels).mean())
    f1 = compute_f1(all_labels, all_preds, average="weighted")
    sensitivity, specificity = compute_sensitivity_specificity(all_labels, all_preds)

    report = {
        "accuracy": round(accuracy, 4),
        "f1_weighted": round(f1, 4),
        "sensitivity": round(sensitivity, 4),
        "specificity": round(specificity, 4),
    }

    logger.info(f"Evaluation report: {report}")

    # SRS NFR-002 compliance checks
    if f1 < 0.88:
        logger.warning(f"F1 score {f1:.4f} below SRS requirement ≥ 0.88")
    if sensitivity < 0.90:
        logger.warning(f"Sensitivity {sensitivity:.4f} below SRS requirement ≥ 0.90")
    if specificity < 0.90:
        logger.warning(f"Specificity {specificity:.4f} below SRS requirement ≥ 0.90")

    return report