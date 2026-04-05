"""Logging configuration."""

import logging
import sys
from typing import Any

from app.config import settings


def setup_logging(name: str) -> logging.Logger:
    """Set up logger with application settings."""
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    logger.setLevel(settings.log_level)
    return logger


def get_logger(name: str) -> logging.Logger:
    """Get or create logger."""
    return logging.getLogger(name)
