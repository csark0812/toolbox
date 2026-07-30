# Evidence parity (agent-test)

**Source of truth for** running skill-on vs skill-off outcome comparisons and interpreting transfer tables.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Measure whether toolbox skills improve settlement under transfer — without autonomous skill mutation.

## Claims under test (investigate)

Do not score “investigate quality” as one number. Split claims:

| ID  | Claim                                                                            | Keep/remove gate                                                           |
| --- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| C1  | Fix-invention verdict gate — cited verdict without patch/diff under fix pressure | **Primary** — only C1 can earn Keep-narrow                                 |
| C2  | Leave / red-herring — abandon dead patch, settle elsewhere                       | Secondary corroboration only                                               |
| C3  | General transfer — ceiling scenarios that pass both arms                         | **Out of scope** for keep/remove (`investigate-*-ceiling`, replay CI only) |

**Bar to stay first-class:** after fixture hygiene (guard-only seeds), N≥3 same-model repeats where `full` majority-beats `none` on C1 settlement **and** correct locus (`sessionGuard.ts`), and `full` beats the **prompt** baseline (skill file ≠ pasted rules).

**Falsifiers (summary):**

- **Remove:** C1 `full` never majority-beats `none` after hygiene, or `prompt` ≥ `full` on C1 across majority of runs.
- **Demote:** C1 `full` > `none` but `prompt` matches `full` on all repeats (verdict-gate in prompt suffices), or weak/unstable lift — shrink install surface; keep routing slug.
- **Keep (narrow):** C1 `full` majority-beats `none` **and** `full` beats `prompt`; claim only verdict-without-patch under fix pressure.
- **Invest more:** hygiene flips prior inversion but N&lt;3, judge/locus disagree, or confounds remain.

## Claims under test (diagnose)

Do not score “diagnose quality” as one number. Split claims:

| ID  | Claim                                                                                        | Keep/remove gate                                            |
| --- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| D1  | No-repro gate — without a failing signal, agent refuses to hypothesize (repro / investigate) | **Primary** — only D1 can earn Keep-narrow                  |
| D2  | Loop before cause — names/runs a red test command before stating cause or editing production | Secondary corroboration                                     |
| D3  | Tight loop construction — loop is red-capable, deterministic, fast (seconds) on debug-app    | Secondary / ceiling candidate (`diagnose-outcomes-ceiling`) |

**Bar to stay first-class:** N≥3 same-model repeats where `full` majority-beats `none` on D1 **and** `full` beats the **prompt** baseline (skill file ≠ pasted rules).

**Falsifiers (summary):**

- **Remove:** D1 `full` never majority-beats `none` after hygiene.
- **Demote:** D1 `full` > `none` but `prompt` matches `full` on all repeats (gate is prompt-teachable).
- **Keep (narrow):** D1 `full` majority-beats `none` **and** `full` beats `prompt`, **and** transfer fails are classified as _invent_ (cause named without repro)—not forage-only (`mustNotReadPath` / answer-key reads). Claim only “no repro → no hypotheses”.
- **Invest more (hygiene):** aggregate looks like Keep but transfer fails are forage-only or unknown — fix null-arm hygiene before Keep/Remove.
- **Invest more:** direction flips, judge/locus disagree, or confounds remain.

Investigate and diagnose parity are **independent manual cadences** — separate commands, manifests, and report dirs.

## Preflight

```bash
set -a && source .env && set +a
npx agent-test --doctor
npm run agent:test:evidence-parity
```

**One command** runs the discriminating cadence: `agent-test --compare-pairs investigate-outcomes:investigate-transfer` → `investigate-prompt` (prompt baseline) → optional `diagnose-outcomes` + `organization-ablations` → evolution-note proposals for failures. Writes `_agent/evidence-runs/<id>/manifest.json` and compare HTML/MD/JSON under `_agent/eval-reports/<id>/`. Exits non-zero when any scenario fails (for triage, not CI by default).

Scenarios that pass on both arms (ceiling) live in `investigate-outcomes-ceiling` / `investigate-transfer-ceiling` — replay CI only, not this command.

**Not in CI:** `npm run check` / `npm test` runs replay contract suites only. Evidence-parity is a **manual** cadence (`CURSOR_API_KEY`, live judges). Do not wire `agent:test:evidence-parity` into `.github/workflows` unless you explicitly want live spend on every PR.

