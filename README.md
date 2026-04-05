# Arabic Morphosyntactic Explorer - Backend

An AI-driven pedagogical tutor for Classical Arabic (Quranic corpus) that provides morphological analysis and interactive learning powered by Gemini AI.

## Features

- FastAPI-based REST API
- CAMeL Tools for Arabic morphological parsing
- ChromaDB for vector-based semantic search (RAG pipeline)
- Gemini AI integration for contextual responses
- Bilingual support (Arabic + English)

## Prerequisites

- Python 3.10+
- Gemini API Key

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Add your API key:**
   Open `.env` and set your `GEMINI_API_KEY` with a valid key from Google AI Studio.

## Running the Server

```bash
uvicorn app.main:app --reload --port 8000
```

The server will start at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive API documentation.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/verses/{verse_id}` | Get verse by ID |
| GET | `/api/v1/verses` | List verses with pagination |
| POST | `/api/v1/analyze` | Analyze Arabic text morphology |
| POST | `/api/v1/chat` | Chat with AI tutor |
| GET | `/api/v1/search` | Semantic search verses |

## Testing

Run all tests:
```bash
pytest tests/ -v
```

Run with coverage:
```bash
pytest --cov=app --cov-report=term-missing
```

## Project Structure

```
backend/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Configuration
│   ├── models/       # Pydantic models
│   ├── services/     # Business logic
│   └── utils/        # Helpers
├── tests/            # Unit tests
├── requirements.txt  # Python dependencies
├── Dockerfile        # Container configuration
└── README.md         # This file
```

## License

MIT