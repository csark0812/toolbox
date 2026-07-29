# Writing great skills research basis

**Source of truth for** evidence and limits behind skill-authoring principles.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Read when calibrating authoring claims or explaining why a pattern helps. Not for every skill edit.

## Evidence posture

- **Predictability** (same process every run) is the root virtue — not identical output.
- Progressive disclosure manages context load; user-invoked skills trade context load for cognitive load.
- Negation can increase salience of banned behavior — prefer positive steering.

## Predictability over output sameness

Skills wrangle determinism out of a stochastic system by encoding checkable process steps.

**Confidence:** Moderate — design theory from practice (Matt Pocock skills lineage); limited formal LLM skill RCTs.

**Does not transfer:** Claiming skills guarantee identical outcomes across models.

## Progressive disclosure

Material on lower rungs of the information hierarchy loads only when pointers fire — reduces premature completion from visible later steps.

**Confidence:** Moderate for agent behavior; high for human maintainability.

**Does not transfer:** Hiding material the agent always needs on the hot path.

## Negation rebound

Prohibition can name and strengthen the unwanted behavior (ironic process theory). Pair hard guardrails with what to do instead.

**Confidence:** Moderate for prompt craft; cite cautiously for agent skills.

- Wegner, D. M. (1994). Ironic processes of mental control. _Psychological Review._
- Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `writing-great-skills` (MIT © 2026 Matt Pocock).
