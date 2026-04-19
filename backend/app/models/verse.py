"""Pydantic models for verse-related API responses."""

from typing import Optional

from pydantic import BaseModel, Field


class WordInfo(BaseModel):
    """Information about a word in a verse."""

    form: str = Field(description="The word form as it appears in the verse")
    tag: str = Field(description="Part-of-speech tag for the word")
    lemma: Optional[str] = Field(
        default=None, description="Lemma/dictionary form of the word"
    )
    root: Optional[str] = Field(
        default=None, description="Root of the word (for Arabic roots)"
    )
    features: dict[str, str] = Field(
        default_factory=dict, description="Morphological features"
    )


class VerseResponse(BaseModel):
    """Response model for a single verse."""

    chapter: int = Field(description="Chapter (surah) number")
    verse: int = Field(description="Verse number within the chapter")
    words: list[WordInfo] = Field(
        default_factory=list, description="List of words in the verse"
    )
    verse_text: Optional[str] = Field(default=None, description="The Arabic verse text")
    translation: Optional[str] = Field(default=None, description="The English translation")
    transliteration: Optional[str] = Field(default=None, description="The transliterated verse text")


class ChapterResponse(BaseModel):
    """Response model for a chapter with its verses."""

    chapter: int = Field(description="Chapter (surah) number")
    verse_count: int = Field(description="Total number of verses in the chapter")
    verses: list[VerseResponse] = Field(
        default_factory=list, description="List of verses in the chapter"
    )


class VerseSearchResult(BaseModel):
    """A single verse search result."""

    chapter: int = Field(description="Chapter (surah) number")
    verse: int = Field(description="Verse number within the chapter")
    arabic_text: str = Field(description="Arabic text of the verse")
    translation: Optional[str] = Field(
        default=None, description="English translation of the verse"
    )
    transliteration: Optional[str] = Field(
        default=None, description="Transliterated text of the verse"
    )
    similarity: float = Field(description="Similarity score for the search query")


class VerseSearchResponse(BaseModel):
    """Response model for verse search results."""

    query: str = Field(description="The search query")
    results: list[VerseSearchResult] = Field(
        default_factory=list, description="Search results"
    )
    count: int = Field(description="Total number of results")
