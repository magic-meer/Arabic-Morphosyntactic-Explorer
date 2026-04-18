# AGENTS.md - AI Arabic Morphosyntactic Explorer

## Project Philosophy

These rules guide all development work on this project:

1. **Write clean code** - Maintain high code quality with clear structure, proper naming, and good documentation
2. **Use standard ways** - Follow established patterns and best practices; no shortcuts or hacks
3. **Ask for clarification** - If confused or uncertain about requirements, ask the user before proceeding
4. **No manual mocking** - If something requires manual setup by the user (e.g., API keys, environment config), clearly indicate what they need to do rather than creating mock implementations
5. **Track everything with git** - Commit at logical checkpoints so the project history is traceable
6. **Build modularly** - This project will serve as a module for a larger future project; keep components decoupled and reusable
7. **Use proper tools** - Employ appropriate development tools (linters, type checkers, formatters, test runners)

This is a 30-day capstone project building an AI-driven pedagogical tutor for Classical Arabic (Quranic corpus). The system uses:
- **Backend**: Python FastAPI
- **Frontend**: React Native (Expo) with RTL support for Arabic
- **NLP**: CAMeL Tools for morphological parsing
- **Vector DB**: ChromaDB for RAG pipeline
- **AI**: Gemini 2.0 Flash API with context caching

## Project Structure

```
arabic-morphosyntactic-explorer/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Config, constants
│   │   ├── models/      # Pydantic models
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helpers
│   ├── tests/           # Unit/integration tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/            # Expo React Native app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── screens/    # App screens
│   │   ├── services/   # API calls
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Helpers (RTL, i18n)
│   ├── app.json
│   └── package.json
├── docs/                # Documentation
└── AGENTS.md
```

## Build Commands

### Backend (Python/FastAPI)

```bash
# Install dependencies
cd backend && pip install -r requirements.txt

# Run development server
cd backend && uvicorn app.main:app --reload --port 8000

# Run tests (single test file)
cd backend && pytest tests/test_api.py -v

# Run single test function
cd backend && pytest tests/test_api.py::test_health_check -v

# Run with coverage
cd backend && pytest --cov=app --cov-report=term-missing

# Linting
cd backend && ruff check .

# Type checking
cd backend && mypy app/
```

### Frontend (Expo/React Native)

```bash
# Install dependencies
cd frontend && pnpm install

# Run development server
cd frontend && npx expo start

# Run on Android
cd frontend && npx expo run:android

# Run on iOS
cd frontend && npx expo run:ios

# Run tests
cd frontend && pnpm test

# Linting
cd frontend && npx eslint src/

# Type checking
cd frontend && npx tsc --noEmit
```

## Code Style Guidelines

### Python (Backend)

**Imports**:
- Standard library first, then third-party, then local
- Use absolute imports: `from app.api import routes`
- Group: `import os`, `from typing import Optional`, `from fastapi import APIRouter`

**Formatting**:
- Max line length: 88 characters (Black default)
- Use Black for formatting: `black .`
- Use isort for import sorting

**Types**:
- Use type hints for all function signatures
- Prefer `Optional[X]` over `X | None`
- Use Pydantic models for request/response schemas
- Avoid `Any` unless absolutely necessary

**Naming**:
- `snake_case` for functions/variables
- `PascalCase` for classes
- `SCREAMING_SNAKE_CASE` for constants
- Prefix private methods with `_`

**Error Handling**:
- Use custom exception classes inheriting from `HTTPException`
- Return proper HTTP status codes (200, 400, 404, 500)
- Log errors with appropriate levels
- Never expose raw exception details to clients

**Example**:
```python
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1")

class VerseResponse(BaseModel):
    id: int
    text: str
    translation: Optional[str] = None

async def get_verse(verse_id: int) -> VerseResponse:
    verse = await verse_service.get(verse_id)
    if not verse:
        raise HTTPException(status_code=404, detail="Verse not found")
    return VerseResponse.model_validate(verse)
```

### TypeScript/JavaScript (Frontend)

**Imports**:
- React imports first, then external libraries, then local components/hooks
- Use path aliases: `@/components/Button`
- Avoid default exports (use named exports)

**Formatting**:
- Use Prettier for formatting
- 2-space indentation
- Single quotes for strings

**Types**:
- Use TypeScript strict mode
- Prefer interfaces for object shapes
- Use `type` for unions, intersections
- Never use `any`

**Naming**:
- `camelCase` for variables/functions
- `PascalCase` for components
- `kebab-case` for file names
- Prefix custom hooks with `use`

**RTL Support**:
- Use `I18nManager` from Expo
- Use `start`/`end` instead of `left`/`right` for positioning
- Test all UI in both LTR and RTL modes

**Example**:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Verse } from '@/types';

interface VerseCardProps {
  verse: Verse;
  onPress?: (verse: Verse) => void;
}

export const VerseCard: React.FC<VerseCardProps> = ({ verse, onPress }) => {
  return (
    <View style={styles.container} onPress={() => onPress?.(verse)}>
      <Text style={styles.arabic}>{verse.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  arabic: { textAlign: 'right', fontSize: 24 },
});
```

## Testing Guidelines

### Backend Tests

- Use `pytest` with `pytest-asyncio` for async tests
- Use `httpx` for HTTP client testing
- Mock external services (Gemini API, ChromaDB)
- Place tests mirroring source structure in `tests/`

```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
```

### Frontend Tests

- Use Jest + React Native Testing Library
- Test components in isolation
- Mock API calls

## API Design

### Endpoints

- Use versioning: `/api/v1/`
- Use RESTful conventions
- Return consistent response format
- Include pagination for lists

### Error Responses

```json
{
  "error": {
    "code": "VERSE_NOT_FOUND",
    "message": "The requested verse does not exist",
    "details": {}
  }
}
```

## Environment Variables

Never commit secrets. Use `.env` files:

```
# Backend
GEMINI_API_KEY=your_key_here
CHROMA_DB_PATH=/data/chroma

# Frontend
API_BASE_URL=http://localhost:8000
```

## Key Libraries

- **Backend**: FastAPI, Pydantic, pytest, ruff, mypy, camel-tools
- **Frontend**: Expo, React Navigation, axios, i18next

## Important Notes

1. Arabic is RTL - all text display must support RTL layout
2. Use CAMeL Tools for morphological analysis (root extraction, POS tagging)
3. Gemini API uses context caching - implement token optimization
4. RAG pipeline must ground responses in verified Quranic data
5. All user-facing text must be bilingual (Arabic + English)