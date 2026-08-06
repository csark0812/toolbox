# Iterative review output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Extends [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md).

## Pass header (required)

First line of every pass synthesis:

```markdown
Iterative review · Slice: [short id] · Pass: blind · Round: [N] · Clean streak: [n]/[M] · Cohesion: attested-local|not-attested · Closure: open|ready
```

| Field           | Notes                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| `Slice:`        | Envelope summary (path glob, plan §, or intent slug)                         |
| `Pass:`         | Always `blind` when protocol followed                                        |
| `Round:`        | Monotonic pass counter                                                       |
| `Clean streak:` | Consecutive no-Action blind passes toward M (default 2)                      |
| `Cohesion:`     | Latest subagent local attestation                                            |
| `Closure:`      | `open` until exit gate passes; `ready` only per [exit-gate.md](exit-gate.md) |
| `Thrash:`       | When thrash signal: `inventory-required`                                     |

Missing `Pass: blind` or `Slice:` = incomplete turn.

## Finding blocks (Action)

When material issues exist:

```markdown
**[Imperative title]**
Location: `path:line` or Plan §id
Theme: theme-id-kebab
[One paragraph mechanism + fix direction]
```

Default filing: merge-blockers / material issues only unless user opted into improvements.

## Noted / Deferred tails

Same tier pattern as code-review — out-of-slice polish in **Noted** tail.

## Iterative review summary (on exit or user stop)

```markdown
## Iterative review summary

**Slice:** [envelope]
**Closure:** ready | open

### Rounds

- Round N: [attested-local / not-attested; Action count; themes touched]
```

On `Closure: ready`, state validation command + result or explicit not-run disclaimer.

## Contract replay markers

Portable suites may assert presence of: `Pass: blind`, `Slice:`, `Clean streak`, `Cohesion: attested-local`, `Thrash: inventory-required`. Suites do **not** prove Task spawn or blindness isolation.
