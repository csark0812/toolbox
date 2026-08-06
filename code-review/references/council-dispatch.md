# Council dispatch (escalation only)

Parallel council when [escalation.md](escalation.md) places the run on **Targeted specialists** or **Council** — not the default primary path. Spawn mechanics → via subagents non-negotiables. Procedure default → [review.md](review.md).

## Hard gate (escalated runs only)

1. Read via subagents Non-negotiables. Honor the via subagents recipe carve-out — escalation is already decided; **do not** re-run Fit check to skip spawns.
2. Select members per [agent-selection.md](agent-selection.md); issue **one Task/Subagent call per selected member**.
3. Only after those calls complete → [synthesis.md](synthesis.md) → [output.md](output.md).

**Primary path:** coordinator may write `Review · …` after direct inspection **without** member Tasks — authorized default per [review.md](review.md).

**Forbidden on escalated runs:** fabricating member reports; skipping spawn after choosing escalation; using Fit check to waive SELECTED members.

**Valid member omit:** lowest-scored optional lens when budget requires; log in plan. User decline / host cannot run Task → say so and **stop**.

## Workflow

1. **Inputs** — source adapter id, surface band, escalation reason, diff, filing mode, fix-loop state ([anti-thrash.md](anti-thrash.md) when applicable).
2. **Select agents** — [agent-selection.md](agent-selection.md), profile `review`, depth for this escalated run only.
3. **Dispatch plan** — per via subagents workflow plus:

```markdown
Task: Code review — [source adapter] · [surface band] · escalated
Classification: review
Pass class: [first-baseline | fix-implementation | closure-re-review | new-scope-review]
Source of truth: diff
Reviewer: primary+specialists | council
Escalation reason: [user ask | unresolved domain | cross-cutting]
Parent model: [Auto | <named model>]

Loop state: …
Selected members: …
Why these members: …
Synthesis plan: council synthesis per synthesis.md → output.md
```

Pass 2+ must include loop state. `closure-re-review` without prior themes / justification = incomplete dispatch. If [anti-thrash.md](anti-thrash.md) § Hard stop triggers (same-hotspot trail or recoverable Theme:), `Pass class: first-baseline` is forbidden — do not spawn until pass class is `closure-re-review` or justified `new-scope-review` with archaeology evidence.

4. **Overlays** — append to **every** member prompt:
   1. [task-prompt-review.md](task-prompt-review.md) § Review overlay
   2. Portable Default filing (or consumer overlay)
   3. Invariant overlay when Thorough+ escalated run or contextual re-review
   4. Contextual ledger overlay when prior Action findings exist
   5. Consumer overlays when injected on skill read

5. **Pre-spawn model-routing gate** — via subagents (model-routing) pre-spawn gate. Dispatch plans use `Parent model: [Auto | <named model>]` and `model=[inherit-auto | slug]`. `inherit-auto` means **omit** the Task/Subagent `model` argument. Council dispatch does not redefine that gate.
6. **Spawn** — one Task per SELECTED member in parallel.
7. **Synthesize** — [synthesis.md](synthesis.md) → [output.md](output.md). Primary validates every specialist finding before filing.

## Checklist before synthesis (escalated)

- [ ] Recipe carve-out honored (no Fit-check waiver of SELECTED members)
- [ ] Anti-thrash completed when re-review applies (hard stop cleared — no `first-baseline` spawn on same-hotspot / Theme: recovery)
- [ ] One Task per SELECTED member (or stop — no fabricated report)
- [ ] Primary validated specialist output before Action filing
- [ ] Findings-first chat; Continuity one-liner when themes open; Persist reminder when Action > 0

## Related

- Default primary path → [review.md](review.md)
- Legacy mode depth tables → folded into [surfaces.md](surfaces.md) + [escalation.md](escalation.md)
