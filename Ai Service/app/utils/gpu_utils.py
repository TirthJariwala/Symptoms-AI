import torch

from app.core.logger import logger


def get_device(prefer_gpu: bool = True) -> torch.device:
    if prefer_gpu and torch.cuda.is_available():
        device = torch.device("cuda")
        props = torch.cuda.get_device_properties(device)
        logger.info(
            f"GPU detected: {props.name} | "
            f"VRAM: {props.total_memory / 1e9:.1f} GB | "
            f"CUDA: {torch.version.cuda}"
        )
    else:
        device = torch.device("cpu")
        logger.info("Running on CPU.")
    return device


def log_gpu_memory() -> None:
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated() / 1e9
        reserved = torch.cuda.memory_reserved() / 1e9
        logger.debug(f"GPU memory: allocated={allocated:.2f} GB | reserved={reserved:.2f} GB")


def clear_gpu_cache() -> None:
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        logger.debug("GPU cache cleared.")