# Review walkthrough interaction modes

<!-- source-of-truth: task-shaped interaction router for review walkthrough. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Choose one current mode. Change modes only when the task or user signal changes.

## Compact story

Use when one causal path fits in one response. Explain the trigger, changed path, result, and material uncertainty. Do not force a pause, map, excerpt, proof block, concern line, or control menu.

## Paced tour

Use when the change has several dependent beats or the user asks to proceed step by step. Explain one beat and pause. A later pause can say only:

```markdown
Paused at Step 2. Say `next`, or ask about this step.
```

Natural controls:

- `next` or `continue`: advance.
- `why`, `show the code`, or `go deeper`: expand the active beat and stay there.
- `back`: return to the previous beat.
- `skip`: mark the active beat skipped and advance.
- `stop`: finish with the covered and skipped state.

Apply the first clear control in a message. Answer an ordinary question inside the current beat.

## Map-first tour

Use when several independent causal paths exist or the user asks for order. Show two to five short paths. Let the user select one. Do not start a detailed beat before the selection.

## Story reset

Use when the user says the explanation is confusing, asks to lay it out from the beginning, or rejects the current framing.

Reset in this order:

1. Trigger: what starts the behavior.
2. Purpose: what problem the design prevents or solves.
3. End state: what becomes true when the path completes.
4. Path: the smallest end-to-end sequence of owners or boundaries.

Start without code. Ask whether the frame now makes sense. Then return to the same beat or restart when requested.

## Implementation detour

Review Walkthrough stays read-only. When the user explicitly requests an edit:

1. Suspend the walkthrough.
2. Complete the separately authorized implementation workflow.
3. Bind the new source.
4. Preserve accepted beats and the causal position.
5. Re-explain changed current code.
6. Resume by default. Restart only when requested.
