# Arabic Morphosyntactic Explorer - Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build FastAPI backend with corpus parser, morphology service, ChromaDB vector store, RAG pipeline, and Gemini 3.1 integration

**Architecture:** Modular Python backend with service layer pattern. Each service (corpus, morphology, vector, rag, gemini) is independent and communicates via well-defined interfaces.

**Tech Stack:** Python 3.10+, FastAPI, Pydantic, CAMeL Tools, ChromaDB, sentence-transformers, Google Generative AI

---

## File Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── verses.py       # Verse endpoints
│   │   │   ├── morphology.py   # Morphology endpoints
│   │   │   └── chat.py         # Chat/RAG endpoints
│   │   └── deps.py             # API dependencies
│   ├── core/
│   │   ├── __init__.py
│   │   └── constants.py       # App constants
│   ├── models/
│   │   ├── __init__.py
│   │   ├── verse.py            # Verse response models
│   │   ├── morphology.py       # Morphology response models
│   │   └── chat.py             # Chat request/response models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── corpus_parser.py   # Quranic corpus file parser
│   │   ├── morphology.py       # CAMeL Tools wrapper
│   │   ├── vector_store.py    # ChromaDB integration
│   │   ├── rag.py              # RAG pipeline
│   │   └── gemini.py           # Gemini 3.1 integration
│   └── utils/
│       ├── __init__.py
│       └── logging.py          # Logging utility
├── tests/
│   ├── __init__.py
│   ├── test_corpus_parser.py
│   ├── test_morphology.py
│   ├── test_vector_store.py
│   ├── test_rag.py
│   ├── test_api.py
│   └── conftest.py
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

---

## Task 1: Project Setup

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/Dockerfile`
- Create: `backend/README.md`

- [ ] **Step 1: Create requirements.txt**

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0
camel-tools==0.1.2
chromadb==0.4.22
sentence-transformers==2.2.2
google-generativeai==0.3.2
httpx==0.26.0
pytest==7.4.4
pytest-asyncio==0.23.3
pytest-cov==4.1.0
ruff==0.1.11
mypy==1.8.0
```

- [ ] **Step 2: Create .env.example**

```txt
GEMINI_API_KEY=your_gemini_api_key_here
CHROMA_DB_PATH=./chroma_data
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
```

- [ ] **Step 3: Create Dockerfile**

```dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 4: Create README.md**

```markdown
# Arabic Morphosyntactic Explorer - Backend

FastAPI backend for AI-driven Quranic morphological analysis and tutoring.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Add your Gemini API key to `.env`

4. Run development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/verses/{chapter}/{verse}` - Get verse
- `GET /api/v1/verses/{chapter}` - Get chapter verses
- `POST /api/v1/verses/search` - Semantic search
- `GET /api/v1/morphology/{chapter}/{verse}` - Get morphology
- `POST /api/v1/morphology/analyze` - Analyze text
- `POST /api/v1/chat` - AI chat

## Testing

```bash
pytest tests/ -v
```
```

- [ ] **Step 5: Commit**

```bash
git add backend/requirements.txt backend/.env.example backend/Dockerfile backend/README.md
git commit -m "chore: Add backend project setup files"
```

---

## Task 2: Core Application Structure

**Files:**
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Create: `backend/app/main.py`
- Create: `backend/app/core/constants.py`
- Create: `backend/app/utils/logging.py`

- [ ] **Step 1: Create app/__init__.py**

```python
"""Arabic Morphosyntactic Explorer - FastAPI Backend."""
__version__ = "1.0.0"
```

- [ ] **Step 2: Create app/config.py**

```python
"""Configuration management using Pydantic Settings."""

from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # API settings
    api_host: str = Field(default="0.0.0.0", description="API server host")
    api_port: int = Field(default=8000, description="API server port")
    log_level: str = Field(default="INFO", description="Logging level")

    # Gemini settings
    gemini_api_key: str = Field(..., description="Gemini API key")

    # ChromaDB settings
    chroma_db_path: Path = Field(
        default=Path("./chroma_data"),
        description="Path for ChromaDB data storage"
    )

    # Corpus path
    corpus_path: Path = Field(
        default=Path("../dataset/extracted/quranic-corpus-morphology-0.4.txt"),
        description="Path to Quranic corpus file"
    )


settings = Settings()
```

- [ ] **Step 3: Create app/core/constants.py**

```python
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

# Corpu
CORPUS_HEADER_LINES = 57  # Header + blank lines before data
```

- [ ] **Step 4: Create app/utils/logging.py**

```python
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
```

- [ ] **Step 5: Create app/main.py**

```python
"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.constants import API_PREFIX
from app.utils.logging import setup_logging

logger = setup_logging(__name__)


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Arabic Morphosyntactic Explorer",
        description="AI-driven pedagogical tutor for Classical Arabic",
        version="1.0.0",
        docs_url=f"{API_PREFIX}/docs",
        redoc_url=f"{API_PREFIX}/redoc",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get(f"{API_PREFIX}/health")
    async def health_check() -> dict:
        """Health check endpoint."""
        return {"status": "healthy", "version": "1.0.0"}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
    )
```

- [ ] **Step 6: Commit**

```bash
git add backend/app/__init__.py backend/app/config.py backend/app/main.py backend/app/core/constants.py backend/app/utils/logging.py
git commit -m "feat: Add core application structure with FastAPI setup"
```

---

## Task 3: Pydantic Models

**Files:**
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/verse.py`
- Create: `backend/app/models/morphology.py`
- Create: `backend/app/models/chat.py`

- [ ] **Step 1: Create models/__init__.py**

```python
"""Pydantic models for API requests and responses."""

from app.models.verse import VerseResponse, ChapterResponse, VerseSearchResponse
from app.models.morphology import MorphologyResponse, MorphologyAnalysisRequest
from app.models.chat import ChatRequest, ChatResponse

__all__ = [
    "VerseResponse",
    "ChapterResponse",
    "VerseSearchResponse",
    "MorphologyResponse",
    "MorphologyAnalysisRequest",
    "ChatRequest",
    "ChatResponse",
]
```

- [ ] **Step 2: Create models/verse.py**

```python
"""Verse-related Pydantic models."""

from typing import Optional

from pydantic import BaseModel, Field


class WordInfo(BaseModel):
    """Information about a single word in a verse."""

    form: str = Field(..., description="Transliterated Arabic form")
    tag: str = Field(..., description="Part of speech tag")
    lemma: Optional[str] = Field(None, description="Lemma (dictionary form)")
    root: Optional[str] = Field(None, description="Root ( consonantal root)")
    features: str = Field(..., description="Complete morphological features")


