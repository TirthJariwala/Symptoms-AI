REWARD_CORRECT_DIAGNOSIS: float = 1.0
REWARD_INCORRECT_DIAGNOSIS: float = -0.5
REWARD_CORRECT_REFERRAL: float = 0.2
REWARD_UNNECESSARY_REFERRAL: float = -0.1

CNN_ARCHITECTURES = ("resnet50", "vgg16", "inceptionv3")

RL_AGENTS = ("dqn", "ddpg")

SEVERITY_GREEN = "normal"
SEVERITY_AMBER = "borderline"
SEVERITY_RED = "pathology"

SUPPORTED_IMAGE_FORMATS = {
    ".jpg",   # JPEG
    ".jpeg",  # JPEG
    ".png",   # PNG
    ".bmp",   # Bitmap
    ".tiff",  # TIFF
    ".tif",   # TIFF
    ".webp",  # WebP
    ".dcm",   # DICOM (kept for backward compatibility)
}

EXPORT_FORMATS = ("pdf", "csv")

AUDIT_RETENTION_YEARS: int = 6