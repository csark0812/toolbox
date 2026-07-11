---
name: product-principles
description: PostPrint product philosophy router and decision framework. Use when deciding whether to build a feature, evaluating a proposal against PostPrint's core thesis, understanding who the researcher is and what they need, or grounding scope in first principles. Tier 1 context for dialogue and plans; Tier 2 loads explicit build gates. Covers JTBD framing, trust/scope tests, cross-surface consistency expectations. Not for visual implementation (use `/components`), reuse workflows (use `/components` + docs/design/patterns.md), or brand identity (use `/brand-design`).
---

# Product principles

Invocable entry for **what to build and why**: thesis-aligned evaluation and the **decision framework** checklist. Ambient product checks in dialogue → [dialogue-contract.md](../references/dialogue-contract.md); in plan review → [second-opinion/references/second-opinion.md](../second-opinion/references/second-opinion.md).

Canonical prose: [`docs/product/README.md`](../../../docs/product/README.md).

## When to Use

- Deciding whether to build a feature or change a product behavior
- Evaluating a proposal against PostPrint's core thesis
- Understanding who the researcher is and what job they're hiring PostPrint to do
- Grounding a design or engineering decision in first principles
- Resolving a disagreement about scope, priority, or direction

Not for: visual implementation (`/components`), typography/brand/marketing (`/brand-design`), cross-surface reuse via `/components` + `docs/design/patterns.md` (consumer project paths).

**Before product decisions:** read `docs/product/README.md` Tier 1 (philosophy, researcher model). Tier 2 build gates (decision framework, review, examples) — load from the hub when evaluating a specific feature. UI-scoped decisions → `docs/design/README.md` or `/components`.

## Consistency (cross-surface)

Cross-surface consistency is a product requirement — see product hub § surfaces and reuse via `/components` + `docs/design/patterns.md`.

## Skill hierarchy

```
product-principles  ← what to build and why (this skill)
components          ← how to build UI (includes cross-surface reuse)
brand-design        ← how it should look and feel / brand identity
```

Each layer depends on the one above it. A component decision should be
traceable to a brand decision, which should be traceable to a product decision.
Reuse and surface alignment (`/components` + `docs/design/patterns.md`) connect product intent to implementation.

## Output format

Follow [references/output-schema.md](../references/output-schema.md).