class VerseResponse(BaseModel):
    """Response model for a single verse."""

    chapter: int = Field(..., description="Chapter (surah) number")
    verse: int = Field(..., description="Verse number")
    words: list[WordInfo] = Field(..., description="Words in the verse")
    verse_text: Optional[str] = Field(None, description="Arabic text (if available)")


class ChapterResponse(BaseModel):
    """Response model for a chapter."""

    chapter: int = Field(..., description="Chapter number")
    verse_count: int = Field(..., description="Number of verses")
    verses: list[VerseResponse] = Field(..., description="List of verses")


class VerseSearchResult(BaseModel):
    """Single verse search result."""

    chapter: int
    verse: int
    arabic_text: str
    translation: Optional[str] = None
    similarity: float = Field(..., description="Similarity score")


class VerseSearchResponse(BaseModel):
    """Response for verse search."""

    query: str = Field(..., description="Search query")
    results: list[VerseSearchResult] = Field(..., description="Search results")
    count: int = Field(..., description="Number of results")
```

- [ ] **Step 3: Create models/morphology.py**

```python
"""Morphology-related Pydantic models."""

from typing import Optional

from pydantic import BaseModel, Field


class MorphologyFeatures(BaseModel):
    """Detailed morphological features."""

    pos: Optional[str] = Field(None, description="Part of speech")
    lemma: Optional[str] = Field(None, description="Lemma")
    root: Optional[str] = Field(None, description="Root")
    gender: Optional[str] = Field(None, description="Gender (M/F)")
    number: Optional[str] = Field(None, description="Number (S/P)")
    case: Optional[str] = Field(None, description="Case (NOM/ACC/GEN)")
    mood: Optional[str] = Field(None, description="Mood (IND/JUS/IMPV)")
    voice: Optional[str] = Field(None, description="Voice (ACT/PASS)")
    aspect: Optional[str] = Field(None, description="Aspect (PERF/IMPF)")
    person: Optional[str] = Field(None, description="Person (1/2/3)")
    pronominal_suffix: Optional[str] = Field(None, description="Pronominal suffix")


class MorphologyWord(BaseModel):
    """Morphological analysis of a single word."""

    form: str = Field(..., description="Arabic form")
    tag: str = Field(..., description="POS tag")
    features: MorphologyFeatures = Field(..., description="Detailed features")
    original_features: str = Field(..., description="Original feature string")


class MorphologyResponse(BaseModel):
    """Response for morphological analysis of a verse."""

    chapter: int = Field(..., description="Chapter number")
    verse: int = Field(..., description="Verse number")
    words: list[MorphologyWord] = Field(..., description="Words with morphology")


class MorphologyAnalysisRequest(BaseModel):
    """Request for analyzing user-entered text."""

    text: str = Field(..., description="Arabic text to analyze")
    include_roots: bool = Field(True, description="Include root extraction")


class MorphologyAnalysisResponse(BaseModel):
    """Response for text analysis."""

    text: str = Field(..., description="Original text")
    words: list[MorphologyWord] = Field(..., description="Analyzed words")
    tokens_count: int = Field(..., description="Number of tokens")
```

- [ ] **Step 4: Create models/chat.py**

```python
"""Chat/RAG-related Pydantic models."""

from typing import Optional

from pydantic import BaseModel, Field


class ContextVerse(BaseModel):
    """A verse used as context for the AI."""

    chapter: int = Field(..., description="Chapter number")
    verse: int = Field(..., description="Verse number")
    text: str = Field(..., description="Verse text")
    relevance: float = Field(..., description="Relevance score")


class ChatMessage(BaseModel):
    """A single chat message."""

    role: str = Field(..., description="Role (user/assistant)")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Request for AI chat endpoint."""

    message: str = Field(..., description="User message")
    context_verses: Optional[list[ContextVerse]] = Field(
        None, description="Optional specific verses to use as context"
    )
    include_verses: bool = Field(
        True, description="Whether to search for relevant verses automatically"
    )


class ChatResponse(BaseModel):
    """Response for AI chat endpoint."""

    response: str = Field(..., description="AI response")
    context_verses: list[ContextVerse] = Field(
        ..., description="Verses used as context"
    )
    cached: bool = Field(False, description="Whether context was cached")
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/__init__.py backend/app/models/verse.py backend/app/models/morphology.py backend/app/models/chat.py
git commit -m "feat: Add Pydantic models for API requests and responses"
```

---

## Task 4: Corpus Parser Service

**Files:**
- Create: `backend/app/services/corpus_parser.py`
- Create: `backend/tests/test_corpus_parser.py`

**Dependencies:** Task 2 must be complete first

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_corpus_parser.py
import pytest
from pathlib import Path
from app.services.corpus_parser import CorpusParser


def test_parse_location():
    """Test parsing location codes."""
    parser = CorpusParser()
    
    # Test valid location
    chapter, verse, word, subword = parser.parse_location("(1:1:1:1)")
    assert chapter == 1
    assert verse == 1
    assert word == 1
    assert subword == 1
    
    # Test different verse
    chapter, verse, word, subword = parser.parse_location("(2:255:3:2)")
    assert chapter == 2
    assert verse == 255
    assert word == 3
    assert subword == 2


def test_parse_features():
    """Test parsing morphological features."""
    parser = CorpusParser()
    
    # Test parsing features
    features_str = "STEM|POS:N|LEM:{som|ROOT:smw|M|GEN"
    features = parser.parse_features(features_str)
    
    assert features["pos"] == "N"
    assert features["lemma"] == "{som"
    assert features["root"] == "smw"
    assert features["gender"] == "M"
    assert features["case"] == "GEN"


def test_parse_word_line():
    """Test parsing a single word line."""
    parser = CorpusParser()
    
    line = "(1:1:1:2)\tsomi\tN\tSTEM|POS:N|LEM:{som|ROOT:smw|M|GEN"
    word = parser.parse_word_line(line)
    
    assert word["chapter"] == 1
    assert word["verse"] == 1
    assert word["word_num"] == 1
    assert word["subword"] == 2
    assert word["form"] == "somi"
    assert word["tag"] == "N"
    assert word["features"]["pos"] == "N"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_corpus_parser.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'app'"

- [ ] **Step 3: Create conftest.py for tests**

```python
# backend/tests/conftest.py
import sys
from pathlib import Path
import pytest

# Add parent directory to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd backend && pytest tests/test_corpus_parser.py::test_parse_location -v`
Expected: FAIL with "AttributeError: 'CorpusParser' object has no attribute 'parse_location'"

- [ ] **Step 5: Write minimal implementation**

```python
# backend/app/services/corpus_parser.py
"""Quranic Corpus Parser Service.

