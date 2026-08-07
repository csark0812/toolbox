# Iterate output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Extends [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md).

## Pass header (required)

First line of every pass synthesis:

```markdown
Iterate · Slice: [short id] · Pass: blind · Round: [N] · Clean streak: [n]/[M] · Cohesion: attested-local|not-attested · Closure: open|ready
```

| Field           | Notes                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `Slice:`        | Envelope summary (path glob, plan §, or intent slug)                                                  |
| `Pass:`         | Always `blind` when protocol followed                                                                 |
| `Round:`        | Monotonic pass counter                                                                                |
| `Clean streak:` | Consecutive no-Action blind passes toward M (default 2)                                               |
| `Cohesion:`     | Latest subagent local attestation                                                                     |
| `Closure:`      | `open` until exit gate passes. `ready` only per [exit-gate.md](exit-gate.md). Soft stop stays `open`. |
| `Thrash:`       | When set: `inventory-required` or `diminishing-returns`                                               |

Missing `Pass: blind` or `Slice:` = incomplete turn.

## Pass progress (required after every blind Task)

Blind members stay memoryless. The **coordinator** owes the user a pragmatic-STE progress report after **every** completed blind Task. That includes round 1, soft-stop rounds, and the final round before `Closure: ready`. This is the human continuity channel. It is **never** pasted into blind member prompts or slice materials ([blind-reviewer-dispatch.md](blind-reviewer-dispatch.md)). User-facing blocks must use pragmatic STE. See [docs/skill-evolution.md](../../docs/skill-evolution.md) § Pragmatic STE for toolbox, or `/simple-english`.

Emit after synthesis and after Disposition for that round. When re-looping, emit **before** spawning pass N+1. On soft stop, emit progress then stop — do not spawn N+1.

```markdown
### Round [N] progress

**Blind pass:** [Name](id) · Action: [count] · Cohesion: attested-local|not-attested

**Found:**

- [STE issue summary] (`theme-id`) — or a single line: No material issues

**Worth acting?**

- `theme-id` → acted | deferred-to-user | declined — [one clause why]
- (when Action = 0) n/a — clean pass

**Delta:**

- [concrete slice change this round: path/§ + what improved] — or none (clean; streak [n]/[M])

**Still blocks exit:**

- [what still fails exit-gate, in pragmatic STE] — or soft-stopped (diminishing-returns / deferred-to-user) — or none if streak reaches M / gate otherwise green
```

| Rule        | Detail                                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience    | User — write so a skimming human can tell whether the round moved the slice                                                                        |
| STE speech  | Lead with pragmatic STE. `Theme:` / kebab ids are secondary labels, not the only text                                                              |
| Disposition | Every Action finding gets **acted / deferred-to-user / declined** — silence is not decline. `deferred` alone is ambiguous — use `deferred-to-user` |
| Net signal  | **Delta** must answer “did this round improve the slice?” — not restating protocol counters alone                                                  |
| Soft stop   | When `Thrash: diminishing-returns` or any `deferred-to-user`, **Still blocks exit** must say soft-stopped / waiting on user                        |
| Subagent    | Link the member with `[Name](id)` when mentioning it                                                                                               |
| Blindness   | Coordinator-only — forbidden in member prompts ([blind-reviewer-dispatch.md](blind-reviewer-dispatch.md))                                          |
| Replaces    | Former “between-pass bridge” — progress report is the required continuity artifact                                                                 |

Do not skip progress on round 1. On `Closure: ready`, keep the final round’s progress block, then emit the [Iterate summary](#iterate-summary-on-exit-or-user-stop). On soft stop, keep progress + summary with `Closure: open`.

## Finding blocks (Action)

When material issues exist (also summarized under **Found:** above):

```markdown
**[Imperative title]**
Location: `path:line` or Plan §id
Theme: theme-id-kebab
[One paragraph mechanism + fix direction]
```

Default filing: merge-blockers / material issues only unless user opted into improvements.

## Noted / Deferred tails

Same tier pattern as code-review — out-of-slice polish in **Noted** tail. Findings needing user judgment must appear under **Worth acting?** as `deferred-to-user` (not silent Noted-only drop). Explicit `declined` still appears under Worth acting.

## Iterate summary (on exit, soft stop, or user stop)

```markdown
## Iterate summary

**Slice:** [envelope]
**Closure:** ready | open

### Rounds

- Round N · [Name](id): Action [count]; [acted / deferred-to-user / declined / clean]; delta: [one clause]
```

On `Closure: ready`, state validation command + result or explicit not-run disclaimer. On soft stop, `Closure: open` and name the stop reason (diminishing-returns / deferred-to-user).

## Contract replay markers

Portable suites can assert presence of: `Pass: blind`, `Slice:`, `Clean streak`, `Cohesion: attested-local`, `Thrash: inventory-required`, `Thrash: diminishing-returns`, `### Round`, `**Found:**`, `Worth acting`, `deferred-to-user`. Suites do **not** prove Task spawn or blindness isolation.