```bash
# Faster: investigate transfer only, no diagnose/ablations (forage-safe park between arms)
npm run agent:test:evidence-parity -- --no-diagnose --no-ablations

# Skip prompt baseline arm
npm run agent:test:evidence-parity -- --no-prompt

# N≥3 repeats (same model; writes batch manifest under _agent/evidence-runs/)
npm run agent:test:evidence-parity -- --no-diagnose --no-ablations --repeats 3

# Re-render compare from prior suite-report JSON (no live spend)
npm run agent:test:evidence-parity -- --compare-only

# Diagnose parity (independent cadence; no investigate suites; ablations off by default)
npm run agent:test:diagnose-evidence-parity

# Diagnose: transfer only (skip prompt baseline)
npm run agent:test:diagnose-evidence-parity -- --no-prompt

# Diagnose: N≥3 repeats
npm run agent:test:diagnose-evidence-parity -- --repeats 3
```

Outcome and ablation suites must **not** set `"skip": true` (that skips live too). Only [`github-ambient-refs`](../agent-suites/github-ambient-refs/) uses `skip` for replay CI.

If every scenario reports **skipped** under `--live` with a valid `CURSOR_API_KEY`, check subprocess env (key not exported to isolated children) and run `--doctor`. File upstream on `agent-spec` with the session id — do not paper over with JSON noise.

## Cadence

Run under the **same model** (`CURSOR_AGENT_MODEL`, `CURSOR_JUDGE_MODEL`) for both arms. Repeat N≥3 times before claiming lift.

**Automated (recommended):**

```bash
npm run agent:test:evidence-parity
```

**Manual steps** (same pipeline the orchestrator runs):

1. **Evidence parity (compare-pairs)** — one live invocation runs both arms and writes compare artifacts:

   ```bash
   npm run sync:claude-skills && agent-test --suites-dir agent-suites --live --debug \
     --compare-pairs investigate-outcomes:investigate-transfer \
     --compare-out "_agent/eval-reports/$(date -u +%Y-%m-%dT%H-%M-%S)"
   ```

2. **Organization ablations** (optional, same session discipline):

   ```bash
   npm run agent:test:ablations -- --debug
   ```

Compare output lands in `_agent/eval-reports/<run-id>/` as `compare-report.html`, `.md`, and `.json`, plus `investigate-outcomes.suite-report.json`, `investigate-transfer.suite-report.json`, and `investigate-prompt.suite-report.json`. Pairing uses `compareId` then band-neutral scenario name (agent-test native). The evidence-parity manifest links the HTML path as `report` and MD as `reportMd`.

Transfer-arm failures on C1 (full pass, none fail) are **expected discriminating signal** — the orchestrator continues to the prompt arm and still exits non-zero for triage/proposals.

### Fixture hygiene (discriminating band)

The shared `debug-app` fixture plants **two** session bugs (`sessionGuard.ts` `>=`, `sessionCookie.ts` ms→s) for ceiling / diagnose scenarios. The **discriminating** band applies per-scenario seeds so only the guard bug remains:

- `fix-invention-guard-only.patch` — C1 symptom (“valid exactly at expiry”)
- `leave-redirect-guard-only.patch` — redirect comment + guard-only cookie path

Dual-bug `debug-app` stays for `investigate-*-ceiling` and diagnose ceiling / D2.

### Fixture hygiene (investigate null-arm)

- **Outcomes:** guard-only seeds with answer keys present (skill + suite judges).
- **Null-arm answer-key hygiene:** same class as diagnose — outcomes run first; then answer-key bytes live only in the orchestrator process (no `$TMPDIR` plaintext park). Deletions are committed on a detached HEAD with `main` / `origin/main` retargeted so `git show` cannot recover keys; refs + bytes restore afterward. Null-arm suite JSON under `_agent/null-arm-suites/` strips `judge` and uses **guard-only** seeds under `_agent/investigate-fixture-seeds/` (bug plant only — no answer-bearing hygiene patch in the agent-visible tree). Scenario display names stay opaque (`session hunch A/B`); keep `compareId` stable.
- Tracked transfer/prompt `seedPatch` points at `_agent/investigate-null-arm-hygiene.patch` (regenerated, gitignored) for offline worktree checks; live `agent:test:evidence-parity` does **not** apply that patch after park-commit.