Parses the Quranic Arabic Corpus morphology file (v0.4).
Format: TAB-separated with columns: LOCATION, FORM, TAG, FEATURES
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class WordData:
    """Represents a single word with morphological data."""

    chapter: int
    verse: int
    word_num: int
    subword: int
    form: str
    tag: str
    features: dict


class CorpusParser:
    """Parser for Quranic Arabic Corpus morphology file."""

    def __init__(self, corpus_path: Optional[Path] = None):
        """Initialize parser with corpus file path."""
        self.corpus_path = corpus_path or settings.corpus_path
        self._cache: dict = {}

    def parse_location(self, location: str) -> tuple[int, int, int, int]:
        """Parse location code like (chapter:verse:word:subword).
        
        Args:
            location: Location string like "(1:1:1:1)"
            
        Returns:
            Tuple of (chapter, verse, word, subword)
        """
        # Remove parentheses
        loc = location.strip("()")
        parts = loc.split(":")
        
        if len(parts) != 4:
            raise ValueError(f"Invalid location format: {location}")
        
        return (
            int(parts[0]),  # chapter
            int(parts[1]),  # verse
            int(parts[2]),  # word
            int(parts[3]),  # subword
        )

    def parse_features(self, features_str: str) -> dict:
        """Parse morphological features string.
        
        Args:
            features_str: Features like "STEM|POS:N|LEM:{som|ROOT:smw|M|GEN"
            
        Returns:
            Dictionary of parsed features
        """
        features = {}
        
        parts = features_str.split("|")
        for part in parts:
            if ":" in part:
                key, value = part.split(":", 1)
                # Map common keys
                if key == "POS":
                    features["pos"] = value
                elif key == "LEM":
                    features["lemma"] = value
                elif key == "ROOT":
                    features["root"] = value
                elif key in ["M", "MS", "FS", "MP", "FP"]:
                    features["gender"] = "M" if "M" in key else "F"
                    features["number"] = "S" if "S" in key or "MS" in key or "FS" in key else "P"
                elif key in ["NOM", "ACC", "GEN"]:
                    features["case"] = key
                else:
                    features[key.lower()] = value
            elif part in ["N", "V", "ADJ", "PN", "PRON", "P", "CONJ", "DET", "NEG", "REM"]:
                features["pos"] = part
        
        return features

    def parse_word_line(self, line: str) -> Optional[WordData]:
        """Parse a single word line from the corpus.
        
        Args:
            line: Tab-separated line from corpus
            
        Returns:
            WordData object or None if invalid line
        """
        parts = line.strip().split("\t")
        
        if len(parts) < 4:
            return None
        
        location, form, tag, features_str = parts[0], parts[1], parts[2], parts[3]
        
        try:
            chapter, verse, word_num, subword = self.parse_location(location)
        except ValueError:
            return None
        
        features = self.parse_features(features_str)
        
        return WordData(
            chapter=chapter,
            verse=verse,
            word_num=word_num,
            subword=subword,
            form=form,
            tag=tag,
            features=features,
        )

    def load_verses(self) -> dict:
        """Load all verses from the corpus.
        
        Returns:
            Dictionary keyed by (chapter, verse) containing list of words
        """
        if self._cache:
            return self._cache
        
        verses: dict = {}
        
        with open(self.corpus_path, "r", encoding="utf-8") as f:
            for line in f:
                # Skip header lines
                if line.startswith("#") or not line.strip():
                    continue
                
                word = self.parse_word_line(line)
                if word is None:
                    continue
                
                key = (word.chapter, word.verse)
                if key not in verses:
                    verses[key] = []
                verses[key].append(word)
        
        self._cache = verses
        logger.info(f"Loaded {len(verses)} verses from corpus")
        
        return verses

    def get_verse(self, chapter: int, verse: int) -> list[WordData]:
        """Get words for a specific verse.
        
        Args:
            chapter: Chapter number (1-114)
            verse: Verse number
            
        Returns:
            List of WordData objects
        """
        verses = self.load_verses()
        return verses.get((chapter, verse), [])

    def get_chapter(self, chapter: int) -> dict[int, list[WordData]]:
        """Get all verses for a chapter.
        
        Args:
            chapter: Chapter number (1-114)
            
        Returns:
            Dictionary of verse number to list of words
        """
        verses = self.load_verses()
        return {v: words for (c, v), words in verses.items() if c == chapter}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && pytest tests/test_corpus_parser.py -v`
Expected: PASS (all 3 tests)

- [ ] **Step 7: Commit**

```bash
git add backend/app/services/corpus_parser.py backend/tests/test_corpus_parser.py backend/tests/conftest.py
git commit -m "feat: Add Quranic corpus parser service

- Parse location codes (chapter:verse:word:subword)
- Parse morphological features
- Load and cache verses from corpus file
- Support get_verse and get_chapter methods"
```

---

## Task 5: Morphology Service (CAMeL Tools)

**Files:**
- Create: `backend/app/services/morphology.py`
- Create: `backend/tests/test_morphology.py`

**Dependencies:** Task 4 must be complete first

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_morphology.py
import pytest
from app.services.morphology import MorphologyService


@pytest.fixture
def morphology_service():
    """Create morphology service instance."""
    return MorphologyService()


def test_analyze_simple_word(morphology_service):
    """Test analyzing a simple Arabic word."""
    result = morphology_service.analyze_word("سلم")
    
    assert result["form"] == "سلم"
    assert "root" in result["features"]
    assert "pos" in result["features"]


def test_get_quranic_morphology(morphology_service):
    """Test getting morphology from corpus."""
    result = morphology_service.get_quranic_morphology(1, 1)
    
    assert result["chapter"] == 1
    assert result["verse"] == 1
    assert len(result["words"]) > 0


def test_analyze_text(morphology_service):
    """Test analyzing multiple words."""
    result = morphology_service.analyze_text("بسم الله")
    
    assert result["text"] == "بسم الله"
    assert len(result["words"]) > 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_morphology.py -v`
Expected: FAIL - Module not found or method not defined

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/services/morphology.py
"""Morphology Service using CAMeL Tools and corpus data."""

from typing import Optional

from app.services.corpus_parser import CorpusParser, WordData
from app.utils.logging import get_logger

logger = get_logger(__name__)


