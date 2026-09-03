# Plan review synthesis

<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

How to **invent lenses** and **synthesize** a second opinion. An active orchestration layer owns member execution.

## Lens invention

1. Invent kebab-case lenses from the ask — each with a **one-line kill mandate**.
2. Count ask-supported lenses (never filler).
3. If council is **not** attached: coordinator applies all invented lenses in one pass (or the single best lens when the ask is narrow).
4. If council **is** attached: council invents perspectives (may align with these lenses); each member runs one perspective under this skill’s critique craft.

**Bare / generic ask** (artifact + “second opinion” only) → one clarifying ask; do not silently invent premises+completeness.

**Worked examples only** (not a cast menu):

| Ask shape                                   | Mode                     | Example lenses                                              |
| ------------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| “Did I miss anything?” short draft          | second-opinion alone     | `completeness`                                              |
| “Are the premises wrong?”                   | second-opinion alone     | `premises`                                                  |
| “Pressure-test readiness…” + attach council | council + second-opinion | e.g. `premises`, `completeness` + optional defend           |
| “Focus group” visual/brand plan + council   | council + second-opinion | e.g. `brand-fit`, `craft`, `job-fit` — **not** completeness |

`verify.md` overlay loads **only** when the invented lens is readiness/gaps-shaped `completeness`.

**Premise surface** (optional): only when lenses are premise-like or user listed premises; confirm only if unsettled. Anchors are always artifact § / draft headings.

## Coordinator workflow

1. **Locate artifact** — path on disk **or** in-thread paste/chat draft; if only fuzzy intent with no plan-shaped body → stop; point to **grill**.
2. **Invent lenses** — routing above.
3. **Run** — alone: coordinator-only. With **council**: council owns spawn and perspective invention; synthesize after members.
4. **Synthesize** — form **Bottom line** + **Action items** ([output.md](output.md)). Use analysis framework below only as coordinator-internal scaffolding.

**Claim anchoring:** Anchor kills to artifact §, draft heading, or premise id. Drop unanchored kills from convergent counts or tag `drift` (internal).

## Analysis framework (coordinator-internal)

Cover briefly while deciding the Bottom line; do **not** dump these sections to the user.

| Internal note            | Use for Bottom line / Action items                           |
| ------------------------ | ------------------------------------------------------------ |
| **What's solid**         | Confidence that design holds                                 |
| **Gaps**                 | → Action items if they block land                            |
| **Hidden dependencies**  | → Action items if unordered prerequisites remain             |
| **Risky assumptions**    | Mention in Bottom line only if they change the go/no-go call |
| **Scope / complexity**   | Structural note if under/over-sized                          |
| **Concrete suggestions** | → Action items                                               |

## Principles

- Honest and objective — no softening filler.
- Cite artifact paths/lines (or draft § anchors) when raising Action items.
- Do not own multi-agent orchestration — that is **council**.
