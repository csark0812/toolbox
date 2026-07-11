# Shared output schema

Operational skills that produce user-facing results should follow this baseline. Skill-specific sections extend — not replace — these rules.

## Triggers (frontmatter)

- **Strong:** concrete situation + artifact ("fix CI failure", "wire TanStack Query domain X").
- **Weak:** generic "help with code" — route via [`AGENTS.md`](../../../AGENTS.md) or [`../README.md`](../README.md).
- **Not this skill:** list explicit handoffs to adjacent skills when boundaries overlap.

## Preflight

Before running a skill that needs external tools, verify or state fallback:

| Tool | Skills that need it | If missing |
|------|---------------------|------------|
| Docker | backend dev/test, integration tests | Scope to file lint/typecheck; say backend verify blocked |
| `gh` | consumer-local project-tracking, pull-request skills | File output only; skip `gh pr edit` when `gh` missing |
| Linear MCP | consumer-local project-tracking `start`/`finish` | Fail on `start`; warn on `finish` |
| Backend services | consumer client generation command | Document trap; do not run client gen — not a standalone skill |

## Final response shape

Every operational skill ends with **at least one** of:

1. **Outcome block** — what was done or decided (2–5 sentences max).
2. **Structured section** — skill-specific headings (see each skill).
3. **Next steps** — bullets with skill handoffs when work continues elsewhere.

Use repo-relative paths in backticks. Prefer imperative leads for action items.

## Validation defaults

For code changes, prefer scoped verification per consumer validate router (see `.skeleton/customize/`):

- Consumer `validate:changed <path>` or equivalent — agent default
- Avoid full-repo lint/check for small edits