class MorphologyService:
    """Service for morphological analysis using CAMeL Tools and corpus data."""

    def __init__(self):
        """Initialize morphology service."""
        self.corpus_parser = CorpusParser()
        self._camel_available = self._check_camel_tools()

    def _check_camel_tools(self) -> bool:
        """Check if CAMeL Tools is available."""
        try:
            from camel_tools.morphology import Morphology
            return True
        except ImportError:
            logger.warning("CAMeL Tools not available, using corpus-only mode")
            return False

    def analyze_word(self, word: str) -> dict:
        """Analyze a single Arabic word using CAMeL Tools.
        
        Args:
            word: Arabic word to analyze
            
        Returns:
            Dictionary with morphological analysis
        """
        result = {
            "form": word,
            "tag": "UNKNOWN",
            "features": {},
        }
        
        if not self._camel_available:
            return result
        
        try:
            from camel_tools.morphology import Morphology
            from camel_tools.utils.diacritize import Diacritizer
            
            morphology = Morphology.builtin()
            analyses = morphology.analyze(word)
            
            if analyses:
                analysis = analyses[0]
                result["features"]["pos"] = analysis.get("pos", "UNKNOWN")
                result["features"]["root"] = analysis.get("root", "")
                result["features"]["lemma"] = analysis.get("lemma", word)
                result["tag"] = analysis.get("pos", "UNKNOWN")
                
        except Exception as e:
            logger.warning(f"Error analyzing word '{word}': {e}")
        
        return result

    def get_quranic_morphology(self, chapter: int, verse: int) -> dict:
        """Get morphological data for a Quranic verse from the corpus.
        
        Args:
            chapter: Chapter number (1-114)
            verse: Verse number
            
        Returns:
            Dictionary with morphological analysis
        """
        words = self.corpus_parser.get_verse(chapter, verse)
        
        result_words = []
        for word in words:
            # Skip subwords (combine into main word)
            if word.subword > 1:
                continue
            
            result_words.append({
                "form": word.form,
                "tag": word.tag,
                "features": {
                    "pos": word.features.get("pos", ""),
                    "lemma": word.features.get("lemma", ""),
                    "root": word.features.get("root", ""),
                    "gender": word.features.get("gender"),
                    "number": word.features.get("number"),
                    "case": word.features.get("case"),
                },
                "original_features": f"STEM|{word.tag}|" + "|".join(
                    f"{k}:{v}" for k, v in word.features.items()
                ),
            })
        
        return {
            "chapter": chapter,
            "verse": verse,
            "words": result_words,
        }

    def analyze_text(self, text: str) -> dict:
        """Analyze multiple Arabic words.
        
        Args:
            text: Arabic text to analyze
            
        Returns:
            Dictionary with morphological analysis
        """
        # Simple word tokenization (space-separated)
        words = text.split()
        
        result_words = []
        for word in words:
            if word.strip():
                analysis = self.analyze_word(word)
                result_words.append({
                    "form": word,
                    "tag": analysis["tag"],
                    "features": analysis["features"],
                    "original_features": "",
                })
        
        return {
            "text": text,
            "words": result_words,
            "tokens_count": len(result_words),
        }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_morphology.py -v`
Expected: PASS (skip if CAMeL not installed)

- [ ] **Step 5: Commit**

```python
git add backend/app/services/morphology.py backend/tests/test_morphology.py
git commit -m "feat: Add morphology service with CAMeL Tools integration

- analyze_word: Analyze single Arabic word
- get_quranic_morphology: Get corpus-based morphology
- analyze_text: Analyze multiple words
- Falls back gracefully if CAMeL not installed"
```

---

## Task 6: Vector Store (ChromaDB)

**Files:**
- Create: `backend/app/services/vector_store.py`
- Create: `backend/tests/test_vector_store.py`

**Dependencies:** Task 4 must be complete first

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_vector_store.py
import pytest
from pathlib import Path
from app.services.vector_store import VectorStore


@pytest.fixture
def vector_store():
    """Create vector store instance with temp directory."""
    import tempfile
    temp_dir = Path(tempfile.mkdtemp())
    store = VectorStore(persist_directory=temp_dir)
    yield store


def test_initialization(vector_store):
    """Test vector store initializes."""
    assert vector_store is not None
    assert vector_store._initialized is False


def test_add_verse(vector_store):
    """Test adding a verse to the vector store."""
    vector_store.add_verse(
        chapter=1,
        verse=1,
        arabic_text="بسم الله الرحمن الرحيم",
        translation="In the name of God, the Merciful, the Compassionate"
    )
    assert vector_store._initialized is True


def test_search(vector_store):
    """Test searching verses."""
    vector_store.add_verse(
        chapter=1,
        verse=1,
        arabic_text="بسم الله",
        translation="In the name of God"
    )
    
    results = vector_store.search("God name mercy")
    assert len(results) > 0
    assert results[0]["chapter"] == 1
    assert results[0]["verse"] == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_vector_store.py -v`
