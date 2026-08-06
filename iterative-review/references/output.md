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

## Between-pass bridge (required before next blind subagent)

When a pass completes and the loop continues to another blind Task (after fixes, or after a clean pass that did not satisfy [exit-gate.md](exit-gate.md)), write a short user-facing bridge **before** the next dispatch plan. Totals **3–4 sentences** across one or two sections:

```markdown
### Round [N] bridge

**What happened:** [1–2 sentences — blind attestation, Action count, fixes applied, streak or thrash delta]

**Why it matters:** [1–2 sentences — tie outcome to slice closure; what the next blind pass should verify or what still blocks exit]
```

| Rule      | Detail                                                                                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Placement | After pass synthesis and any fixes; immediately before spawning pass N+1                                                                                    |
| Skip      | First pass (nothing prior); final turn when emitting `Closure: ready` ([summary](#iterative-review-summary-on-exit-or-user-stop) replaces)                  |
| Blindness | User-facing coordinator prose only — **never** paste into blind member prompt or slice materials ([blind-reviewer-dispatch.md](blind-reviewer-dispatch.md)) |

Optional split: use `**What happened:**` / `**Why it matters:**` inline labels (above) or separate `#### What happened` / `#### Why it matters` headings — same sentence budget.

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
