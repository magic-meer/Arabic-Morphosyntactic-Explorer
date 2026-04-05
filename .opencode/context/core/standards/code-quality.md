# Code Quality Standards

This file defines the code quality standards for the Arabic Morphosyntactic Explorer project.

## Purpose

These standards ensure:
- Consistent code quality across the project
- Maintainable and reusable components
- Proper error handling and logging
- Type safety and documentation

## Core Principles

1. **Write clean code** - Clear structure, proper naming, good documentation
2. **Use standard ways** - Follow established patterns; no shortcuts
3. **Build modularly** - Components should be decoupled and reusable (project serves as module for larger project)
4. **Use proper tools** - Linters, type checkers, formatters, test runners

---

## Python (Backend) Standards

### Imports

Order: Standard library → Third-party → Local
Use absolute imports: `from app.api import routes`

```python
import os
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.verse_service import VerseService
```

### Formatting

- Max line length: 88 characters (Black default)
- Use `black .` for formatting
- Use `isort .` for import sorting

### Type Hints

- Use type hints for ALL function signatures
- Prefer `Optional[X]` over `X | None`
- Use Pydantic models for request/response schemas
- Avoid `Any` unless absolutely necessary

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Functions/variables | snake_case | `get_verse()`, `verse_id` |
| Classes | PascalCase | `VerseResponse`, `MorphologyService` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_VERSES`, `API_PREFIX` |
| Private methods | prefix with `_` | `_parse_morphology()` |

### Error Handling

- Use custom exception classes inheriting from `HTTPException`
- Return proper HTTP status codes (200, 400, 404, 500)
- Log errors with appropriate levels (`logger.error()`, `logger.warning()`)
- NEVER expose raw exception details to clients

```python
class VerseNotFoundError(HTTPException):
    def __init__(self, verse_id: int):
        super().__init__(
            status_code=404,
            detail={"code": "VERSE_NOT_FOUND", "message": f"Verse {verse_id} not found"}
        )

async def get_verse(verse_id: int) -> VerseResponse:
    verse = await verse_service.get(verse_id)
    if not verse:
        raise VerseNotFoundError(verse_id)
    return VerseResponse.model_validate(verse)
```

### Documentation

- Use docstrings for all public functions and classes
- Follow Google style or NumPy style
- Include type hints in docstrings

```python
async def analyze_morphology(text: str) -> MorphologyResult:
    """Analyze Arabic text for morphological features.

    Args:
        text: Arabic text to analyze (Quranic Arabic preferred)

    Returns:
        MorphologyResult containing root, pattern, and POS tags

    Raises:
        MorphologyAnalysisError: If analysis fails
    """
```

---

## TypeScript/JavaScript (Frontend) Standards

### Imports

Order: React → External libraries → Local components/hooks
Use path aliases: `@/components/Button`
Avoid default exports (use named exports)

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { VerseCard } from '@/components/VerseCard';
import { useMorphology } from '@/hooks/useMorphology';
```

### Formatting

- Use Prettier for formatting
- 2-space indentation
- Single quotes for strings

### TypeScript Strict Mode

- Prefer interfaces for object shapes
- Use `type` for unions, intersections
- NEVER use `any`

```typescript
interface Verse {
  id: number;
  text: string;
  translation: string;
}

type MorphologyState = 'idle' | 'loading' | 'success' | 'error';
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables/functions | camelCase | `getVerse()`, `verseList` |
| Components | PascalCase | `VerseCard`, `MorphologyViewer` |
| File names | kebab-case | `verse-card.tsx`, `use-morphology.ts` |
| Custom hooks | prefix `use` | `useMorphology()`, `useVerse()` |

### RTL Support

Arabic is RTL - all text display must support RTL layout:
- Use `I18nManager` from Expo
- Use `start`/`end` instead of `left`/`right` for positioning
- Test all UI in both LTR and RTL modes

```typescript
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingStart: 16,  // Use start/end, not left/right
    paddingEnd: 8,
  },
  text: {
    textAlign: 'right',  // For Arabic text
  },
});
```

---

## Required Tools

### Backend

| Tool | Purpose | Command |
|------|---------|---------|
| **Black** | Code formatting | `black .` |
| **isort** | Import sorting | `isort .` |
| **ruff** | Linting | `ruff check .` |
| **mypy** | Type checking | `mypy app/` |
| **pytest** | Testing | `pytest tests/ -v` |
| **pytest-cov** | Coverage | `pytest --cov=app` |

### Frontend

| Tool | Purpose | Command |
|------|---------|---------|
| **ESLint** | Linting | `npx eslint src/` |
| **Prettier** | Formatting | `npx prettier --write` |
| **TypeScript** | Type checking | `npx tsc --noEmit` |
| **Jest** | Testing | `npm test` |

---

## Git Workflow

1. **Commit at logical checkpoints** - Every meaningful change should be tracked
2. **Use meaningful commit messages** - Explain "why", not just "what"
3. **Never commit secrets** - Use `.env` files, add to `.gitignore`
4. **Create feature branches** - Keep main branch stable

```bash
# Good commit messages
git commit -m "Add morphological analysis service for Arabic text parsing"
git commit -m "Fix RTL layout issue in verse display component"
git commit -m "Implement RAG pipeline with ChromaDB vector storage"

# Bad commit messages
git commit -m "fix"
git commit -m "changes"
```

---

## Module Design

This project serves as a module for a larger future project. Therefore:

1. **Loose coupling** - Minimize dependencies between components
2. **Clear interfaces** - Use Pydantic models (backend) and interfaces (frontend)
3. **Reusable functions** - Avoid hardcoded values, use configuration
4. **Export commonly used utilities** - Make them easily importable

```python
# Good: Reusable service
class MorphologyService:
    def __init__(self, config: MorphologyConfig):
        self.config = config
    
    def analyze(self, text: str) -> MorphologyResult:
        # ...

# Avoid: Hardcoded logic
def analyze(text: str) -> dict:
    # Using hardcoded paths, no configuration
    ...
```

---

## Examples

### Python Service

```python
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1")

class VerseResponse(BaseModel):
    id: int
    text: str = Field(..., description="Arabic verse text")
    translation: Optional[str] = Field(None, description="English translation")

async def get_verse(verse_id: int) -> VerseResponse:
    """Retrieve a specific verse by ID."""
    verse = await verse_service.get(verse_id)
    if not verse:
        raise HTTPException(status_code=404, detail="Verse not found")
    return VerseResponse.model_validate(verse)
```

### TypeScript Component

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
      <Text style={styles.translation}>{verse.translation}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  arabic: { textAlign: 'right', fontSize: 24, color: '#000' },
  translation: { textAlign: 'left', fontSize: 14, color: '#666' },
});
```