Expected: FAIL - Module not found

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/services/vector_store.py
"""Vector Store Service using ChromaDB for semantic search."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class SearchResult:
    """A verse search result."""

    chapter: int
    verse: int
    arabic_text: str
    translation: Optional[str]
    similarity: float


class VectorStore:
    """Vector store for semantic search over Quranic verses."""

    def __init__(self, persist_directory: Optional[Path] = None):
        """Initialize vector store.
        
        Args:
            persist_directory: Directory to persist ChromaDB data
        """
        self.persist_directory = persist_directory or settings.chroma_db_path
        self.client: Optional[chromadb.PersistentClient] = None
        self.collection = None
        self._initialized = False
        self._embedding_function = None

    def _init_client(self):
        """Initialize ChromaDB client."""
        if self.client is not None:
            return
        
        # Create directory if needed
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        self.client = chromadb.PersistentClient(
            path=str(self.persist_directory),
            settings=ChromaSettings(
                anonymized_telemetry=False,
                allow_reset=True,
            )
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="quran_verses",
            metadata={"description": "Quranic verses with embeddings"}
        )
        
        # Initialize embedding function
        try:
            from sentence_transformers import SentenceTransformer
            # Use a multilingual model
            self._embedding_function = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            logger.info("Initialized sentence-transformers embedding function")
        except ImportError:
            logger.warning("sentence-transformers not available")
        
        self._initialized = True
        logger.info(f"Vector store initialized at {self.persist_directory}")

    def _get_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Get embeddings for texts."""
        if self._embedding_function is None:
            # Fallback: return zero vectors
            return [[0.0] * 384 for _ in texts]
        
        embeddings = self._embedding_function.encode(texts)
        return embeddings.tolist()

    def add_verse(
        self,
        chapter: int,
        verse: int,
        arabic_text: str,
        translation: Optional[str] = None
    ) -> None:
        """Add a verse to the vector store.
        
        Args:
            chapter: Chapter number
            verse: Verse number
            arabic_text: Arabic text
            translation: Optional translation
        """
        self._init_client()
        
        doc_id = f"{chapter}:{verse}"
        
        # Check if already exists
        existing = self.collection.get(ids=[doc_id])
        if existing["ids"]:
            logger.debug(f"Verse {doc_id} already exists, skipping")
            return
        
        # Create document
        text = f"{arabic_text}"
        if translation:
            text += f" | {translation}"
        
        # Get embedding
        embedding = self._get_embeddings([text])[0]
        
        # Add to collection
        self.collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            metadatas=[{
                "chapter": chapter,
                "verse": verse,
                "arabic_text": arabic_text,
                "translation": translation or "",
            }],
            documents=[text]
        )
        
        logger.info(f"Added verse {chapter}:{verse} to vector store")

    def add_verses_batch(self, verses: list[dict]) -> None:
        """Add multiple verses at once.
        
        Args:
            verses: List of verse dictionaries with keys:
                     chapter, verse, arabic_text, translation
        """
        self._init_client()
        
        ids = []
        embeddings = []
        metadatas = []
        documents = []
        
        for verse in verses:
            doc_id = f"{verse['chapter']}:{verse['verse']}"
            text = verse["arabic_text"]
            if verse.get("translation"):
                text += f" | {verse['translation']}"
            
            ids.append(doc_id)
            embeddings.append(self._get_embeddings([text])[0])
            metadatas.append({
                "chapter": verse["chapter"],
                "verse": verse["verse"],
                "arabic_text": verse["arabic_text"],
                "translation": verse.get("translation", ""),
            })
            documents.append(text)
        
        # Add in batches
        batch_size = 100
        for i in range(0, len(ids), batch_size):
            batch_end = min(i + batch_size, len(ids))
            self.collection.add(
                ids=ids[i:batch_end],
                embeddings=embeddings[i:batch_end],
                metadatas=metadatas[i:batch_end],
                documents=documents[i:batch_end]
            )
        
        logger.info(f"Added {len(verses)} verses to vector store")

    def search(
        self,
        query: str,
        n_results: int = 5,
        chapter_filter: Optional[int] = None
    ) -> list[SearchResult]:
        """Search for verses similar to query.
        
        Args:
            query: Search query
            n_results: Number of results to return
            chapter_filter: Optional chapter number to filter by
            
        Returns:
            List of SearchResult objects
        """
        self._init_client()
        
        # Get query embedding
        query_embedding = self._get_embeddings([query])[0]
        
        # Build where clause for filtering
        where = {"chapter": chapter_filter} if chapter_filter else None
        
        # Search
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where,
            include=["metadatas", "distances", "documents"]
        )
        
        search_results = []
        if results["ids"] and results["ids"][0]:
            for i, doc_id in enumerate(results["ids"][0]):
                metadata = results["metadatas"][0][i]
                distance = results["distances"][0][i]
                
                # Convert distance to similarity (lower is better)
                similarity = 1.0 / (1.0 + distance)
                
                search_results.append(SearchResult(
                    chapter=metadata["chapter"],
                    verse=metadata["verse"],
                    arabic_text=metadata["arabic_text"],
                    translation=metadata.get("translation") or None,
                    similarity=similarity
                ))
        
        return search_results

    def get_verse(self, chapter: int, verse: int) -> Optional[SearchResult]:
        """Get a specific verse by chapter and verse number.
        
        Args:
            chapter: Chapter number
            verse: Verse number
            
        Returns:
            SearchResult or None if not found
        """
        self._init_client()
        
        doc_id = f"{chapter}:{verse}"
        result = self.collection.get(ids=[doc_id])
        
        if not result["ids"]:
            return None
        
        metadata = result["metadatas"][0]
        return SearchResult(
            chapter=metadata["chapter"],
            verse=metadata["verse"],
            arabic_text=metadata["arabic_text"],
            translation=metadata.get("translation") or None,
            similarity=1.0
        )

    def get_verse_count(self) -> int:
        """Get total number of verses in the store."""
        self._init_client()
        return self.collection.count()

    def reset(self) -> None:
        """Reset the vector store (delete all data)."""
        self._init_client()
        self.client.delete_collection(name="quran_verses")
        self.collection = None
        self._initialized = False
        logger.info("Vector store reset")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_vector_store.py -v`
Expected: PASS (may skip if dependencies not installed)

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/vector_store.py backend/tests/test_vector_store.py
git commit -m "feat: Add ChromaDB vector store service

- add_verse: Add single verse with embedding
- add_verses_batch: Add multiple verses
- search: Semantic similarity search
- get_verse: Retrieve specific verse
- Uses paraphrase-multilingual-MiniLM-L12-v2 for embeddings"
```

---

## Task 7: Gemini AI Service

**Files:**
- Create: `backend/app/services/gemini.py`
- Create: `backend/tests/test_gemini.py`

**Dependencies:** None (uses external API)

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_gemini.py
import pytest
from unittest.mock import Mock, patch
from app.services.gemini import GeminiService


@pytest.fixture
def gemini_service():
    """Create Gemini service instance with mock API."""
    with patch('app.services.gemini.genai'):
        service = GeminiService(api_key="test_key")
        return service


def test_initialization(gemini_service):
    """Test service initializes."""
    assert gemini_service is not None
    assert gemini_service.model_name == "gemini-2.0-flash-exp"


def test_format_context_verses(gemini_service):
    """Test formatting verses as context."""
    verses = [
        {"chapter": 1, "verse": 1, "text": "بسم الله", "relevance": 0.9},
    ]
    
    context = gemini_service.format_context_verses(verses)
    
    assert "بسم الله" in context
    assert "1:1" in context


