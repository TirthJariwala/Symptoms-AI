"""
app/training/medmnist_dataset.py
──────────────────────────────────
Real MedMNIST dataset loader.
Reads directly from F:\datasets\medmnist\ on your pendrive.
"""

import numpy as np
import torch
from torch.utils.data import Dataset
from torchvision import transforms
from medmnist import (
    ChestMNIST,
    OrganAMNIST,
    PneumoniaMNIST,
    DermaMNIST,
    OCTMNIST,
    BloodMNIST,
    PathMNIST,
    BreastMNIST,
)

from app.core.logger import logger

# ── Pendrive path ─────────────────────────────────────────────────
PENDRIVE_PATH = "G:\\datasets\\medmnist"

# ── Transforms ────────────────────────────────────────────────────
TRAIN_TRANSFORMS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

VAL_TRANSFORMS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


class MedMNISTWrapper(Dataset):
    """Wraps MedMNIST to convert grayscale→RGB and flatten labels."""

    def __init__(self, base_dataset, transform=None):
        self.base      = base_dataset
        self.transform = transform

    def __len__(self):
        return len(self.base)

    def __getitem__(self, idx):
        img, label = self.base[idx]

        if img.mode != "RGB":
            img = img.convert("RGB")

        if self.transform:
            img = self.transform(img)

        if isinstance(label, np.ndarray):
            label = int(label.flatten()[0])
        else:
            label = int(label)

        return img, label


def get_dataset(dataset_name: str, split: str = "train") -> MedMNISTWrapper:
    """
    Get a MedMNIST dataset by name.

    Args:
        dataset_name: chest_xray | pneumonia | organ_ct |
                      skin | retinal | blood | pathology | breast
        split:        train | val | test
    """
    transform = TRAIN_TRANSFORMS if split == "train" else VAL_TRANSFORMS

    registry = {
        "chest_xray": ChestMNIST,
        "pneumonia":  PneumoniaMNIST,
        "organ_ct":   OrganAMNIST,
        "skin":       DermaMNIST,
        "retinal":    OCTMNIST,
        "blood":      BloodMNIST,
        "pathology":  PathMNIST,
        "breast":     BreastMNIST,
    }

    if dataset_name not in registry:
        raise ValueError(
            f"Unknown dataset: {dataset_name}. "
            f"Choose from: {list(registry.keys())}"
        )

    DataClass = registry[dataset_name]
    base = DataClass(
        split=split,
        download=False,       # Already downloaded to pendrive
        root=PENDRIVE_PATH,
        size=224,
    )
    logger.info(f"{dataset_name} {split}: {len(base)} images")
    return MedMNISTWrapper(base, transform)


def get_num_classes(dataset_name: str) -> int:
    """Return number of classes for each dataset."""
    return {
        "chest_xray": 14,
        "pneumonia":   2,
        "organ_ct":   11,
        "skin":        7,
        "retinal":     4,
        "blood":       8,
        "pathology":   9,
        "breast":      2,
    }.get(dataset_name, 5)


def get_class_names(dataset_name: str) -> list:
    """Return human-readable class names."""
    return {
        "chest_xray": [
            "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
            "Mass", "Nodule", "Pneumonia", "Pneumothorax",
            "Consolidation", "Edema", "Emphysema", "Fibrosis",
            "Pleural Thickening", "Hernia"
        ],
        "pneumonia":  ["Normal", "Pneumonia"],
        "organ_ct":   [
            "Bladder", "Femur-L", "Femur-R", "Heart",
            "Kidney-L", "Kidney-R", "Liver", "Lung-L",
            "Lung-R", "Spleen", "Pancreas"
        ],
        "skin": [
            "Melanocytic nevi", "Melanoma", "Benign keratosis",
            "Basal cell carcinoma", "Actinic keratosis",
            "Vascular lesions", "Dermatofibroma"
        ],
        "retinal": [
            "Choroidal Neovascularization", "Diabetic Macular Edema",
            "Drusen", "Normal"
        ],
        "blood": [
            "Basophil", "Eosinophil", "Erythroblast",
            "Immunoglobulin", "Lymphocyte", "Monocyte",
            "Neutrophil", "Platelet"
        ],
        "pathology": [
            "Adipose", "Background", "Debris", "Lymphocytes",
            "Mucus", "Smooth muscle", "Normal colon mucosa",
            "Cancer-associated stroma", "Colorectal adenocarcinoma"
        ],
        "breast": ["Benign", "Malignant"],
    }.get(dataset_name, [f"class_{i}" for i in range(5)])