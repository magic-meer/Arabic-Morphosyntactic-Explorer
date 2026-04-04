"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, morphology, verses
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

    # Register API routers
    app.include_router(verses.router, prefix=API_PREFIX)
    app.include_router(morphology.router, prefix=API_PREFIX)
    app.include_router(chat.router, prefix=API_PREFIX)

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
