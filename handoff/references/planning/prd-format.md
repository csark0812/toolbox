<!-- skeleton: generated-reference
source: .skeleton/references/planning/prd-format.md
redundancy: intentional
-->

# PRD Output Format

**Portable soft-default (consumer remaps apply):** Toolbox ships Linear / `docs/prds/` baselines for consumers with **no** remap. **STOP:** If the consumer remaps this path via customize (`shared-agent-references` / docs), **do not execute the steps below** — open the consumer planning SSOT only. Do not treat `docs/prds/` or path examples below as authoritative when remapped.

Save to `docs/prds/<feature-slug>.md`. Create the directory if it doesn't exist.

The slug should be lowercase and hyphenated: `source-scoring`, `auth-refresh`, `bulk-export`.

## Template

```markdown
# [Feature Name]

## Problem

[1–3 sentences: What problem does this solve? Who has it? Why now?]

## Scope

**In scope:**

- [Specific capability or behavior included]
- [...]

**Out of scope:**

- [Thing that could be assumed as included but isn't]
- [...]

## User Stories

- As a [role], I want [action] so that [outcome].
- As a [role], I want [action] so that [outcome].

## Key Modules / Components

- `[path or component name]` — [one-line purpose and what changes]
- `[path or component name]` — [one-line purpose and what changes]

## Acceptance Criteria

- [ ] [Testable, unambiguous criterion]
- [ ] [Testable, unambiguous criterion]

## Notes / Constraints

[Non-obvious constraints, dependencies, open questions, or decisions deferred to implementation]
```

## Writing Guidelines

**Problem section:**

- Name the user or role experiencing the problem
- Be specific about the gap — not "users need X" but "users currently cannot X when Y"
- One paragraph maximum

**Scope:**

- Out-of-scope section is required. If everything is in scope, list adjacent features that could be confused as included.
- Scope should be specific enough that two engineers reading it would scope the work the same way.

**User stories:**

- Keep to the behaviors that matter — 2–5 stories max for most features
- Avoid implementation language in user stories ("As a user, I want the API to return...") — describe the user goal

**Acceptance criteria:**

- Each criterion must be independently testable: someone should be able to say "pass" or "fail"
- Cover the main success path + at least one failure/edge case
- Mirror the user stories — every story should have at least one criterion

**Modules:**

- List only modules that change or are created — not unchanged dependencies
- Include the file path or package name so this serves as a map for implementation

## In Plan Mode

When the session is in plan mode (or the deliverable is a plan artifact, not immediate implementation):

- **Do not** output a plan whose steps are "write PRD," "gather requirements," "save file," etc.
- **Do** write the PRD **as the body of the plan** — same sections as the template above, filled in from context.
- Treat the plan document as the PRD draft. Optional closing line: "Save to `docs/prds/<slug>.md` during execution."

Normal (non–plan-mode) workflow saves to `docs/prds/<feature-slug>.md` per the path at the top of this file.
