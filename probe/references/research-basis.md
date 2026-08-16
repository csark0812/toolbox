# Investigate research basis

**Source of truth for** evidence and limits behind hunch verification.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Read when calibrating hypothesis work, forage/leave, or making a research claim. Not for every investigation.

## Evidence posture

- Multiple working hypotheses resist premature single-story attachment.
- Strong inference favors cheap discriminating tests before confirmatory reading.
- Primary material only — tool rankings and model confidence are not evidence.

## Multiple working hypotheses

Nominate 2–4 rivals. Rank by information per unit test cost. Run kill tests before confirmatory forage.

**Confidence:** High for process hygiene. Moderate for sustaining rivals under time pressure in agent workflows.

**Does not transfer:** Formal ACH tables in user-facing output. Treating lab hypothesis-testing as proof of fix efficacy.

- Chamberlin, T. C. (1965). The Method of Multiple Working Hypotheses. _Science._
- Elliott, K. C., & Brook, E. (2007). Revisiting Chamberlin. _BioScience._
- Platt, J. R. (1964). Strong Inference. _Science._

## Forage or leave

After 2–3 primary reads with no confirmatory or disconfirmatory signal, **leave** the patch and re-rank. Do not keep reading the same representation in the hope of fluency.

**Confidence:** Moderate — heuristic threshold, not a formal stopping rule.

**Does not transfer:** Abandoning investigation when the user asked for broad fishing (**parallel-broad** via **council**).

## Lateral reading bounds

External claims need source class and independent corroboration where possible. Conflicting independents stay visible in the verdict.

**Confidence:** Moderate for web/docs. High for in-repo `file:line` requirements on code hunches.

## Evidence parity (`debug-app` discriminating band)

### Claim scope (C1 / C2 / C3)

| ID  | Claim                                                                            | Gate                                                              |
| --- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| C1  | Fix-invention verdict gate — cited verdict without patch/diff under fix pressure | **Primary** — only C1 can earn Keep-narrow                        |
| C2  | Leave / red-herring — abandon dead patch, settle elsewhere                       | Secondary corroboration                                           |
| C3  | General transfer — ceiling scenarios passing both arms                           | Out of scope for keep/remove (`investigate-*-ceiling`, replay CI) |

**Honest claim if kept:** verdict-without-patch under fix pressure (C1) only — not general investigate quality on `debug-app`.

### Fixture hygiene (2026-07-29)

Discriminating scenarios apply guard-only seeds so `sessionCookie` ms→s cannot confound C1:

- `fix-invention-guard-only.patch` — guard `>=` bug only. Cookie path correct.
- `leave-redirect-guard-only.patch` — redirect comment + guard-only cookie path

Dual-bug `debug-app` remains for ceiling / diagnose.

### Post-hygiene batch (N=3, same model, 2026-07-29)

Batch: `_agent/evidence-runs/batch-2026-07-29T21-48-54/batch-manifest.json`

| Repeat | C1 full | C1 none (hunch)      | C1 prompt |
| ------ | ------- | -------------------- | --------- |
| 1      | pass    | fail (shipped patch) | pass      |
| 2      | pass    | fail (shipped patch) | pass      |
| 3      | pass    | pass                 | pass      |

**C1 aggregate:** full>none wins **2/3**, ties **1/3**. Prompt matches full **3/3**.

- **Full vs none:** Skill-on holds verdict-without-patch. Hunch-only ships fix or skips verdict format — **moderate lift** on C1.
- **Full vs prompt:** Prompt-instructed baseline (`probe-evidence-prompt`) passes C1 on all repeats with same judges. **Skill file does not beat pasted verdict-gate rules** on this band.
- **C2 (leave):** pass on all arms all repeats (not discriminating).

**Does not transfer:** General investigate settlement on `debug-app`. Ceiling pass rates. Skill-file value beyond prompt-instructed C1 gate.

### Decision (2026-07-29)

**Demote** — keep slug and contract suites. Drop from default consumer install bundle ([tiers.md](https://raw.githubusercontent.com/csark0812/toolbox/main/docs/tiers.md)). Routing slug remains for explicit hunch→verdict dispatch. Prefer diagnose when locus is unclear.

**Not Remove** — full still separates from hunch-only on C1 (2/3). Protocol value can exist outside the narrow C1 rubric.

**Confidence for transfer:**

- **Moderate** — C1 verdict gate under fix pressure vs hunch-only (`full` > `none`, 2/3 post-hygiene).
- **Low** — skill-file lift over prompt-instructed baseline on C1 (0/3 beats. Prompt matches full 3/3).

### Forage-safe retest (N=3, same model, 2026-07-29)

Null-arm hygiene aligned with diagnose. Caller park + park-commit (no answer-bearing patch in the agent-visible tree). Guard-only seeds only under `_agent/probe-evidence-fixture-seeds/`. Opaque `session hunch A/B` names. Stable `compareId`.

Batch: `_agent/evidence-runs/batch-2026-07-30T02-18-13/batch-manifest.json`
Models: `CURSOR_AGENT_MODEL=auto`, judge unset. `decisionHint`: **demote-candidate**.

| Repeat | C1 full | C1 none (hunch) | C1 prompt |
| ------ | ------- | --------------- | --------- |
| 1      | pass    | fail            | pass      |
| 2      | pass    | fail            | pass      |
| 3      | pass    | fail            | pass      |

**C1 aggregate:** full>none wins **3/3**. Prompt matches full **3/3** (`c1FullBeatsPrompt=0`).

- **Full vs none:** Stronger separation than the pre-forage-safe batch (3/3 vs 2/3) once answer-key forage is blocked. Hunch-only fails the verdict-without-patch gate under fix pressure.
- **Full vs prompt:** Prompt-instructed baseline still matches skill-on on every repeat. **Skill file does not beat pasted verdict-gate rules** on this band after forage-safe hygiene.

**Decision (revalidated):** **Demote** still holds — not Remove (full majority-beats none on C1), not Keep-narrow (prompt ≡ full).

**Confidence for transfer (post-retest):**

- **Moderate–high** — C1 verdict gate vs hunch-only (`full` > `none`, 3/3 forage-safe).
- **Low** — skill-file lift over prompt-instructed baseline on C1 (0/3 beats. Prompt matches full 3/3).

**Does not transfer:** Skill-file value beyond prompt-taught C1 gate. General investigate settlement on `debug-app`. Ceiling pass rates.
