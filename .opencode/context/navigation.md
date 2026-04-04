# Context Navigation

This file provides an index of all available context files for the Arabic Morphosyntactic Explorer project.

## Context Structure

```
.opencode/context/
├── navigation.md              # This file - context index
├── core/
│   ├── standards/
│   │   ├── code-quality.md    # Code style and quality standards
│   │   ├── documentation.md  # Documentation guidelines
│   │   └── test-coverage.md   # Testing requirements
│   └── workflows/
│       ├── code-review.md    # Code review process
│       └── task-delegation-basics.md  # How to delegate tasks
```

## When to Use Which Context

| Task Type | Context File |
|----------|--------------|
| Writing/editing code | `.opencode/context/core/standards/code-quality.md` |
| Writing documentation | `.opencode/context/core/standards/documentation.md` |
| Writing tests | `.opencode/context/core/standards/test-coverage.md` |
| Code review | `.opencode/context/core/workflows/code-review.md` |
| Delegating to subagents | `.opencode/context/core/workflows/task-delegation-basics.md` |

## Trigger Keywords

- **code-quality.md**: `clean code`, `code style`, `formatting`, `type hints`, `naming`
- **documentation.md**: `docs`, `write docs`, `document`, `README`
- **test-coverage.md**: `test`, `coverage`, `pytest`, `unittest`, `mock`
- **code-review.md**: `review`, `reviewer`, `check code`
- **task-delegation-basics.md**: `delegate`, `subagent`, `task tool`

## Dependencies

Some context files depend on others:
- `code-quality.md` - Required for ALL code tasks
- `documentation.md` - Required for docs tasks
- `test-coverage.md` - Required for test tasks
- `code-review.md` - Required for review tasks
- `task-delegation-basics.md` - Required when using task tool

## How to Load

Before any task execution:
1. Read the relevant context file(s) using the Read tool
2. Apply the standards when writing code/docs/tests
3. For delegation, pass context to subagent in the prompt

## Notes

- This project uses OpenCode's agent system for task execution
- All context files follow the same structure: Purpose → Requirements → Examples
- Context files are mandatory for consistent project standards
