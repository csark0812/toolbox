---
name: iterate
description: Cohesive slice closure — iterative blind review subagent passes until a bounded code or plan section holds together. Use when a named slice needs fix-loop review until cohesive, not merge-ready; also for iterative jobs like test→impl until green or plan-section closure loops. Not for PR or diff merge review (code-review), full-plan staged debate (second-opinion), TDD how at a seam (tdd), or a single hunch (probe).
---

# Iterate

**Source of truth for** bounded slice iterative closure via memoryless blind review subagents.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Consumer overlays arrive as project-specific injected context on skill read.

References: [protocol.md](references/protocol.md) · [slice-envelope.md](references/slice-envelope.md) · [adapters.md](references/adapters.md) · [blind-reviewer-dispatch.md](references/blind-reviewer-dispatch.md) · [thrash-ledger.md](references/thrash-ledger.md) · [exit-gate.md](references/exit-gate.md) · [output.md](references/output.md) · [routing.md](references/routing.md).

Read [references/research-basis.md](references/research-basis.md) when calibrating blindness or exit claims. Do not load by habit.

## Owns

- Bounded **implementation slice** or **plan section** iterative closure until `Closure: ready`.
- Memoryless **blind review subagent** each pass; coordinator fix loop + thrash memory ([thrash-ledger.md](references/thrash-ledger.md)).
- v1 adapters: **code slice**, **plan section** ([adapters.md](references/adapters.md)).

Routes elsewhere → [routing.md](references/routing.md).

## Quick reference

| Need                              | Reference                                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| End-to-end loop                   | [references/protocol.md](references/protocol.md)                                                                                        |
| Intent → envelope                 | [references/slice-envelope.md](references/slice-envelope.md)                                                                            |
| Code vs plan § adapters           | [references/adapters.md](references/adapters.md)                                                                                        |
| Blind Task dispatch               | [references/blind-reviewer-dispatch.md](references/blind-reviewer-dispatch.md)                                                          |
| Coordinator thrash memory         | [references/thrash-ledger.md](references/thrash-ledger.md)                                                                              |
| Exit layers                       | [references/exit-gate.md](references/exit-gate.md)                                                                                      |
| Pass output shape                 | [references/output.md](references/output.md)                                                                                            |
| Between-pass bridge (re-loop)     | [references/output.md](references/output.md#between-pass-bridge-required-before-next-blind-subagent)                                    |
| Sibling handoffs                  | [references/routing.md](references/routing.md)                                                                                          |
| Thrash / matrix vocabulary (link) | [`code-review` fix-loop-ledger](../code-review/references/fix-loop-ledger.md) · [anti-thrash](../code-review/references/anti-thrash.md) |
| Spawn kernel                      | [`subagents`](../subagents/SKILL.md)                                                                                                    |

## Workflow

Follow [protocol.md](references/protocol.md):

1. **Envelope** — [slice-envelope.md](references/slice-envelope.md): user intent → repo read → frozen slice block.
2. **Blind review** — [blind-reviewer-dispatch.md](references/blind-reviewer-dispatch.md): one Task subagent; slice materials only.
3. **Coordinator synthesis** — user-facing output per [output.md](references/output.md); thrash check against [thrash-ledger.md](references/thrash-ledger.md).
4. **Fix** — coordinator implements findings; update ledger and streak.
5. **Between-pass bridge** — when re-looping, 3–4 sentences for the user on what the last pass found or fixed and why the next blind pass matters ([output.md](references/output.md#between-pass-bridge-required-before-next-blind-subagent)); not forwarded to the blind reviewer.
6. **Re-loop or exit** — [exit-gate.md](references/exit-gate.md): matrix + `Cohesion: attested-local` + clean streak → `Closure: ready`.

**Hard gate:** Every review pass invokes a real Task subagent before synthesis. Coordinator-only review is a **violation**.

**Blindness:** Best-effort bias reduction via context asymmetry — not guaranteed isolation. Do not forward prior review text, thrash ledger, fix narrative, or user thread to the blind reviewer.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Pass headers and findings → [references/output.md](references/output.md). End with:

```markdown
## Iterate summary

**Slice:** [envelope id or path summary]
**Closure:** ready | open

### Rounds

- [Round N summary or "exit gate passed"]
```
