---
name: iterate
description: Agent-to-agent pass loop — iterative blind review subagent passes until a bounded code or plan section holds together. Orchestrator for slice cohesion. Composes on the same Slice as tdd and code-review via layered prompts. Not merge-only PR review, full-artifact plan debate, or find-only hunch settlement.
---

# Iterate

**Source of truth for** bounded slice iterative closure via memoryless blind review subagents.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Orchestrator** — in-session A2A pass loop (coordinator fix + blind member passes until exit). Shared vocabulary → [context-pack.md](../subagents/references/context-pack.md). Review _how-to_ → [`code-review`](../code-review/SKILL.md). Spawn mechanics → [`subagents`](../subagents/SKILL.md).

References: [protocol.md](references/protocol.md) · [slice-envelope.md](references/slice-envelope.md) · [adapters.md](references/adapters.md) · [blind-reviewer-dispatch.md](references/blind-reviewer-dispatch.md) · [thrash-ledger.md](references/thrash-ledger.md) · [exit-gate.md](references/exit-gate.md) · [output.md](references/output.md).

Read [references/research-basis.md](references/research-basis.md) when calibrating blindness or exit claims. Do not load by habit.

## Entry gate

- **Slice** declared — path glob, plan § id, or intent slug ([slice-envelope.md](references/slice-envelope.md)).
- **Adapter** chosen — `code` or `plan-section` ([adapters.md](references/adapters.md)).
- Without a bounded slice → stop; ask user to name scope (do not substitute full-repo or full-plan work).

## Non-negotiables

1. **Memoryless blind pass** each round — [blind-reviewer-dispatch.md](references/blind-reviewer-dispatch.md); coordinator-only review is a **violation**.
2. **Coordinator fix loop** + thrash memory ([thrash-ledger.md](references/thrash-ledger.md)).
3. **Exit** only when [exit-gate.md](references/exit-gate.md) satisfied — `Closure: ready`.
4. **Soft stop on novelty thrash** — `Thrash: diminishing-returns` or `deferred-to-user` → `Closure: open`, ask user, **no** auto spawn of N+1 ([exit-gate.md](references/exit-gate.md) § Soft stop). Soft stop ≠ ready.
5. **Explicit dispositions** — every Action finding: `acted` | `deferred-to-user` | `declined` ([output.md](references/output.md)); silence is not decline.

## Workflow

Follow [protocol.md](references/protocol.md):

1. **Envelope** — [slice-envelope.md](references/slice-envelope.md): user intent → repo read → frozen slice block.
2. **Blind review** — [blind-reviewer-dispatch.md](references/blind-reviewer-dispatch.md): one Task subagent; slice materials only.
3. **Coordinator synthesis** — user-facing output per [output.md](references/output.md); thrash check against [thrash-ledger.md](references/thrash-ledger.md) (inventory **and** novelty).
4. **Disposition / fix** — `acted` implements; `deferred-to-user` soft-stops for ask; `declined` with why; update ledger and streak.
5. **Pass progress** — after every blind Task, plain-language Found / Worth acting / Delta / Still blocks exit ([output.md](references/output.md#pass-progress-required-after-every-blind-task)); never forwarded to the blind reviewer.
6. **Re-loop, soft stop, or exit** — [exit-gate.md](references/exit-gate.md); no fixed round budgets.

**Blindness:** Best-effort bias reduction via context asymmetry — not guaranteed isolation. Do not forward prior review text, thrash ledger, pass progress, fix narrative, or user thread to the blind reviewer.

## Exit artifact

```markdown
## Iterate summary

**Slice:** [envelope id or path summary]
**Closure:** ready | open

### Rounds

- Round N · [Name](id): Action [count]; [acted / deferred-to-user / declined / clean]; delta: [one clause]
```

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Pass headers and findings → [references/output.md](references/output.md).
