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
| `gh` | project-tracking, `pull-request` skill (apply body) | File output only; skip `gh pr edit` |
| Linear MCP | project-tracking `start`/`finish` | Fail on `start`; warn on `finish` |
| Backend `:8000` + search-api `:4000` | `bun run generate-clients` (see [builds.md](../../../docs/developer/builds.md)) | Document trap; do not run client gen — not a standalone skill |

## Final response shape

Every operational skill ends with **at least one** of:

1. **Outcome block** — what was done or decided (2–5 sentences max).
2. **Structured section** — skill-specific headings (see each skill).
3. **Next steps** — bullets with skill handoffs when work continues elsewhere.

Use repo-relative paths in backticks. Prefer imperative leads for action items.

## Validation defaults

For code changes, prefer scoped verification (see [validation.md](../../../docs/developer/validation.md)):

- `bun run validate:changed <path>` — agent default; routes by path type (TS/Python source may use `validate:small` internally)
- `bun run validate:changed --pre-pr <path…>` — TS pre-PR
- Avoid full `bun run lint`, `bun run check`, or `bun run static:check` for small edits
