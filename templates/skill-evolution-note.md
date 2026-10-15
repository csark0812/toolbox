# Skill evolution note

Copy into `_agent/` or paste into a PR description. Do not commit into skill bodies.

## Failure

- **Suite:**
- **Scenario:**
- **Run:** `npm run agent:test:live -- "<test title>"` (date / execution id)
- **Failed rubric:** `must` | `mustNot` | `judge` — which clause?

## Claim under test

- **Skill:**
- **Skill sentence under test:**
- **Confidence before:**

## Triage

What did the agent do wrong? (1–3 sentences. Cite the execution's `normalized.json` or viewer link.)

## Proposed patch

- [ ] `SKILL.md` —
- [ ] New or updated claim in `agent-suites/<skill>/claims.json` —
- [ ] vitest string lock —

## Decision

- [ ] **Keep** — apply patch, lock it, and confirm with the skill bench
- [ ] **Reject** — failure is model noise / prompt issue
- [ ] **Defer** — needs more outcome runs

## Follow-up scenario

- **Name:**
- **Band:** contract | outcome
