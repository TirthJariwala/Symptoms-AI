from typing import Literal, Tuple

import numpy as np
from sklearn.metrics import f1_score, brier_score_loss
from sklearn.preprocessing import label_binarize


def compute_f1(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    average: Literal["macro", "weighted", "micro"] = "weighted",
) -> float:
    return float(f1_score(y_true, y_pred, average=average, zero_division=0))


def compute_sensitivity_specificity(
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> Tuple[float, float]:

    classes = np.unique(y_true)
    sensitivities, specificities = [], []

    for cls in classes:
        tp = int(((y_true == cls) & (y_pred == cls)).sum())
        fn = int(((y_true == cls) & (y_pred != cls)).sum())
        tn = int(((y_true != cls) & (y_pred != cls)).sum())
        fp = int(((y_true != cls) & (y_pred == cls)).sum())

        sens = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        spec = tn / (tn + fp) if (tn + fp) > 0 else 0.0

        sensitivities.append(sens)
        specificities.append(spec)

    return float(np.mean(sensitivities)), float(np.mean(specificities))


def compute_brier_score(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    num_classes: int,
) -> float:

    y_onehot = label_binarize(y_true, classes=list(range(num_classes)))
    scores = [
        brier_score_loss(y_onehot[:, c], y_prob[:, c])
        for c in range(num_classes)
    ]
    return float(np.mean(scores))