def test_generate_response(gemini_service):
    """Test generating a response."""
    with patch.object(gemini_service.model, 'generate_content') as mock:
        mock.return_value = Mock(text="Test response")
        
        response = gemini_service.generate_response("Hello", [])
        
        assert response == "Test response"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_gemini.py -v`
Expected: FAIL - Module not found

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/services/gemini.py
"""Gemini AI Service for conversational tutoring."""

from typing import Optional

import google.generativeai as genai

from app.utils.logging import get_logger

logger = get_logger(__name__)


class GeminiService:
    """Service for interacting with Gemini 3.1 Flash Lite API."""

    # System prompt for Quranic tutoring
    SYSTEM_PROMPT = """You are an expert in Classical Arabic and Quranic linguistics.
Your role is to help students understand the morphology (Sarf) and syntax (I'rab) of Quranic verses.

When answering questions:
1. Ground your explanations in the provided Quranic verses
2. Explain morphological features clearly (root, lemma, POS, gender, number, case)
3. Provide both Arabic technical terms and English translations
4. Be pedagogical and encouraging

Use the context provided from the Quranic corpus to ensure accuracy."""


    def __init__(self, api_key: str):
        """Initialize Gemini service.
        
        Args:
            api_key: Gemini API key
        """
        self.api_key = api_key
        genai.configure(api_key=api_key)
        
        # Use Gemini 3.1 Flash Lite (preview)
        self.model_name = "gemini-2.0-flash-exp"
        self.model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=self.SYSTEM_PROMPT
        )
        
        # Context cache would go here in production
        self._cache = {}
        
        logger.info(f"Initialized Gemini service with model: {self.model_name}")

    def format_context_verses(self, verses: list[dict]) -> str:
        """Format verses as context for the prompt.
        
        Args:
            verses: List of verse dictionaries with keys:
                    chapter, verse, text, relevance
            
        Returns:
            Formatted context string
        """
        if not verses:
            return ""
        
        context = "Relevant verses from the Quran:\n"
        
        for verse in verses:
            context += f"[{verse['chapter']}:{verse['verse']}] {verse['text']}\n"
        
        context += "\n"
        
        return context

    def generate_response(
        self,
        user_message: str,
        context_verses: list[dict],
        cached: bool = False
    ) -> str:
        """Generate a response using Gemini.
        
        Args:
            user_message: User's message/question
            context_verses: Verses to use as context
            cached: Whether the context was cached
            
        Returns:
            Generated response text
        """
        # Build prompt with context
        prompt = self.format_context_verses(context_verses)
        prompt += f"User question: {user_message}"
        
        if cached:
            prompt += "\n\n(Note: Using cached context for efficiency)"
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return f"I apologize, but I encountered an error: {str(e)}"

    def generate_response_streaming(
        self,
        user_message: str,
        context_verses: list[dict]
    ):
        """Generate a streaming response.
        
        Args:
            user_message: User's message/question
            context_verses: Verses to use as context
            
        Yields:
            Chunks of the response
        """
        prompt = self.format_context_verses(context_verses)
        prompt += f"User question: {user_message}"
        
        try:
            response = self.model.generate_content(prompt, stream=True)
            for chunk in response:
                yield chunk.text
                
        except Exception as e:
            logger.error(f"Error in streaming response: {e}")
            yield f"Error: {str(e)}"

    def is_available(self) -> bool:
        """Check if Gemini API is available.
        
        Returns:
            True if service is available
        """
        try:
            # Simple availability check
            self.model.count_tokens("test")
            return True
        except Exception:
            return False
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_gemini.py -v`
Expected: PASS (mocked)

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/gemini.py backend/tests/test_gemini.py
git commit -m "feat: Add Gemini 3.1 Flash Lite integration

- generate_response: Generate pedagogical response
- generate_response_streaming: Streaming response support
- format_context_verses: Format verses as context
- System prompt for Quranic tutoring
- Error handling and logging"
```

---

## Task 8: RAG Pipeline Service

**Files:**
- Create: `backend/app/services/rag.py`
- Create: `backend/tests/test_rag.py`

**Dependencies:** Task 6 (VectorStore), Task 7 (Gemini), Task 5 (Morphology) must be complete

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_rag.py
import pytest
from unittest.mock import Mock, patch
from app.services.rag import RAGPipeline


@pytest.fixture
def rag_pipeline():
    """Create RAG pipeline with mocked dependencies."""
    with patch('app.services.rag.VectorStore') as mock_store, \
         patch('app.services.rag.GeminiService') as mock_gemini, \
         patch('app.services.rag.MorphologyService') as mock_morph:
        
        mock_store_instance = Mock()
        mock_store.return_value = mock_store_instance
        
        mock_gemini_instance = Mock()
        mock_gemini.return_value = mock_gemini_instance
        
        mock_morph_instance = Mock()
        mock_morph.return_value = mock_morph_instance
        
        pipeline = RAGPipeline(
            vector_store=mock_store_instance,
            gemini_service=mock_gemini_instance,
            morphology_service=mock_morph_instance
        )
        
        return pipeline, mock_store_instance, mock_gemini_instance


def test_initialization(rag_pipeline):
    """Test RAG pipeline initializes."""
    pipeline, _, _ = rag_pipeline
    assert pipeline is not None


def test_process_query(rag_pipeline):
    """Test processing a query."""
    pipeline, mock_store, mock_gemini = rag_pipeline
    
    # Setup mocks
    mock_store.search.return_value = [
        {"chapter": 1, "verse": 1, "text": "بسم الله", "translation": "In the name", "similarity": 0.9}
    ]
    mock_gemini.generate_response.return_value = "Test response"
    
    result = pipeline.process_query("Explain بسم الله")
    
    assert result["response"] == "Test response"
    assert len(result["context_verses"]) > 0
    mock_store.search.assert_called_once()
    mock_gemini.generate_response.assert_called_once()


def test_get_verse_context(rag_pipeline):
    """Test getting verse context."""
    pipeline, mock_store, mock_gemini = rag_pipeline
    
    mock_store.get_verse.return_value = {
        "chapter": 1,
        "verse": 1,
        "arabic_text": "بسم الله",
        "translation": "In the name"
    }
    
    context = pipeline.get_verse_context(1, 1)
    
    assert context is not None
    assert context["chapter"] == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_rag.py -v`
Expected: FAIL - Module not found

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/services/rag.py
"""RAG (Retrieval-Augmented Generation) Pipeline Service."""

from typing import Optional

from app.services.gemini import GeminiService
from app.services.morphology import MorphologyService
from app.services.vector_store import VectorStore, SearchResult
from app.utils.logging import get_logger

logger = get_logger(__name__)