### Fixture hygiene (diagnose)

- **D1 (no-repro):** no production seed — agent should not touch code; judge checks refusal, not locus file.
- **D2 (loop-before-cause):** dual-bug `debug-app` is OK if the judge checks **ordering** (test before fix), not which bug file the agent names. Optional later: a guard-only seed if cookie forage confounds D2.
- **D3 (tight loop):** lives in `diagnose-outcomes-ceiling` (replay CI only) — likely passes both arms once the model runs tests.
- **Null-arm answer-key hygiene:** Outcomes run with keys present; then answer-key bytes live only in the orchestrator process (no `$TMPDIR` plaintext park). Deletions are committed on a detached HEAD with `main` / `origin/main` retargeted so `git show` cannot recover keys; refs + bytes restore afterward (restore must not `checkout -f` — that wipes unrelated working-tree edits). Null-arm suite JSON under `_agent/null-arm-suites/` omits `seedPatch` / `judge` / `mustNotReadPath` (path hints teach forage attempts); skill-body cribs go in `mustNot` instead. `mustNotReadPath` in source scenarios still applies via agent-test only on **successful** Reads with content (miss attempts do not fail). Scenario display names stay opaque (`session hunch A/B`); keep `compareId` stable.

### Metrics beyond judge pass rate

| Metric                                       | Role                                                   |
| -------------------------------------------- | ------------------------------------------------------ |
| Judge + `must` / `mustNot`                   | Primary settlement                                     |
| Correct locus (`sessionGuard.ts` on C1)      | Primary co-metric (investigate)                        |
| Ordering evidence (test output before cause) | D2 co-metric (diagnose)                                |
| `usage.total` tokens (Δ full−none)           | Secondary budget                                       |
| Human transcript spot-check                  | Required on direction-flip or judge pass + wrong locus |
| Wall time                                    | Tertiary                                               |

## Equal-budget discipline

- Same model family for both arms in a comparison row.
- Primary budget metric: **total tokens** (`usage.total` in `result.json` — agent + judge) when the SDK reports usage; wall time (`durationMs`) remains a secondary proxy.
- Compare reports include per-arm token columns and Δ tok when usage is present (agent-test HTML/MD compare).
- If `full` does not beat `none` on settlement judges across repeats → lower **Confidence** or add **Does not transfer** in `research-basis.md`; do not add skill prose.

## Suites

| Suite                          | `skills` | Purpose                                   |
| ------------------------------ | -------- | ----------------------------------------- |
| `investigate-outcomes`         | `full`   | Skill-on settlement (discriminating band) |
| `investigate-transfer`         | `none`   | Hunch-only null baseline (discriminating) |
| `investigate-prompt`           | `none`   | Prompt-instructed verdict-gate baseline   |
| `investigate-outcomes-ceiling` | `full`   | Replay CI only — ceiling scenarios        |
| `investigate-transfer-ceiling` | `none`   | Replay CI only — ceiling scenarios        |
| `diagnose-outcomes`            | `full`   | Skill-on discriminating band (D1/D2)      |
| `diagnose-transfer`            | `none`   | Hunch-only null baseline (discriminating) |
| `diagnose-prompt`              | `none`   | Prompt-instructed entry-gate baseline     |
| `diagnose-outcomes-ceiling`    | `full`   | Replay CI only — ceiling (D3)             |
| `organization-ablations`       | `full`   | Primary vs council vs fit-check           |

Diagnose compare artifacts land under `_agent/eval-reports/diagnose-<id>/` with `diagnose-outcomes.suite-report.json` / `diagnose-transfer.suite-report.json` / `diagnose-prompt.suite-report.json`. Manifests under `_agent/evidence-runs/diagnose-<id>/manifest.json` record the D1 pass matrix (`full` vs `none` vs `prompt`).

## After failures

The orchestrator autofill step runs `propose-skill-evolution` for each failed `.debug` bundle. Manual triage:

1. Open `_agent/evidence-runs/<id>/manifest.json` for session paths and proposal list.
2. Triage debug bundle (`failures.json`, `summary.md`, `transcript.md`).
3. Human Keep → patch → contract lock per [skill-evolution.md](skill-evolution.md).

## Related

- [Agent suites](../agent-suites/README.md)
- [Skill evolution](skill-evolution.md)
- [Skill organization ablations](skill-organization-ablations.md)
