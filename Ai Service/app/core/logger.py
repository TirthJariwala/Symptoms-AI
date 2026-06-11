import sys
from loguru import logger
from app.core.config import settings


def configure_logging() -> None:
    logger.remove()  # remove default stderr handler

    log_level = "DEBUG" if settings.debug else "INFO"

    logger.add(
        sys.stderr,
        level=log_level,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        colorize=True,
    )

    logger.add(
        "logs/sdps_{time:YYYY-MM-DD}.log",
        rotation="00:00",
        retention="90 days",
        compression="gz",
        level=log_level,
        format="{time} | {level} | {name}:{function}:{line} | {message}",
    )


configure_logging()

__all__ = ["logger"]