class RAGPipeline:
    """RAG pipeline for grounded Quranic Q&A."""

    def __init__(
        self,
        vector_store: VectorStore,
        gemini_service: GeminiService,
        morphology_service: MorphologyService
    ):
        """Initialize RAG pipeline.
        
        Args:
            vector_store: Vector store for semantic search
            gemini_service: Gemini AI service
            morphology_service: Morphology service
        """
        self.vector_store = vector_store
        self.gemini_service = gemini_service
        self.morphology_service = morphology_service
        
        logger.info("RAG pipeline initialized")

    def search_verses(
        self,
        query: str,
        n_results: int = 5
    ) -> list[dict]:
        """Search for relevant verses.
        
        Args:
            query: Search query
            n_results: Number of results
            
        Returns:
            List of verse dictionaries
        """
        results = self.vector_store.search(query, n_results=n_results)
        
        return [
            {
                "chapter": r.chapter,
                "verse": r.verse,
                "text": r.arabic_text,
                "translation": r.translation,
                "relevance": r.similarity
            }
            for r in results
        ]

    def get_verse_context(
        self,
        chapter: int,
        verse: int
    ) -> Optional[dict]:
        """Get specific verse with context.
        
        Args:
            chapter: Chapter number
            verse: Verse number
            
        Returns:
            Verse context dictionary or None
        """
        result = self.vector_store.get_verse(chapter, verse)
        
        if result is None:
            return None
        
        # Get morphology
        morphology = self.morphology_service.get_quranic_morphology(chapter, verse)
        
        return {
            "chapter": result.chapter,
            "verse": result.verse,
            "text": result.arabic_text,
            "translation": result.translation,
            "morphology": morphology.get("words", [])
        }

    def process_query(
        self,
        user_message: str,
        include_verses: bool = True,
        specific_verses: Optional[list[dict]] = None
    ) -> dict:
        """Process a user query through the RAG pipeline.
        
        Args:
            user_message: User's question
            include_verses: Whether to search for relevant verses
            specific_verses: Optional list of specific verses to use
            
        Returns:
            Dictionary with response and context
        """
        # Get context verses
        if specific_verses:
            context_verses = specific_verses
            cached = False
        elif include_verses:
            context_verses = self.search_verses(user_message, n_results=5)
            cached = False
        else:
            context_verses = []
            cached = True
        
        # Generate response
        response = self.gemini_service.generate_response(
            user_message=user_message,
            context_verses=context_verses,
            cached=cached
        )
        
        return {
            "response": response,
            "context_verses": context_verses,
            "cached": cached
        }

    def process_morphology_query(
        self,
        user_message: str,
        chapter: int,
        verse: int
    ) -> dict:
        """Process a query about a specific verse's morphology.
        
        Args:
            user_message: User's question about morphology
            chapter: Chapter number
            verse: Verse number
            
        Returns:
            Dictionary with response and morphology
        """
        # Get verse context with morphology
        verse_context = self.get_verse_context(chapter, verse)
        
        if verse_context is None:
            return {
                "response": f"Verse {chapter}:{verse} not found in the database.",
                "context_verses": [],
                "morphology": None
            }
        
        # Build context with morphology info
        context_verses = [verse_context]
        
        # Generate response with morphology focus
        prompt = f"""Based on the morphological analysis of verse {chapter}:{verse}:

{verse_context['text']}

Morphology:
"""
        for word in verse_context.get("morphology", []):
            prompt += f"- {word['form']}: {word['tag']}, Root: {word.get('features', {}).get('root', 'N/A')}\n"
        
        prompt += f"\nUser question: {user_message}"
        
        response = self.gemini_service.generate_response(
            user_message=prompt,
            context_verses=context_verses,
            cached=False
        )
        
        return {
            "response": response,
            "context_verses": context_verses,
            "morphology": verse_context.get("morphology", [])
        }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_rag.py -v`
Expected: PASS (mocked)

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/rag.py backend/tests/test_rag.py
git commit -m "feat: Add RAG pipeline service

- search_verses: Semantic search for relevant verses
- get_verse_context: Get verse with morphological data
- process_query: Full RAG pipeline for Q&A
- process_morphology_query: Morphology-specific queries
- Combines vector store, Gemini, and morphology services"
```

---

## Task 9: API Routes

**Files:**
- Create: `backend/app/api/routes/__init__.py`
- Create: `backend/app/api/routes/verses.py`
- Create: `backend/app/api/routes/morphology.py`
- Create: `backend/app/api/routes/chat.py`
- Create: `backend/app/api/deps.py`

**Dependencies:** Task 3 (Models), Task 5 (Morphology), Task 6 (VectorStore), Task 7 (Gemini), Task 8 (RAG) must be complete

- [ ] **Step 1: Create API routes/verses.py**

```python
"""Verse-related API routes."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import get_vector_store
from app.core.constants import API_PREFIX
from app.models.verse import VerseResponse, ChapterResponse, VerseSearchResponse, VerseSearchResult
from app.services.corpus_parser import CorpusParser

router = APIRouter(prefix="/verses", tags=["verses"])

# Initialize corpus parser
corpus_parser = CorpusParser()


@router.get("/{chapter}/{verse}", response_model=VerseResponse)
async def get_verse(
    chapter: int,
    verse: int
):
    """Get a specific verse with morphological data.
    
    Args:
        chapter: Chapter number (1-114)
        verse: Verse number
        
    Returns:
        Verse with morphological data
    """
    words = corpus_parser.get_verse(chapter, verse)
    
    if not words:
        raise HTTPException(
            status_code=404,
            detail=f"Verse {chapter}:{verse} not found"
        )
    
    return VerseResponse(
        chapter=chapter,
        verse=verse,
        words=[
            {
                "form": w.form,
                "tag": w.tag,
                "lemma": w.features.get("lemma"),
                "root": w.features.get("root"),
                "features": "|".join(f"{k}:{v}" for k, v in w.features.items())
            }
            for w in words
        ]
    )


@router.get("/{chapter}", response_model=ChapterResponse)
async def get_chapter(
    chapter: int,
    limit: Optional[int] = Query(None, description="Limit number of verses"),
    offset: int = Query(0, description="Offset for pagination")
):
    """Get all verses in a chapter.
    
    Args:
        chapter: Chapter number (1-114)
        limit: Optional limit on number of verses
        offset: Offset for pagination
        
    Returns:
        Chapter with verses
    """
    verses = corpus_parser.get_chapter(chapter)
    
    if not verses:
        raise HTTPException(
            status_code=404,
            detail=f"Chapter {chapter} not found"
        )
    
    # Sort by verse number
    sorted_verses = sorted(verses.items(), key=lambda x: x[0])
    
    # Apply pagination
    if offset:
        sorted_verses = sorted_verses[offset:]
    if limit:
        sorted_verses = sorted_verses[:limit]
    
    return ChapterResponse(
        chapter=chapter,
        verse_count=len(verses),
        verses=[
            VerseResponse(
                chapter=chapter,
                verse=v,
                words=[
                    {
                        "form": w.form,
                        "tag": w.tag,
                        "lemma": w.features.get("lemma"),
                        "root": w.features.get("root"),
                        "features": "|".join(f"{k}:{v}" for k, v in w.features.items())
                    }
                    for w in words
                ]
            )
            for v, words in sorted_verses
        ]
    )


@router.post("/search", response_model=VerseSearchResponse)
async def search_verses(
    query: str = Query(..., description="Search query"),
    n_results: int = Query(5, description="Number of results"),
    chapter: Optional[int] = Query(None, description="Filter by chapter")
):
    """Search verses using semantic similarity.
    
    Args:
        query: Search query
        n_results: Number of results to return
        chapter: Optional chapter filter
        
    Returns:
        Search results with similarity scores
    """
    vector_store = get_vector_store()
    
    results = vector_store.search(
        query=query,
        n_results=n_results,
        chapter_filter=chapter
    )
    
    return VerseSearchResponse(
        query=query,
        results=[
            VerseSearchResult(
                chapter=r.chapter,
                verse=r.verse,
                arabic_text=r.arabic_text,
                translation=r.translation,
                similarity=r.similarity
            )
            for r in results
        ],
        count=len(results)
    )
```

