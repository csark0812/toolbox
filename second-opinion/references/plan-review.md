# Plan review synthesis

<!-- doc-meta: owner=eng | last-reviewed=2026-08-10 -->

How to **invent lenses**, **select depth**, and **synthesize** after perspectives return — not how to spawn them ([second-opinion-dispatch.md](../../subagents/references/second-opinion-dispatch.md)).

**Order:** invent ask-supported lenses → pick cheapest depth ceiling → run → synthesize. Depth is a **token ceiling**, not a fill-to-N quota.

## Depth ceilings

| Depth     | Spawn ceiling                          | When                                                                                       |
| --------- | -------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Light** | Coordinator, 1 lens — **no subagents** | Fleeting/narrow; “miss anything” / one concern; user asks quick/light                      |
| **Med**   | 1 attacker Task + 1 defender           | One lens but user wants debate; two concerns foldable into one thin combined mandate       |
| **Deep**  | 2–3 parallel attackers + 1 defender    | ≥2 independent kill mandates; “pressure-test” / “focus group” when invent yields ≥2 lenses |

**Two named concerns** that need **independent** mandates → **deep**, not med fold-and-drop.

**Bare / generic ask** (artifact + “second opinion” only) → one pre-spawn ask; do not silently invent premises+completeness.

## Lens invention

1. Invent kebab-case lenses from the ask — each with a **one-line kill mandate**.
2. Count ask-supported lenses (never filler to match a tier).
3. Map N → cheapest ceiling:
   - N=1, no debate ask → **light**
   - N=1, user wants debate → **med**
   - N≥2 → **deep** (cap at 3 parallel attackers)
4. If N exceeds deep capacity → truncate to best ask-fit (user-named first, then most specific).

**Worked examples only** (not a cast menu):

| Ask shape                                    | Depth | Example lenses                                                        |
| -------------------------------------------- | ----- | --------------------------------------------------------------------- |
| “Did I miss anything?” short draft           | light | `completeness`                                                        |
| “Are the premises wrong?”                    | light | `premises`                                                            |
| “Debate the two risks I named” (independent) | deep  | those two + defend                                                    |
| “Pressure-test readiness…”                   | deep  | `premises`, `completeness` + defend — because ask is readiness-shaped |
| “Focus group” visual/brand plan              | deep  | e.g. `brand-fit`, `craft`, `job-fit` — **not** completeness           |

`verify.md` overlay loads **only** when the invented lens is readiness/gaps-shaped `completeness`.

**Premise surface** (optional): only when lenses are premise-like or user listed premises; confirm only if unsettled. Anchors are always artifact § / draft headings.

## Depth routing precedence

1. **Explicit user depth** — e.g. “light”, “no subagents”, “deep debate”, “skip defender”.
2. **Invent lenses** from ask (or one ask if too vague).
3. **Map N → ceiling** per table above. Breadth words (“focus group”, “pressure-test”) bias deep **only when invent yields ≥2 lenses**; otherwise stay cheaper.
4. **Defender override** — user explicit wins (“skip defender” / “defend this”). Else: light never defends; med/deep include defender unless user skips.

## Coordinator workflow

1. **Locate artifact** — path on disk **or** in-thread paste/chat draft; if only fuzzy intent with no plan-shaped body → stop; point to **grill**.
2. **Invent lenses** + **select depth** — routing above.
3. **Run** — light: coordinator-only. Med/deep: **subagents** [second-opinion-dispatch.md](../../subagents/references/second-opinion-dispatch.md); large deep may pre-gather via [second-opinion-evidence-dispatch.md](../../subagents/references/second-opinion-evidence-dispatch.md).
4. **Synthesize** — form **Bottom line** + **Action items** ([output.md](output.md)). Use analysis framework below only as coordinator-internal scaffolding.

**Deep multi-round:** default stop after one defend. Second cycle only if ≥1 **ship-blocking** kill has no shared disposition after defend **or** user asks — never for polish.

**Claim anchoring:** Attackers anchor kills to artifact §, draft heading, or premise id. Drop unanchored kills from convergent counts or tag `drift` (internal).

## Analysis framework (coordinator-internal)

Cover briefly while deciding the Bottom line; do **not** dump these sections to the user.

| Internal note            | Use for Bottom line / Action items                           |
| ------------------------ | ------------------------------------------------------------ |
| **What's solid**         | Confidence that design holds                                 |
| **Gaps**                 | → Action items if they block land                            |
| **Hidden dependencies**  | → Action items if unordered prerequisites remain             |
| **Risky assumptions**    | Mention in Bottom line only if they change the go/no-go call |
| **Scope / complexity**   | Structural note if under/over-sized                          |
| **Readiness survivors**  | After defender when readiness/gaps lens ran                  |
| **Concrete suggestions** | → Action items                                               |

## Principles

- Honest and objective — no softening filler.
- Cite artifact paths/lines (or draft § anchors) when raising Action items.
- Say so if genuinely complete — don't manufacture criticism.
- Preserve unresolved attacker/defender conflict in the Bottom line when both ran — no false consensus.
- Direct on the work; never harsh toward the person.
- User-facing exit is **Bottom line + Action items** only ([output.md](output.md)).
