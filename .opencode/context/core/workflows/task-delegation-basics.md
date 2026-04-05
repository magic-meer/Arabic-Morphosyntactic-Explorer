# Task Delegation Basics

This file describes how to effectively delegate tasks to subagents in the Arabic Morphosyntactic Explorer project.

## Purpose

Proper delegation ensures:
- Clear task descriptions
- Relevant context provided
- Proper expectations set
- Quality maintained

## When to Delegate

Delegate when tasks meet ANY of these criteria:
- **Scale**: 4+ files to modify
- **Complexity**: Multiple dependencies or steps
- **Expertise**: Requires specialist knowledge (tests, review, docs)
- **Time**: Estimated >30 minutes
- **User Request**: Explicitly asked for delegation

---

## Delegation Process

### 1. Identify the Task Type

| Task Type | Subagent | Context to Load |
|-----------|----------|-----------------|
| Write code | CoderAgent | code-quality.md |
| Write tests | TestEngineer | test-coverage.md |
| Code review | CodeReviewer | code-review.md |
| Write docs | DocWriter | documentation.md |
| Explore codebase | explore | None required |
| Complex breakdown | TaskManager | code-quality.md |

### 2. Gather Context

Before delegating, load relevant context files:

```bash
# Load code quality standards
read .opencode/context/core/standards/code-quality.md

# Load test coverage standards
read .opencode/context/core/standards/test-coverage.md
```

### 3. Create Context Bundle

For complex tasks, create a context bundle:

```markdown
# Context Bundle

## Task Description
[What needs to be done]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Context Files
- .opencode/context/core/standards/code-quality.md

## Files to Modify
- src/services/morphology.ts
- src/components/MorphologyViewer.tsx

## Expected Output
[What the task should produce]
```

---

## Subagent Invocation

### Syntax

```javascript
task(
  subagent_type="CoderAgent",  // or TestEngineer, CodeReviewer, etc.
  description="Brief description of task",
  prompt="Detailed instructions with context"
)
```

### Example: Delegating Code Writing

```javascript
task(
  subagent_type="CoderAgent",
  description="Create morphology service",
  prompt="Context to load:
          - .opencode/context/core/standards/code-quality.md
          
          Task: Create MorphologyService class in backend/app/services/morphology.py
          
          Requirements:
          - Use Pydantic models for request/response
          - Implement analyze(text: str) -> MorphologyResult
          - Use CAMeL Tools for parsing
          - Handle errors gracefully
          - Include type hints for all functions
          
          File: backend/app/services/morphology.py
          
          Expected behavior:
          - Accept Arabic text input
          - Return root, pattern, and POS tags"
)
```

### Example: Delegating Test Writing

```javascript
task(
  subagent_type="TestEngineer",
  description="Write morphology service tests",
  prompt="Context to load:
          - .opencode/context/core/standards/test-coverage.md
          
          Task: Write unit tests for MorphologyService
          
          Requirements:
          - Test analyze() with valid input
          - Test analyze() with empty input (should error)
          - Test analyze() with invalid Arabic (should handle gracefully)
          - Use pytest and pytest-asyncio
          - Mock the CAMeL Tools dependency
          
          File: backend/tests/services/test_morphology.py
          
          Test structure: Arrange-Act-Assert pattern"
)
```

### Example: Delegating Documentation

```javascript
task(
  subagent_type="DocWriter",
  description="Document morphology API",
  prompt="Context to load:
          - .opencode/context/core/standards/documentation.md
          
          Task: Document the morphology analysis API
          
          Requirements:
          - Document /api/v1/morphology/analyze endpoint
          - Include request/response formats
          - Add example requests
          - Use proper Markdown formatting
          
          Files:
          - docs/api/endpoints.md (add new section)
          
          Style: Concise, high-signal, bilingual (Arabic + English)"
)
```

---

## Context Passing

### Inline Context (Simple Tasks)

For simple tasks, pass context directly in the prompt:

```javascript
task(
  subagent_type="TestEngineer",
  description="Write API tests",
  prompt="Context: .opencode/context/core/standards/test-coverage.md
  
  Task: Write tests for /api/v1/verses endpoint"
)
```

### Context Bundle (Complex Tasks)

For complex tasks with multiple files and requirements:

1. Create bundle file: `.tmp/context/{session-id}/bundle.md`
2. Include all context files + task description + constraints
3. Pass to subagent: "Load context from .tmp/context/{session-id}/bundle.md"

```markdown
# Task Bundle

## Task
Implement morphological analysis feature

## Context Files
- .opencode/context/core/standards/code-quality.md

## Requirements
- Use CAMeL Tools for Arabic parsing
- Return root, pattern, POS tags
- Handle errors gracefully

## Files
- backend/app/services/morphology.py
- backend/app/api/routes/morphology.py
```

---

## Subagent Types

### CoderAgent
- Executes coding subtasks
- Writes new code or modifies existing
- Follows code-quality.md

### TestEngineer
- Writes unit and integration tests
- Follows test-coverage.md
- Uses pytest (backend) or Jest (frontend)

### CodeReviewer
- Reviews code for quality
- Checks for security issues
- Follows code-review.md

### DocWriter
- Writes and updates documentation
- Follows documentation.md
- Maintains bilingual content

### explore
- Explores codebase
- Finds files by patterns
- Answers research questions

### TaskManager
- Breaks complex features into subtasks
- Creates dependency structure
- Returns JSON task files

---

## Best Practices

### Do

- Be specific about requirements
- Provide all relevant context
- Set clear expectations
- Include examples when helpful
- Check progress regularly

### Don't

- Don't delegate without context
- Don't give vague instructions
- Don't forget to specify the framework
- Don't skip error handling requirements

---

## Verification

After delegation completes:
1. Review the changes
2. Run tests
3. Verify against requirements
4. Check code quality

---

## Examples

### Simple Delegation

**Task:** "Add a search button to the header"

```javascript
task(
  subagent_type="CoderAgent",
  description="Add search button to header",
  prompt="Context: .opencode/context/core/standards/code-quality.md
  
  Task: Add a search button to the Header component in frontend/src/components/Header.tsx
  
  Requirements:
  - Button should trigger search modal
  - Follow existing component patterns
  - Support RTL layout
  - Use proper TypeScript types
  
  File: frontend/src/components/Header.tsx"
)
```

### Complex Delegation (TaskManager)

**Task:** "Implement RAG pipeline"

```javascript
task(
  subagent_type="TaskManager",
  description="Break down RAG pipeline feature",
  prompt="Context: .opencode/context/core/standards/code-quality.md
  
  Task: Break down the RAG pipeline implementation into subtasks
  
  Scope:
  - ChromaDB integration for vector storage
  - Text chunking for Quranic verses
  - Embedding generation using Gemini
  - Similarity search endpoint
  
  Out of scope:
  - Frontend UI
  - Authentication
  
  Create: .tmp/tasks/rag-pipeline/task.json + subtask_*.json files"
)
```

---

## Monitoring

Track delegated tasks:
- Check completion status
- Review intermediate results
- Provide feedback early
- Re-delegate if needed

---

## Error Handling

If delegation fails:
1. Identify the issue
2. Re-delegate with more context
3. Handle directly if simple
4. Ask user for clarification