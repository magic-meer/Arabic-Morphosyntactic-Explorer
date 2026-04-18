"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, morphology, verses
from app.config import settings
from app.core.constants import API_PREFIX
from app.services.vector_store import VectorStore
from app.utils.logging import setup_logging

logger = setup_logging(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("Starting up Arabic Morphosyntactic Explorer...")
    
    # Check and populate vector store if empty
    try:
        store = VectorStore()
        store.ensure_populated(limit=1000)
    except Exception as e:
        logger.error(f"Startup population failed: {e}")
        
    yield
    
    logger.info("Shutting down...")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Arabic Morphosyntactic Explorer",
        description="AI-driven pedagogical tutor for Classical Arabic",
        version="1.0.0",
        docs_url=f"{API_PREFIX}/docs",
        redoc_url=f"{API_PREFIX}/redoc",
        lifespan=lifespan,
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
        """Health check endpoint with database statistics."""
        try:
            store = VectorStore()
            count = store.get_verse_count()
            return {
                "status": "healthy", 
                "version": "1.0.0",
                "verse_count": count
            }
        except Exception as e:
            logger.error(f"Health check count failed: {e}")
            return {"status": "unhealthy", "version": "1.0.0", "error": str(e)}

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
