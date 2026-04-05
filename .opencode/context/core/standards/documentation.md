# Documentation Standards

This file defines the documentation standards for the Arabic Morphosyntactic Explorer project.

## Purpose

These standards ensure:
- Consistent documentation across the project
- Clear explanations of features and APIs
- Bilingual support (Arabic + English) for user-facing content
- Proper maintenance of existing documentation

## Core Principles

1. **Concise and high-signal** - No fluff, get to the point
2. **Bilingual content** - All user-facing text must be in Arabic and English
3. **Keep it updated** - Update docs when code changes
4. **Use proper format** - Markdown for docs, docstrings for code

---

## Types of Documentation

### 1. Code Documentation (Docstrings)

Use Google style or NumPy style for docstrings.

```python
def analyze_morphology(text: str) -> MorphologyResult:
    """Analyze Arabic text for morphological features.

    Args:
        text: Arabic text to analyze (Quranic Arabic preferred)
        config: Optional configuration for analysis

    Returns:
        MorphologyResult containing:
            - root: The root/lemma of the word
            - pattern: The morphological pattern
            - pos: Part of speech tag

    Raises:
        MorphologyAnalysisError: If analysis fails

    Example:
        >>> result = analyze_morphology("كَتَبَ")
        >>> result.root
        'كتب'
    """
```

### 2. API Documentation

Document all API endpoints with:
- HTTP method and path
- Request parameters and body
- Response format and status codes
- Example requests and responses

```markdown
### GET /api/v1/verses/{verse_id}

Retrieve a specific verse by its ID.

**Parameters:**
- `verse_id` (path, required): Integer verse identifier

**Response:**
```json
{
  "id": 1,
  "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "translation": "In the name of Allah, the Most Gracious, the Most Merciful"
}
```

**Status Codes:**
- 200: Success
- 404: Verse not found
- 500: Internal server error
```

### 3. README Files

Each major component should have a README:
- backend/README.md
- frontend/README.md

Include:
- Setup instructions
- Configuration
- Running locally
- Testing
- Deployment (if applicable)

### 4. User-Facing Content

All text that users see must be bilingual (Arabic + English):

```typescript
// Good: Bilingual labels
const labels = {
  search: {
    ar: 'بحث',
    en: 'Search',
  },
  translation: {
    ar: 'ترجمة',
    en: 'Translation',
  },
};

// Usage
<Text>{isArabic ? labels.search.ar : labels.search.en}</Text>
```

---

## Documentation Structure

### Project Structure

```
docs/
├── README.md              # Main documentation index
├── api/                   # API documentation
│   ├── endpoints.md      # Endpoint reference
│   └── models.md         # Data models
├── guides/               # How-to guides
│   ├── setup.md          # Setup guide
│   ├── development.md    # Development guide
│   └── deployment.md     # Deployment guide
└── architecture/         # Architecture docs
    ├── overview.md       # System overview
    └── components.md     # Component diagrams
```

### File Naming

- Use kebab-case: `setup-guide.md`, `api-endpoints.md`
- Use descriptive names: `backend-api-reference.md` not `api.md`
- Include version if needed: `api-v1-reference.md`

---

## Formatting Guidelines

### Markdown

- Use ATX-style headers (# ## ###)
- Use fenced code blocks with language identifiers
- Use tables for structured data
- Use bullet lists for sequential steps
- Use bold for important terms

```markdown
## Getting Started

1. Install dependencies:
   ```bash
   cd backend && pip install -r requirements.txt
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Code in Docs

- Always specify the language for syntax highlighting
- Use absolute paths where possible
- Include all necessary imports
- Show complete examples, not snippets

```python
# Good: Complete example
from app.services.morphology import MorphologyService

service = MorphologyService()
result = service.analyze("كَتَبَ")
print(result.root)  # Output: كتب
```

---

## Maintenance

### When to Update Docs

- When adding new features
- When changing API endpoints
- When adding new configuration options
- When fixing bugs that affect user behavior

### Review Checklist

Before committing documentation:
- [ ] Grammar and spelling checked
- [ ] Code examples tested
- [ ] Links are valid
- [ ] Bilingual content verified (if applicable)
- [ ] Version/date stamps updated

---

## Version and Date

All documentation files should include:
- Last updated date
- Version number (if applicable)

```markdown
---
last_updated: 2026-04-04
version: 1.0.0
---
```

---

## Tools

| Tool | Purpose |
|------|---------|
| **Markdown** | Main documentation format |
| **MkDocs** | Static site generator (optional) |
| **Sphinx** | API documentation (optional) |

---

## Examples

### Backend README

```markdown
# Backend API

Islamic text analysis API with morphological parsing.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000
```

## Configuration

Create `.env` file:

```env
GEMINI_API_KEY=your_key_here
CHROMA_DB_PATH=/data/chroma
```

## Testing

```bash
pytest tests/ -v
```

## API Endpoints

See [API Reference](./api/endpoints.md)
```

### Frontend README

```markdown
# Frontend App

React Native (Expo) mobile application for Arabic morphosyntactic exploration.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npx expo start
```

## Configuration

Update `app.json` with your API endpoint:

```json
{
  "extra": {
    "API_BASE_URL": "http://localhost:8000"
  }
}
```

## RTL Support

This app supports RTL layout for Arabic. See [RTL Guide](./guides/rtl-support.md).

## Testing

```bash
npm test
```
```