# Plan review synthesis

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

How to **synthesize** after staged perspectives return — not how to spawn them ([second-opinion-dispatch.md](../../subagents/references/second-opinion-dispatch.md)).

Former “fresh read” and “completeness verify” are **parallel perspective passes** (`premises` + `completeness`), never user-chosen modes.

## Coordinator workflow

1. **Locate artifact** — plan path on disk; ask if missing.
2. **Premise surface** — extract 3–6 implicit premises; confirm top 2–3 with user when unsettled.
3. **Run perspectives** — **subagents** [second-opinion-dispatch.md](../../subagents/references/second-opinion-dispatch.md); large plans may pre-gather via [second-opinion-evidence-dispatch.md](../../subagents/references/second-opinion-evidence-dispatch.md).
4. **Synthesize** — sections below; tag claims per [output.md](output.md).

**Claim anchoring:** Attackers anchor kills to plan § or premise id. Drop unanchored kills from convergent counts or tag `drift`.

If user asks only “did I miss anything” or only “outsider read,” still run **both** wave-1 perspectives — weight synthesis, not pass count.

## Analysis framework

Cover briefly; skip empty sections.

| Section                  | Source                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| **What's solid**         | 2–3 specific strengths (often defender concessions)                 |
| **Gaps**                 | Missing steps, unaddressed cases                                    |
| **Hidden dependencies**  | Unordered prerequisites                                             |
| **Risky assumptions**    | Treated-as-given that could be wrong                                |
| **Scope / complexity**   | Under/over-sized; structural note per dialogue-contract if relevant |
| **Axis / readiness**     | Completeness survivors after defender rebuttal                      |
| **Concrete suggestions** | Specific plan change per issue                                      |

## Structural deepening (brief)

One honest line in **Scope / complexity** or **Gaps** when relevant — not a second full audit. Local change vs staged/ground-up per dialogue-contract.

## Principles

- Honest and objective — no softening filler.
- Cite plan paths/lines when raising concerns.
- Say so if genuinely complete — don't manufacture criticism.
- Preserve unresolved attacker/defender conflict — no false consensus.
- Direct on the work; never harsh toward the person.

## Routes elsewhere

| Ask                       | Skill                               |
| ------------------------- | ----------------------------------- |
| No plan on disk           | **crystallize** / **grill**         |
| Single code hunch         | **investigate**                     |
| Security/compliance agent | consumer **security** agent         |
| Broad codebase sweep      | parallel-explore (planning ambient) |
