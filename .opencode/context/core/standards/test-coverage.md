# Test Coverage Standards

This file defines the testing requirements for the Arabic Morphosyntactic Explorer project.

## Purpose

These standards ensure:
- Comprehensive test coverage
- Maintainable and readable tests
- Proper mocking of external dependencies
- Reliable CI/CD pipelines

## Core Principles

1. **Test what matters** - Focus on critical paths and edge cases
2. **Mock external services** - Never call real APIs in tests
3. **Follow patterns** - Use consistent test structure
4. **Maintain coverage** - Don't let coverage drop below thresholds

---

## Backend Testing (Python/FastAPI)

### Test Framework

- **pytest** - Test runner
- **pytest-asyncio** - Async test support
- **httpx** - HTTP client for API testing
- **pytest-mock** - Mocking support

### Test Structure

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py           # Shared fixtures
│   ├── api/
│   │   ├── __init__.py
│   │   └── test_routes.py    # API endpoint tests
│   ├── services/
│   │   ├── __init__.py
│   │   └── test_morphology.py  # Service tests
│   └── utils/
│       ├── __init__.py
│       └── test_helpers.py   # Utility tests
```

### Test File Naming

- Use `test_*.py` for test files
- Mirror source structure in `tests/` directory

### Test Functions

Use descriptive names: `test_*_should_*`

```python
@pytest.mark.asyncio
async def test_get_verse_should_return_verse_when_exists():
    """Test that get_verse returns verse data when it exists."""
    # Arrange
    verse_id = 1
    expected_verse = {"id": 1, "text": "بِسْمِ اللَّهِ"}

    # Act
    response = await client.get(f"/api/v1/verses/{verse_id}")

    # Assert
    assert response.status_code == 200
    assert response.json() == expected_verse
```

### Fixtures (conftest.py)

```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
def mock_gemini_response():
    """Mock Gemini API response for testing."""
    return {
        "candidates": [{
            "content": {
                "parts": [{
                    "text": "Analysis result"
                }]
            }
        }]
    }

@pytest.fixture
async def client():
    """Async HTTP client for testing."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

### Mocking External Services

**Never call real APIs in tests:**

```python
# Good: Mock the service
@pytest.fixture
def mock_morphology_service(mocker):
    mock = mocker.patch("app.services.morphology.MorphologyService.analyze")
    mock.return_value = MorphologyResult(
        root="كتب",
        pattern="فَعَلَ",
        pos="verb"
    )
    return mock

# Bad: Using real service
service = MorphologyService()
result = service.analyze("كَتَبَ")  # Calls real CAMeL Tools
```

### Testing Async Code

```python
import pytest

@pytest.mark.asyncio
async def test_morphology_analysis():
    """Test async morphological analysis."""
    service = MorphologyService()
    result = await service.analyze("كَتَبَ")

    assert result.root == "كتب"
    assert result.pos == "verb"
```

---

## Frontend Testing (TypeScript/React Native)

### Test Framework

- **Jest** - Test runner
- **React Native Testing Library** - Component testing
- **jest-fetch-mock** - API mocking

### Test Structure

```
frontend/
├── src/
│   └── __tests__/
│       ├── components/
│       │   └── VerseCard.test.tsx
│       ├── hooks/
│       │   └── useMorphology.test.ts
│       └── services/
│           └── api.test.ts
```

### Component Testing

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VerseCard } from '../components/VerseCard';

describe('VerseCard', () => {
  const mockVerse = {
    id: 1,
    text: 'بِسْمِ اللَّهِ',
    translation: 'In the name of Allah',
  };

  it('should render verse text', () => {
    const { getByText } = render(<VerseCard verse={mockVerse} />);
    expect(getByText('بِسْمِ اللَّهِ')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <VerseCard verse={mockVerse} onPress={onPress} />
    );

    fireEvent.press(getByText('بِسْمِ اللَّهِ'));
    expect(onPress).toHaveBeenCalledWith(mockVerse);
  });
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useMorphology } from '../hooks/useMorphology';

describe('useMorphology', () => {
  it('should analyze text', async () => {
    const { result } = renderHook(() => useMorphology());

    await act(async () => {
      await result.current.analyze('كَتَبَ');
    });

    expect(result.current.result).toEqual({
      root: 'كتب',
      pattern: 'فَعَلَ',
      pos: 'verb',
    });
  });
});
```

### Mocking API Calls

```typescript
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.enableMocks();
});

fetch.mockMock('/api/v1/morphology', {
  root: 'كتب',
  pattern: 'فَعَلَ',
  pos: 'verb',
});
```

---

## Test Coverage Requirements

### Minimum Coverage Thresholds

| Component | Minimum Coverage |
|-----------|-----------------|
| Backend services | 80% |
| Backend API routes | 90% |
| Frontend components | 70% |
| Frontend hooks | 80% |

### Running Coverage

```bash
# Backend
cd backend
pytest --cov=app --cov-report=term-missing

# Frontend
cd frontend
npm test -- --coverage
```

---

## Test Patterns

### Arrange-Act-Assert (AAA)

```python
# Arrange - Set up test data and conditions
verse_id = 1

# Act - Perform the action being tested
response = await client.get(f"/api/v1/verses/{verse_id}")

# Assert - Verify the expected outcome
assert response.status_code == 200
```

### Given-When-Then (GWT)

```typescript
// Given - Preconditions
const verse = { id: 1, text: 'بِسْمِ اللَّهِ' };

// When - Action
const { getByText } = render(<VerseCard verse={verse} />);

// Then - Expected outcome
expect(getByText('بِسْمِ اللَّهِ')).toBeTruthy();
```

---

## CI/CD Integration

### GitHub Actions (Example)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: pytest --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Best Practices

### Do

- Write tests before fixing bugs (regression tests)
- Test edge cases and error conditions
- Use meaningful test names
- Keep tests independent
- Clean up after tests (mock reset, file cleanup)

### Don't

- Don't test implementation details
- Don't use sleep() for async waits
- Don't test external APIs directly
- Don't leave commented-out tests
- Don't ignore test failures

---

## Running Tests

### Backend

```bash
# Run all tests
cd backend && pytest -v

# Run specific test file
cd backend && pytest tests/test_api.py -v

# Run specific test function
cd backend && pytest tests/test_api.py::test_health_check -v

# Run with coverage
cd backend && pytest --cov=app --cov-report=term-missing

# Run only failed tests
cd backend && pytest --lf
```

### Frontend

```bash
# Run all tests
cd frontend && npm test

# Run tests in watch mode
cd frontend && npm test -- --watch

# Run tests with coverage
cd frontend && npm test -- --coverage
```