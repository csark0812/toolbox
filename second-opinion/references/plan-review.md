# Plan review synthesis

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

How to **select cast** and **synthesize** after perspectives return — not how to spawn them ([second-opinion-dispatch.md](../../subagents/references/second-opinion-dispatch.md)).

Wave-1 stances are `premises` and `completeness`. **Full** runs both then a defender; **light** runs exactly one wave-1 stance (defender optional).

## Cast routing

Precedence:

1. **Explicit user cast** — e.g. “premises only”, “skip defender”, “full debate”.
2. **Clear intent signals** — e.g. “did I miss anything?” → completeness-only light; “outsider read / premises wrong?” → premises-only light; “pressure-test this plan” / large multi-section plan / multi-perspective iteration → full.
3. **Ambiguous depth** — one short ask (full vs light; if light, which stance + defender y/n) before spawn.
4. **Clearly deep** with no hint → full.

**Light cast:** one wave-1 stance; defender only if user asked or the kill set needs rebuttal (fleeting default: no defender). Light is first-class — not a violation of full-cast norms.

## Coordinator workflow

1. **Locate artifact** — path on disk **or** in-thread paste/chat draft; if only fuzzy intent with no plan-shaped body → stop; point to **grill**.
2. **Select cast** — routing above.
3. **Premise surface** — extract 3–6 implicit premises; confirm top 2–3 with user when unsettled. For fleeting light casts, skip or shrink when premises are already explicit in the draft.
4. **Run perspectives** — **subagents** [second-opinion-dispatch.md](../../subagents/references/second-opinion-dispatch.md) for the selected cast; large full-cast plans may pre-gather via [second-opinion-evidence-dispatch.md](../../subagents/references/second-opinion-evidence-dispatch.md).
5. **Synthesize** — form a **Bottom line** + **Action items** for the user ([output.md](output.md)). Use the analysis framework below only as coordinator-internal scaffolding.

**Claim anchoring:** Attackers anchor kills to plan § or premise id. Drop unanchored kills from convergent counts or tag `drift` (internal).

## Analysis framework (coordinator-internal)

Cover briefly while deciding the Bottom line; do **not** dump these sections to the user.

| Internal note            | Use for Bottom line / Action items                           |
| ------------------------ | ------------------------------------------------------------ |
| **What's solid**         | Confidence that design holds                                 |
| **Gaps**                 | → Action items if they block land                            |
| **Hidden dependencies**  | → Action items if unordered prerequisites remain             |
| **Risky assumptions**    | Mention in Bottom line only if they change the go/no-go call |
| **Scope / complexity**   | Structural note if under/over-sized                          |
| **Axis / readiness**     | Completeness survivors (after defender when that stance ran) |
| **Concrete suggestions** | → Action items                                               |

## Structural deepening (brief)

One honest line in the Bottom line when relevant — not a second full audit. Local change vs staged/ground-up per dialogue-contract.

## Principles

- Honest and objective — no softening filler.
- Cite plan paths/lines (or draft § anchors) when raising Action items.
- Say so if genuinely complete — don't manufacture criticism.
- Preserve unresolved attacker/defender conflict in the Bottom line when both ran — no false consensus.
- Direct on the work; never harsh toward the person.
- User-facing exit is **Bottom line + Action items** only ([output.md](output.md)).
