# Iterate output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Extends [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md).

## Pass header (required)

Job-first user lead — not a jargon one-liner. Protocol tokens for suites live in the HTML contract footer.

```markdown
### Iterate — round [N]

**Slice:** [short id]
**Review:** fresh (no prior-pass context)
**Streak:** [n] clean passes in a row (need [M])
**Slice holds this pass:** yes | no
**Status:** open | done — ready to leave iterate
```

| Field                      | Notes                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `### Iterate — round N`    | Human pass index (do not dual-use “Pass” here)                                                       |
| **Slice:**                 | Envelope summary (path glob, plan §, or intent slug)                                                 |
| **Review:**                | Fresh / blind — no prior-pass context to the member                                                  |
| **Streak:**                | Consecutive no-Action blind passes toward M (default 2)                                              |
| **Slice holds this pass:** | Maps to latest subagent local cohesion                                                               |
| **Status:**                | `open` until exit gate passes; `done — ready to leave iterate` only per [exit-gate.md](exit-gate.md) |

## Contract footer (required)

Append after the pass body (suites assert these tokens; not the human lead). Footer `Pass: blind` means review **mode**.

```markdown
<!-- iterate-contract: Pass: blind · Slice: [id] · Clean streak: [n]/[M] · Cohesion: attested-local|not-attested · Closure: open|ready -->
```

Include `Thrash: inventory-required` in the footer when thrash applies. `Closure: ready` appears only when the coordinator emits exit; first-pass / early-round fixtures mustNot `Closure: ready`.

Missing footer tokens `Pass: blind` or `Slice:` = incomplete turn.

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
| Skip      | First pass (nothing prior); final turn when emitting `Closure: ready` ([summary](#iterate-summary-on-exit-or-user-stop) replaces)                           |
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

## Iterate summary (on exit or user stop)

```markdown
## Iterate summary

**Slice:** [envelope]
**Closure:** ready | open

### Rounds

- Round N: [attested-local / not-attested; Action count; themes touched]
```

On `Closure: ready`, state validation command + result or explicit not-run disclaimer.

## Contract replay markers

Portable suites may assert presence of: `Pass: blind`, `Slice:`, `Clean streak`, `Cohesion: attested-local`, `Thrash: inventory-required` (typically inside the HTML `<!-- iterate-contract: … -->` footer). Suites do **not** prove Task spawn or blindness isolation.
