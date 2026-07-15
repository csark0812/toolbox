# Dialogue contract

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

**Portable stub (incomplete):** Toolbox ships only this baseline. **Product checks (JTBD / trust / cross-surface) are not defined here.**

Consumer projects remap the full dialogue contract through hook-injected customize / alwaysInclude context (`shared-agent-references` → docs `dialogue-contract.md` or equivalent).

## What this file is for

- Canonical ambient SSOT for skills — opened via GitHub raw URLs from installed skill bodies.
- Prevents agents from treating a thinned matrix as complete consumer product gates.

## Portable baseline (incomplete)

Invariants shared by dialogue modes (crystallize / grill). Full Product checks and consumer handoffs live in the consumer SSOT.

1. **Repo-first** — Prefer search/read over asking the user for repo-answerable facts.
2. **One branch at a time** — Exhaust the active thread before breadth.
3. **Anti-premature closure** — Do not ship exit artifacts until that mode’s exit tests are met.
4. **Concise turns** — Short mirrors and questions; sessions may run many turns.

**If you only have this stub:** prefer the hook-injected dialogue-contract context when skill read provided it before applying Product checks or consumer product ambient gates.

## Related

- Mode protocols live in each skill’s `SKILL.md`.
- Full consumer handoffs → hook-injected dialogue-handoffs SSOT.
