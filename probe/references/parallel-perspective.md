# Parallel Perspective Investigate

**Availability:** This parallel recipe requires `council` to be installed and attached. Without it, test the competing explanations serially and return the normal `probe` evidence and verdict shape.

Structured challenge for genuinely mixed evidence. Uses the [council](https://raw.githubusercontent.com/csark0812/toolbox/main/council/SKILL.md) persona contract and [interaction patterns](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/interaction-patterns.md).

Default **probe** Evidence stays single-target and single-pass. Use this recipe only when evidence is contested or the user requests a stress test.

## When to use

- The user asks for a stress test of one hunch.
- Current evidence supports materially different explanations.

## When to skip

- One clear next read can settle the hunch.
- The task needs broad collection, independent web topics, or written-plan review.

## Task personas

Use **structured challenge** with two independent first views:

| Persona              | Question                                                                 | Falsifier                                                 |
| -------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| hunch-mechanism      | What evidence shows that the proposed mechanism is reachable?            | A controlling guard, invariant, or trace prevents it      |
| preventing-mechanism | What evidence shows that the system prevents or explains away the hunch? | A reachable path or direct trace bypasses that protection |

Both personas use primary evidence. Neither receives the other's first conclusion.

If a material conflict remains, run one safe proof or one focused response round. Compose prompts with [persona-prompt.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/persona-prompt.md).

## Synthesis

1. State what the primary evidence supports and rejects.
2. Preserve a genuine split. Do not average it into vague prose.
3. Follow the **probe** verdict shape.
4. Name the smallest next proof when the evidence remains insufficient.

## Handoff

- If the hunch closes, stop.
- If one target remains, continue with single-target **probe**.
- If a reproducible bug remains and the user asks for a fix, follow the requested fix workflow.
