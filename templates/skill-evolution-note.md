# Skill evolution note

Copy into `_agent/` or paste into a PR description. Do not commit into skill bodies.

## Failure

- **Suite:**
- **Scenario:**
- **Run:** `npm run agent:test:live:debug` (date / session id)
- **Failed rubric:** `must` | `mustNot` | `judge` — which clause?

## Claim under test

- **Skill:**
- **research-basis section:**
- **Confidence before:**

## Triage

What did the agent do wrong? (1–3 sentences; cite transcript path in debug bundle)

## Proposed patch

- [ ] `SKILL.md` —
- [ ] `references/research-basis.md` —
- [ ] New contract scenario + replay fixture —
- [ ] vitest string lock —

## Decision

- [ ] **Keep** — apply patch and lock
- [ ] **Reject** — failure is model noise / prompt issue
- [ ] **Defer** — needs more outcome runs

## Follow-up scenario

- **Name:**
- **Band:** contract | outcome
