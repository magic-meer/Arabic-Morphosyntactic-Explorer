"""Pytest configuration and fixtures."""

import sys
from pathlib import Path

import pytest
from fastapi import FastAPI

# Add worktree backend path to sys.path
worktree_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(worktree_root))

from app.main import app
from app.services.corpus_parser import CorpusParser
from app.services.morphology import MorphologyService


@pytest.fixture
def corpus_parser() -> CorpusParser:
    """Create a CorpusParser instance."""
    return CorpusParser()


@pytest.fixture
def morphology_service() -> MorphologyService:
    """Create a MorphologyService instance."""
    from app.services.morphology import morphology_service

    return morphology_service


@pytest.fixture
def app_instance() -> FastAPI:
    """Return the FastAPI application instance."""
    return app
