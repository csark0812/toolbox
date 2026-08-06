# Plan review synthesis

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

How to **synthesize** after staged perspectives return — not how to spawn them ([second-opinion-dispatch.md](../../subagents/references/second-opinion-dispatch.md)).

Former “fresh read” and “completeness verify” are **parallel perspective passes** (`premises` + `completeness`), never user-chosen modes.

## Coordinator workflow

1. **Locate artifact** — plan path on disk; ask if missing.
2. **Premise surface** — extract 3–6 implicit premises; confirm top 2–3 with user when unsettled.
3. **Run perspectives** — **subagents** [second-opinion-dispatch.md](../../subagents/references/second-opinion-dispatch.md); large plans may pre-gather via [second-opinion-evidence-dispatch.md](../../subagents/references/second-opinion-evidence-dispatch.md).
4. **Synthesize** — form a **Bottom line** + **Action items** for the user ([output.md](output.md)). Use the analysis framework below only as coordinator-internal scaffolding.

**Claim anchoring:** Attackers anchor kills to plan § or premise id. Drop unanchored kills from convergent counts or tag `drift` (internal).

If user asks only “did I miss anything” or only “outsider read,” still run **both** wave-1 perspectives — weight synthesis, not pass count.

## Analysis framework (coordinator-internal)

Cover briefly while deciding the Bottom line; do **not** dump these sections to the user.

| Internal note            | Use for Bottom line / Action items                           |
| ------------------------ | ------------------------------------------------------------ |
| **What's solid**         | Confidence that design holds                                 |
| **Gaps**                 | → Action items if they block land                            |
| **Hidden dependencies**  | → Action items if unordered prerequisites remain             |
| **Risky assumptions**    | Mention in Bottom line only if they change the go/no-go call |
| **Scope / complexity**   | Structural note if under/over-sized                          |
| **Axis / readiness**     | Completeness survivors after defender rebuttal               |
| **Concrete suggestions** | → Action items                                               |

## Structural deepening (brief)

One honest line in the Bottom line when relevant — not a second full audit. Local change vs staged/ground-up per dialogue-contract.

## Principles

- Honest and objective — no softening filler.
- Cite plan paths/lines when raising Action items.
- Say so if genuinely complete — don't manufacture criticism.
- Preserve unresolved attacker/defender conflict in the Bottom line — no false consensus.
- Direct on the work; never harsh toward the person.
- User-facing exit is **Bottom line + Action items** only ([output.md](output.md)).
