# Iterate output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Extends [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md).

## Pass header (required)

First line of every pass synthesis:

```markdown
Iterate · Slice: [short id] · Pass: blind · Round: [N] · Clean streak: [n]/[M] · Cohesion: attested-local|not-attested · Closure: open|ready
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

## Pass progress (required after every blind Task)

Blind members stay memoryless. The **coordinator** owes the user a plain-language progress report after **every** completed blind Task — including round 1 and the final round before `Closure: ready`. This is the human continuity channel; it is **never** pasted into blind member prompts or slice materials ([blind-reviewer-dispatch.md](blind-reviewer-dispatch.md)).

Emit after synthesis and after Disposition for that round (fixes applied, deferred, or declined). When re-looping, emit **before** spawning pass N+1.

```markdown
### Round [N] progress

**Blind pass:** [Name](id) · Action: [count] · Cohesion: attested-local|not-attested

**Found:**
- [plain-language issue] (`theme-id`) — or a single line: No material issues

**Worth acting?**
- `theme-id` → acted | deferred | declined — [one clause why]
- (when Action = 0) n/a — clean pass

**Delta:**
- [concrete slice change this round: path/§ + what improved] — or none (clean; streak [n]/[M])

**Still blocks exit:**
- [what still fails exit-gate, in plain language] — or none if streak reaches M / gate otherwise green
```

| Rule         | Detail                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience     | User — write so a skimming human can tell whether the round moved the slice                                                              |
| Plain speech | Lead with English; `Theme:` / kebab ids are secondary labels, not the only text                                                          |
| Disposition  | Every Action finding gets an explicit **acted / deferred / declined** call — silence is not decline                                      |
| Net signal   | **Delta** must answer “did this round improve the slice?” — not restating protocol counters alone                                        |
| Subagent     | Link the member with `[Name](id)` when mentioning it                                                                                     |
| Blindness    | Coordinator-only — forbidden in member prompts ([blind-reviewer-dispatch.md](blind-reviewer-dispatch.md))                                |
| Replaces     | Former “between-pass bridge” (3–4 sentence What happened / Why it matters) — progress report is the required continuity artifact         |

Do not skip progress on round 1. On `Closure: ready`, keep the final round’s progress block, then emit the [Iterate summary](#iterate-summary-on-exit-or-user-stop).

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

Same tier pattern as code-review — out-of-slice polish in **Noted** tail. Deferred Action items must still appear under **Worth acting?** as `deferred`.

## Iterate summary (on exit or user stop)

```markdown
## Iterate summary

**Slice:** [envelope]
**Closure:** ready | open

### Rounds

- Round N · [Name](id): Action [count]; [acted themes / clean]; delta: [one clause]
```

On `Closure: ready`, state validation command + result or explicit not-run disclaimer.

## Contract replay markers

Portable suites may assert presence of: `Pass: blind`, `Slice:`, `Clean streak`, `Cohesion: attested-local`, `Thrash: inventory-required`, `### Round`, `**Found:**`, `Worth acting`. Suites do **not** prove Task spawn or blindness isolation.
