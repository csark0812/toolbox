---
name: second-opinion
description: Adversarial critique of a written artifact (path or paste) — invent lenses from the ask; single-agent pass. Process skill. For multi-perspective depth, also attach council. Composes on Artifact. Not dialogue-only design, multi-agent orchestration, or find-only hunch settlement.
---

# Second opinion

<!-- source-of-truth: adversarial artifact review — invent lenses, claim anchoring, Bottom line + Action items. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

**Process skill** — shared vocabulary → [context-pack.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/context-pack.md). Multi-agent depth → [`council`](https://raw.githubusercontent.com/csark0812/toolbox/main/council/SKILL.md) (user must attach or name council; this skill does **not** spawn).

References: [plan-review.md](references/plan-review.md) · [output.md](references/output.md).

Read [research-basis.md](references/research-basis.md) only when calibrating debate claims.

## Entry gate

- **Artifact** — written plan-shaped content: path on disk **or** in-thread paste or chat draft.
- If intent is fuzzy with nothing written, stop. Point to **grill**. Do not substitute live dialogue for a plan body.

## Non-negotiables

1. **Invent lenses first** — kebab-case kill-mandate lenses from the ask ([plan-review.md](references/plan-review.md)). Never filler lenses.
2. **Claim anchoring** — kills map to artifact §, draft heading, or premise id; unanchored → `drift`.
3. **Coordinator-only by default** — one pass applies invented lenses. **Do not** spawn Task members from this skill alone.
4. **Depth via council** — multi-perspective / attack–defend depth only when the user also attaches or names **council**. Then council invents perspectives and spawns; each member uses this skill’s critique craft under one perspective.

## Workflow

1. **Locate artifact** — path on disk or paste or draft in thread.
2. **Invent lenses** — from the ask; one ask if too vague (bare “second opinion” → ask what to pressure; do not silently invent premises+completeness).
3. **Run** — if council is **not** active: coordinator applies lenses in one pass. If council **is** active: follow [`council`](https://raw.githubusercontent.com/csark0812/toolbox/main/council/SKILL.md); members load this skill’s craft; coordinator synthesizes.
4. **Synthesize** — [plan-review.md](references/plan-review.md) + [output.md](references/output.md).

Named lenses (`premises`, `completeness`, `brand-fit`, …) in docs are **worked examples only** — not a cast menu. `verify.md` overlay applies only when the invented lens is readiness/gaps-shaped `completeness`.

## Exit artifact

Per [output.md](references/output.md) — user-facing **Bottom line** + **Action items** only. Write those blocks in pragmatic STE.

## Consumer bindings

Plan artifact paths arrive as injected context on skill read. Do not edit installed copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
