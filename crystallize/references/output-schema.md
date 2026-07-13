<!-- skeleton: generated-reference
source: .skeleton/references/output-schema.md
redundancy: intentional
-->

# Shared output schema

Operational skills that produce user-facing results should follow this baseline. Skill-specific sections extend — not replace — these rules.

## Triggers (frontmatter)

- **Strong:** concrete situation + artifact ("fix CI failure", "wire domain X").
- **Weak:** generic "help with code" — route via project entry doc or skills index.
- **Not this skill:** list explicit handoffs to adjacent skills when boundaries overlap.

## Preflight

Before running a skill that needs external tools, verify or state fallback:

| Tool | Typical use | If missing |
|------|-------------|------------|
| Docker | backend dev/test, integration tests | Scope to file lint/typecheck; say backend verify blocked |
| `gh` | PR/issue workflows | File output only; skip `gh pr edit` when `gh` missing |
| Issue tracker MCP | issue `start`/`finish` | Fail on `start`; warn on `finish` |

## Final response shape

Every operational skill ends with **at least one** of:

1. **Outcome block** — what was done or decided (2–5 sentences max).
2. **Structured section** — skill-specific headings (see each skill).
3. **Next steps** — bullets with skill handoffs when work continues elsewhere.

Use repo-relative paths in backticks. Prefer imperative leads for action items.

## Validation defaults

For code changes, prefer scoped verification on touched paths — avoid full-repo lint/check for small edits.