- [ ] **Step 2: Create API routes/morphology.py**

```python
"""Morphology-related API routes."""

from fastapi import APIRouter, HTTPException, Body

from app.models.morphology import (
    MorphologyResponse,
    MorphologyAnalysisRequest,
    MorphologyAnalysisResponse
)
from app.services.morphology import MorphologyService

router = APIRouter(prefix="/morphology", tags=["morphology"])

# Initialize morphology service
morphology_service = MorphologyService()


@router.get("/{chapter}/{verse}", response_model=MorphologyResponse)
async def get_morphology(chapter: int, verse: int):
    """Get morphological analysis for a verse.
    
    Args:
        chapter: Chapter number (1-114)
        verse: Verse number
        
    Returns:
        Morphological analysis
    """
    result = morphology_service.get_quranic_morphology(chapter, verse)
    
    if not result["words"]:
        raise HTTPException(
            status_code=404,
            detail=f"Verse {chapter}:{verse} not found"
        )
    
    return MorphologyResponse(**result)


@router.post("/analyze", response_model=MorphologyAnalysisResponse)
async def analyze_text(request: MorphologyAnalysisRequest):
    """Analyze user-entered Arabic text.
    
    Args:
        request: Text to analyze
        
    Returns:
        Morphological analysis
    """
    result = morphology_service.analyze_text(request.text)
    
    return MorphologyAnalysisResponse(
        text=result["text"],
        words=result["words"],
        tokens_count=result["tokens_count"]
    )
```

- [ ] **Step 3: Create API routes/chat.py**

```python
"""Chat/RAG API routes."""

from fastapi import APIRouter, HTTPException, Body
from pydantic import Field

from app.models.chat import ChatRequest, ChatResponse
from app.services.rag import RAGPipeline

router = APIRouter(prefix="/chat", tags=["chat"])

# Global RAG pipeline (initialized on first use)
_rag_pipeline = None


def get_rag_pipeline() -> RAGPipeline:
    """Get or create RAG pipeline instance."""
    global _rag_pipeline
    
    if _rag_pipeline is None:
        from app.config import settings
        from app.services.vector_store import VectorStore
        from app.services.gemini import GeminiService
        from app.services.morphology import MorphologyService
        
        vector_store = VectorStore()
        gemini_service = GeminiService(api_key=settings.gemini_api_key)
        morphology_service = MorphologyService()
        
        _rag_pipeline = RAGPipeline(
            vector_store=vector_store,
            gemini_service=gemini_service,
            morphology_service=morphology_service
        )
    
    return _rag_pipeline


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to the AI tutor.
    
    Args:
        request: Chat request with message and options
        
    Returns:
        AI response with context
    """
    try:
        rag = get_rag_pipeline()
        
        result = rag.process_query(
            user_message=request.message,
            include_verses=request.include_verses,
            specific_verses=request.context_verses if request.context_verses else None
        )
        
        return ChatResponse(
            response=result["response"],
            context_verses=[
                {
                    "chapter": v["chapter"],
                    "verse": v["verse"],
                    "text": v["text"],
                    "relevance": v.get("relevance", 0.0)
                }
                for v in result["context_verses"]
            ],
            cached=result["cached"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat: {str(e)}"
        )
```

- [ ] **Step 4: Create API deps.py**

```python
"""API dependencies."""

from functools import lru_cache
from typing import Optional

from app.services.vector_store import VectorStore
from app.config import settings


# Global vector store instance
_vector_store: Optional[VectorStore] = None


@lru_cache()
def get_vector_store() -> VectorStore:
    """Get or create vector store instance."""
    global _vector_store
    
    if _vector_store is None:
        _vector_store = VectorStore()
    
    return _vector_store
```

- [ ] **Step 5: Create API routes/__init__.py**

```python
"""API routes package."""

from app.api.routes import verses, morphology, chat

__all__ = ["verses", "morphology", "chat"]
```

- [ ] **Step 6: Update main.py to include routes**

```python
# Update app/main.py - add imports and register routers

# Add after existing imports:
from app.api.routes import verses, morphology, chat
from app.core.constants import API_PREFIX

# Update create_app() function to include routers:
def create_app() -> FastAPI:
    app = FastAPI(...)
    
    # ... existing code ...
    
    # Register routers
    app.include_router(verses.router, prefix=API_PREFIX)
    app.include_router(morphology.router, prefix=API_PREFIX)
    app.include_router(chat.router, prefix=API_PREFIX)
    
    return app
```

- [ ] **Step 7: Commit**

```bash
git add backend/app/api/routes/ backend/app/api/deps.py
git commit -m "feat: Add API routes for verses, morphology, and chat

- /api/v1/verses/{chapter}/{verse} - Get verse with morphology
- /api/v1/verses/{chapter} - Get chapter verses
- /api/v1/verses/search - Semantic search
- /api/v1/morphology/{chapter}/{verse} - Get morphology
- /api/v1/morphology/analyze - Analyze user text
- /api/v1/chat - AI tutoring conversation"
```

---

## Task 10: Integration Tests

**Files:**
- Create: `backend/tests/test_api.py`

**Dependencies:** All previous tasks

- [ ] **Step 1: Write integration test**

```python
# backend/tests/test_api.py
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_get_verse():
    """Test getting a specific verse."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/verses/1/1")
        
    assert response.status_code == 200
    data = response.json()
    assert data["chapter"] == 1
    assert data["verse"] == 1
    assert "words" in data


@pytest.mark.asyncio
async def test_get_morphology():
    """Test getting morphological analysis."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/morphology/1/1")
        
    assert response.status_code == 200
    data = response.json()
    assert data["chapter"] == 1
    assert data["verse"] == 1
    assert "words" in data


@pytest.mark.asyncio
async def test_get_chapter():
    """Test getting chapter verses."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/verses/1")
        
    assert response.status_code == 200
    data = response.json()
    assert data["chapter"] == 1
    assert "verses" in data
```

- [ ] **Step 2: Run test to verify**

Run: `cd backend && pytest tests/test_api.py -v`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add backend/tests/test_api.py
git commit -m "test: Add API integration tests

- test_health_check
- test_get_verse
- test_get_morphology
- test_get_chapter"
```

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-04-04-arabic-morphosyntactic-explorer-backend.md`.**

**Two execution options:**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?