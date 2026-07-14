# Council Dispatch

End-to-end parallel council review. Spawn mechanics → [`multi`](../../multi/SKILL.md) non-negotiables. Entry → [`code-review`](../SKILL.md) workflow steps 1–2 (mode, depth, diff, fix-loop).

## Workflow

1. **Inputs from code-review** — mode, depth (after escalation per [modes.md](modes.md)), diff, filing mode, fix-loop state.
2. **Select agents** — [agent-selection.md](agent-selection.md) with profile `review` and current `depth`.
3. **Dispatch plan** — write per [multi workflow](../../multi/SKILL.md#workflow) plus review fields:

```markdown
Task: Code review — [mode] at [depth]
Classification: review
Source of truth: diff
Goal: [coverage / perspectives per depth]

Selected members:

- [agent] · tier=[tier] · model=[slug] · stance=[id]: [lens sub-task]

Why these members: [from agent-selection availability log]
Synthesis plan: council synthesis per synthesis.md → output.md
```

4. **Overlays** — append to dispatch plan and **every** member Task `prompt`:
   1. **Generic Review overlay** (always) — [task-prompt-review.md](task-prompt-review.md) § Review overlay (mode, depth, diff).
   2. **Portable Default filing** — [task-prompt-review.md](task-prompt-review.md) § Default filing overlay, **unless** the consumer overlay SSOT replaces it.
   3. **Invariant overlay** — [task-prompt-review.md](task-prompt-review.md) § Invariant overlay for Thorough+ reviews.
   4. **Contextual Full ledger overlay** — [task-prompt-review.md](task-prompt-review.md) § Contextual Full ledger overlay whenever prior Action findings exist.
   5. **Consumer overlays** — when `.skeleton/customize/code-review.md` (or project docs it names) provides a fuller overlay set, append those sections (Default filing, Filing gate, Product intent, Baseline, Contextual Full, path boosts, Needs confirmation). Prefer consumer SSOT over portable stubs when both exist; consumer context may extend but must not remove ledger reconciliation or the portable exit gate.

5. **Spawn** — one Task per selected agent in parallel. Compose base prompt per [multi task-prompt.md](../../multi/references/task-prompt.md); append review overlays. Set or omit `model` per [multi model assignment](../../multi/SKILL.md#model-assignment) (Auto parent → inherit; named parent → explicit slugs; usage-limit failures → Auto retry).

6. **Synthesize** — [synthesis.md](synthesis.md) → [output.md](output.md).

## Checklist before synthesis

- [ ] Every member prompt includes Default filing overlay (consumer or portable)
- [ ] Every member prompt includes Review overlay (mode/depth/diff)
- [ ] Thorough+ prompts include the invariant overlay and applicable matrix dimensions
- [ ] Pass 2+ prompts include the current stable-theme ledger and reconciliation rules
- [ ] Availability log recorded in dispatch plan
- [ ] All planned Task calls completed (or valid skip documented)
- [ ] Consumer overlays loaded when customize / project docs require them (Thorough+ Filing gate, product-intent when paths match, contextual Full when prior Action findings exist)

## Related

- Council walkthrough → consumer agent-workflows doc (`.skeleton/customize/code-review.md`)
- Fix-loop re-review → consumer review-fix-loop doc (customize) § Contextual Full re-review
