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

4. **Overlays** — append to dispatch plan and **every** member Task `prompt` per [task-prompt-review.md](task-prompt-review.md):
   - § Default filing overlay (always unless improvements mode)
   - § Review overlay (mode, depth, diff)
   - § Filing gate overlay (Thorough+)
   - § Baseline invariant checklist (when fix-loop baseline applies)
   - § Contextual Full re-review overlay (when prior Action findings exist)

5. **Spawn** — one Task per selected agent in parallel. Compose base prompt per [multi task-prompt.md](../../multi/references/task-prompt.md); append review overlays. Set or omit `model` per [multi model assignment](../../multi/SKILL.md#model-assignment) (Auto parent → inherit; named parent → explicit slugs; usage-limit failures → Auto retry).

6. **Synthesize** — [synthesis.md](synthesis.md) → [output.md](output.md).

## Checklist before synthesis

- [ ] Every member prompt includes Default filing overlay
- [ ] Availability log recorded in dispatch plan
- [ ] All planned Task calls completed (or valid skip documented)
- [ ] Thorough+ prompts include Filing gate overlay

## Related

- Council walkthrough → consumer agent-workflows doc (`.skeleton/customize/code-review.md`)
- Fix-loop re-review → consumer review-fix-loop doc (customize) § Contextual Full re-review
