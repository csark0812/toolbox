# Parallel Broad Investigate

**Availability:** This parallel recipe requires `council` to be installed and attached. Without it, inspect the independent areas serially and return the normal `probe` evidence and verdict shape.

Wide evidence pass when the user explicitly asks for a broad search. Uses the [council](https://raw.githubusercontent.com/csark0812/toolbox/main/council/SKILL.md) persona contract and [persona prompt](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/persona-prompt.md).

Default **probe** Evidence stays single-target. Use this recipe only when the hunch crosses independent subsystems.

## When to use

- The user asks to check a whole subsystem or several distinct areas.
- The hunch spans wiring across client, backend, and shared packages.

## When to skip

- One file, hook, or endpoint can settle the hunch.
- The work is a plan review or code review.

## Task personas

Create one persona per independent ownership boundary. Usually use two or three.

| Persona example      | Question                                           | Evidence                                                   |
| -------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| client-path          | Can the client path produce the reported behavior? | Client state, requests, and rendering path                 |
| backend-path         | Can the backend path produce or prevent it?        | Handler, service, persistence, and logs                    |
| integration-boundary | Does the contract fail between areas?              | Shared types, transport, configuration, and runtime wiring |

Merge a persona when it asks the same question and reads the same evidence as another.

Use **independent panel**. Compose each member from [persona-prompt.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/persona-prompt.md).

## Synthesis

1. Merge findings with file and line evidence.
2. Follow the **probe** verdict shape.
3. Preserve conflicts between subsystems.
4. If one safe read or test can settle the conflict, run it. Otherwise narrow the target.

## Handoff

- If the hunch closes, stop.
- If one target remains, continue with single-target **probe**.
- If a reproducible bug remains and the user asks for a fix, follow the requested fix workflow.
