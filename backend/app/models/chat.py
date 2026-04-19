"""Pydantic models for chat-related API requests and responses."""

from typing import Optional

from pydantic import BaseModel, Field


class ContextVerse(BaseModel):
    """A verse included as context for chat."""

    chapter: int = Field(description="Chapter (surah) number")
    verse: int = Field(description="Verse number within the chapter")
    text: str = Field(description="Arabic text of the verse")
    relevance: float = Field(description="Relevance score for the context")


class ChatMessage(BaseModel):
    """A single message in the chat conversation."""

    role: str = Field(description="Role of the message (user/assistant)")
    content: str = Field(description="Content of the message")


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    message: str = Field(description="User's message")
    context_verses: list[ContextVerse] = Field(
        default_factory=list, description="Verses to use as context for the response"
    )
    include_verses: bool = Field(
        default=True, description="Whether to include relevant verses in the response"
    )
    model: str = Field(
        default="gemini-3.1-flash-lite-preview",
        description="Gemini model to use for generation"
    )


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""

    response: str = Field(description="AI-generated response")
    context_verses: list[ContextVerse] = Field(
        default_factory=list, description="Verses used as context for the response"
    )
    cached: bool = Field(description="Whether the response used cached context")
