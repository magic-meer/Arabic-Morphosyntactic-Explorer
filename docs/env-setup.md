# Environment Setup Guide

This file documents the environment variables needed for the Arabic Morphosyntactic Explorer project.

## Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp docs/backend-env-example.txt backend/.env
```

### Required Variables

| Variable | Description | Example |
|----------|--------------|---------|
| `GEMINI_API_KEY` | Gemini API key for AI features | `your_gemini_api_key_here` |
| `CHROMA_DB_PATH` | Path for ChromaDB data storage | `./chroma_data` |

### Optional Variables

| Variable | Description | Default |
|----------|--------------|---------|
| `API_HOST` | API server host | `0.0.0.0` |
| `API_PORT` | API server port | `8000` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:8081,http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `INFO` |

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key to your `.env` file

## Frontend Configuration

The frontend uses `app.json` for configuration. Update the `extra` section:

```json
{
  "extra": {
    "API_BASE_URL": "http://localhost:8000"
  }
}
```

For development, you can also create `frontend/.env`:

```
API_BASE_URL=http://localhost:8000
```

## Security Notes

- Never commit `.env` files to version control
- The `.env` file is already in `.gitignore`
- If you accidentally commit secrets, regenerate them immediately
