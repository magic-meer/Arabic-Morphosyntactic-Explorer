# Code Review Workflow

This file defines the code review process for the Arabic Morphosyntactic Explorer project.

## Purpose

The code review process ensures:
- Code quality and consistency
- Security vulnerabilities are caught
- Performance issues are identified
- Best practices are followed
- Knowledge sharing among team members

## Core Principles

1. **Be constructive** - Focus on improving code, not criticizing
2. **Be specific** - Give concrete examples and suggestions
3. **Be timely** - Review promptly to keep momentum
4. **Be thorough** - Check all aspects, don't skip details

---

## Review Checklist

### Code Quality

- [ ] Code follows project style guidelines
- [ ] Variable/function names are descriptive
- [ ] Code is modular and reusable
- [ ] No duplicate code
- [ ] Complex logic is well-commented

### Functionality

- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs or logic errors

### Security

- [ ] No sensitive data exposed
- [ ] Input validation is performed
- [ ] No SQL injection vulnerabilities
- [ ] API keys/secrets are not hardcoded
- [ ] Authentication/authorization is properly implemented

### Performance

- [ ] No unnecessary database queries
- [ ] Large data sets are paginated
- [ ] Caching is used where appropriate
- [ ] No memory leaks

### Testing

- [ ] Unit tests are included
- [ ] Tests cover edge cases
- [ ] Tests are maintainable
- [ ] Code is testable (not tightly coupled)

### Documentation

- [ ] Docstrings are present for public APIs
- [ ] Complex logic is documented
- [ ] README is updated if needed
- [ ] API changes are documented

---

## Review Process

### 1. Self-Review Before Submission

Before creating a PR, review your own code:

```bash
# Run linter
cd backend && ruff check .
cd frontend && npx eslint src/

# Run type checker
cd backend && mypy app/
cd frontend && npx tsc --noEmit

# Run tests
cd backend && pytest -v
cd frontend && npm test
```

### 2. Create Pull Request

When creating a PR:
- Provide a clear description
- Link related issues
- Include screenshots for UI changes
- List any manual testing performed

### 3. Review Process

Reviewers should:
1. Read the PR description
2. Check out the branch locally
3. Run the code and tests
4. Review each changed file
5. Leave constructive comments
6. Approve or request changes

### 4. Addressing Feedback

When receiving feedback:
- Don't take it personally
- Ask for clarification if needed
- Make changes or explain why not
- Re-request review after changes

---

## Common Issues to Look For

### Backend (Python)

| Issue | Example | Fix |
|-------|---------|-----|
| Missing type hints | `def get(x):` | `def get(x: int) -> str:` |
| Bare exceptions | `except:` | `except ValueError:` |
| Hardcoded secrets | `api_key = "abc123"` | Use environment variables |
| SQL injection | `f"SELECT * FROM {table}"` | Use parameterized queries |
| Blocking calls in async | `time.sleep(1)` | Use `await asyncio.sleep(1)` |

### Frontend (TypeScript)

| Issue | Example | Fix |
|-------|---------|-----|
| Using `any` | `const x: any` | Use specific types |
| Missing error handling | `.then()` without `.catch()` | Add error handling |
| Memory leaks | Missing cleanup in useEffect | Return cleanup function |
| Not handling loading state | No loading indicator | Add loading UI |
| Hardcoded strings | `"Submit"` | Use i18n keys |

---

## Review Comments

### Good Comments

```markdown
# Good: Specific and actionable
The `analyze` function should handle empty strings.
Consider adding:
```python
if not text.strip():
    raise ValueError("Text cannot be empty")
```
```

### Bad Comments

```markdown
# Bad: Vague and unhelpful
This code is bad, please fix it.
```

### Comment Templates

#### Suggesting a Change

```markdown
**Suggestion:** Consider using `X` instead of `Y`.

**Reason:** `X` is more efficient for this use case.

**Example:**
```python
# Instead of:
results = [item for item in items if item.id in ids]

# Consider:
results = [item for item in items if item.id in id_set]
```
```

#### Pointing Out a Bug

```markdown
**Bug:** This code doesn't handle the case when `verse_id` is negative.

**Impact:** Could return incorrect data or cause errors.

**Suggested fix:**
```python
if verse_id < 1:
    raise HTTPException(status_code=400, detail="Invalid verse ID")
```
```

#### Asking for Clarification

```markdown
**Question:** Why did you choose to use `X` here?

I'm not familiar with this pattern. Could you explain the reasoning?
```

---

## Approval Guidelines

### Minimum Reviewers

- 1 reviewer for simple changes
- 2 reviewers for major changes

### When to Approve

- All comments have been addressed
- Tests pass
- Code follows standards
- No security issues

### When to Request Changes

- Major issues found
- Tests are failing
- Code doesn't follow standards
- Missing documentation

---

## Tools

| Tool | Purpose |
|------|---------|
| **GitHub PRs** | Code review platform |
| **ruff** | Python linting |
| **mypy** | Python type checking |
| **ESLint** | JavaScript linting |
| **Prettier** | Code formatting |

---

## Example Review

### PR Title
"Add morphological analysis endpoint"

### Changes
- Added `/api/v1/morphology/analyze` endpoint
- Created `MorphologyService` class
- Added unit tests

### Review

```
Reviewed-by: [Reviewer Name]

Overall: Looks good! Just a few small suggestions.

1. **Type hints:** The `analyze` function is missing return type hint.
   - Line 45: Add `-> MorphologyResult` to the function signature

2. **Error handling:** Consider handling the case when CAMeL Tools
   fails to parse the text.

3. **Tests:** Good test coverage. Consider adding a test for empty
   string input.

Otherwise, the code is clean and follows project standards. ✓
```

---

## Tracking Reviews

Use GitHub's review features:
- Comment: General feedback
- Suggest: Code change suggestion
- Approve: Ready to merge
- Request changes: Needs work

---

## Post-Review

After approval:
1. Squash and merge (if appropriate)
2. Delete feature branch
3. Close related issues
4. Update project board