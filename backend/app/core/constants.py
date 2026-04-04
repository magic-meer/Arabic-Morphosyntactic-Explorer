"""Application constants."""

from enum import Enum


class APIVersion(str, Enum):
    """API version."""

    V1 = "v1"


class LogLevel(str, Enum):
    """Log levels."""

    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


# API prefixes
API_PREFIX = f"/api/{APIVersion.V1}"

# Corpus
CORPUS_HEADER_LINES = 57
