# Shared output schema

Operational skills that produce user-facing results must follow this baseline. Skill-specific sections extend these rules. They do not replace them.

**User-facing results:** Write outcome text, structured sections, and next steps in pragmatic Simplified Technical English (STE). Prefer short sentences, active voice, and approved modals (`can`, `must`, `will`). Do not use `should`, `would`, `may`, `might`, or `could`. Do not use contractions. Prefer `make sure that` over `ensure`, `verify`, or `confirm` as verbs.

## Triggers (frontmatter)

- **Strong:** concrete situation + artifact ("fix CI failure", "wire domain X").
- **Weak:** generic "help with code" — route via project entry doc or skills index.
- **Not this skill:** list explicit handoffs to adjacent skills when boundaries overlap.

## Preflight

Before you run a skill that needs external tools, make sure that the tool is present, or state the fallback:

| Tool              | Typical use                         | If missing                                                             |
| ----------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| Docker            | backend dev/test, integration tests | Scope to file lint/typecheck. State that backend validation is blocked |
| `gh`              | PR/issue workflows                  | File output only. Skip `gh pr edit` when `gh` is missing               |
| Issue tracker MCP | issue `start`/`finish`              | Fail on `start`. Warn on `finish`                                      |

## Final response shape

Every operational skill ends with **at least one** of:

1. **Outcome block** — what was done or decided (2–5 sentences max).
2. **Structured section** — skill-specific headings (see each skill).
3. **Next steps** — bullets with skill handoffs when work continues elsewhere.

Use repo-relative paths in backticks. Prefer imperative leads for action items.

## Validation defaults

For code changes, prefer scoped validation on touched paths. Avoid full-repo lint/check for small edits.
