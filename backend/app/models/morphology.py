"""Pydantic models for morphology-related API requests and responses."""

from typing import Optional

from pydantic import BaseModel, Field


class MorphologyFeatures(BaseModel):
    """Morphological features of a word."""

    pos: Optional[str] = Field(default=None, description="Part of speech")
    lex: Optional[str] = Field(default=None, description="Lemma/dictionary form")
    root: Optional[str] = Field(default=None, description="Root form")
    diac: Optional[str] = Field(default=None, description="Diacritized form")
    pattern: Optional[str] = Field(default=None, description="Morphological pattern")
    gloss: Optional[str] = Field(default=None, description="English meaning")
    gen: Optional[str] = Field(default=None, description="Gender")
    num: Optional[str] = Field(default=None, description="Number")
    cas: Optional[str] = Field(default=None, description="Case")
    mod: Optional[str] = Field(default=None, description="Mood")
    vox: Optional[str] = Field(default=None, description="Voice")
    asp: Optional[str] = Field(default=None, description="Aspect")
    per: Optional[str] = Field(default=None, description="Person")
    d3seg: Optional[str] = Field(default=None, description="Segmentation")
    bw: Optional[str] = Field(default=None, description="Buckwalter transliteration")
    
    # Aliases/Compatible fields
    lemma: Optional[str] = None
    gender: Optional[str] = None
    number: Optional[str] = None
    case: Optional[str] = None
    voice: Optional[str] = None
    aspect: Optional[str] = None
    person: Optional[str] = None


class MorphologyWord(BaseModel):
    """A word with its morphological analysis."""

    form: str = Field(description="The word form as it appears")
    tag: str = Field(description="Morphological tag from the corpus")
    features: MorphologyFeatures = Field(description="Parsed morphological features")
    original_features: Optional[dict[str, str]] = Field(
        default=None, description="Original features as key-value pairs"
    )


class MorphologyResponse(BaseModel):
    """Response model for verse morphological analysis."""

    chapter: int = Field(description="Chapter (surah) number")
    verse: int = Field(description="Verse number within the chapter")
    words: list[MorphologyWord] = Field(
        default_factory=list, description="List of analyzed words"
    )


class MorphologyAnalysisRequest(BaseModel):
    """Request model for text morphological analysis."""

    text: str = Field(description="Text to analyze")
    include_roots: bool = Field(
        default=True, description="Whether to include root extraction"
    )


class MorphologyAnalysisResponse(BaseModel):
    """Response model for text morphological analysis."""

    text: str = Field(description="Original input text")
    words: list[MorphologyWord] = Field(
        default_factory=list, description="List of analyzed words"
    )
    tokens_count: int = Field(description="Total number of tokens analyzed")


class WordAnalysisRequest(BaseModel):
    """Request model for single-word morphological + AI analysis."""

    word: str = Field(description="Arabic word to analyze")


class WordAnalysisResponse(BaseModel):
    """Response combining CAMeL morphological analysis with AI explanation."""

    word: str = Field(description="The input word")
    analyses: list[dict] = Field(
        default_factory=list,
        description="All CAMeL Tools analysis candidates with features",
    )
    ai_explanation: str = Field(
        default="", description="AI-generated Sarf/I'rab explanation"
    )
