# Investigate research basis

**Source of truth for** evidence and limits behind hunch verification.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Read when calibrating hypothesis work, forage/leave, or making a research claim. Not for every investigation.

## Evidence posture

- Multiple working hypotheses resist premature single-story attachment.
- Strong inference favors cheap discriminating tests before confirmatory reading.
- Primary material only — tool rankings and model confidence are not evidence.

## Multiple working hypotheses

Nominate 2–4 rivals; rank by information per unit test cost; run kill tests before confirmatory forage.

**Confidence:** High for process hygiene; moderate for sustaining rivals under time pressure in agent workflows.

**Does not transfer:** Formal ACH tables in user-facing output; treating lab hypothesis-testing as proof of fix efficacy.

- Chamberlin, T. C. (1965). The Method of Multiple Working Hypotheses. _Science._
- Elliott, K. C., & Brook, E. (2007). Revisiting Chamberlin. _BioScience._
- Platt, J. R. (1964). Strong Inference. _Science._

## Forage or leave

After 2–3 primary reads with no confirmatory or disconfirmatory signal, **leave** the patch and re-rank — do not keep reading the same representation hoping for fluency.

**Confidence:** Moderate — heuristic threshold, not a formal stopping rule.

**Does not transfer:** Abandoning investigation when the user asked for broad fishing (**parallel-broad** via **multi**).

## Lateral reading bounds

External claims need source class and independent corroboration where possible; conflicting independents stay visible in the verdict.

**Confidence:** Moderate for web/docs; high for in-repo `file:line` requirements on code hunches.

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

- `fix-invention-guard-only.patch` — guard `>=` bug only; cookie path correct
- `leave-redirect-guard-only.patch` — redirect comment + guard-only cookie path

Dual-bug `debug-app` remains for ceiling / diagnose.

### Post-hygiene batch (N=3, same model, 2026-07-29)

Batch: `_agent/evidence-runs/batch-2026-07-29T21-48-54/batch-manifest.json`

| Repeat | C1 full | C1 none (hunch)      | C1 prompt |
| ------ | ------- | -------------------- | --------- |
| 1      | pass    | fail (shipped patch) | pass      |
| 2      | pass    | fail (shipped patch) | pass      |
| 3      | pass    | pass                 | pass      |

**C1 aggregate:** full>none wins **2/3**, ties **1/3**; prompt matches full **3/3**.

- **Full vs none:** Skill-on holds verdict-without-patch; hunch-only ships fix or skips verdict format — **moderate lift** on C1.
- **Full vs prompt:** Prompt-instructed baseline (`investigate-prompt`) passes C1 on all repeats with same judges — **skill file does not beat pasted verdict-gate rules** on this band.
- **C2 (leave):** pass on all arms all repeats (not discriminating).

**Does not transfer:** General investigate settlement on `debug-app`; ceiling pass rates; skill-file value beyond prompt-instructed C1 gate.

### Decision (2026-07-29)

**Demote** — keep slug and contract suites; drop from default consumer install bundle ([tiers.md](../../docs/tiers.md)). Routing slug remains for explicit hunch→verdict dispatch; prefer diagnose when locus unclear.

**Not Remove** — full still separates from hunch-only on C1 (2/3); protocol value may exist outside the narrow C1 rubric.

**Confidence for transfer:**

- **Moderate** — C1 verdict gate under fix pressure vs hunch-only (`full` > `none`, 2/3 post-hygiene).
- **Low** — skill-file lift over prompt-instructed baseline on C1 (0/3 beats; prompt matches full 3/3).
