# Evidence parity (agent-test)

<!-- source-of-truth: running skill-on vs skill-off outcome comparisons and interpreting transfer tables. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-02 -->

Measure whether toolbox skills improve settlement under transfer. Do this without autonomous skill mutation.

## Claims under test (investigate)

Do not score “investigate quality” as one number. Split claims:

| ID  | Claim                                                                            | Keep/remove gate                           |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| C1  | Fix-invention verdict gate — cited verdict without patch/diff under fix pressure | **Primary** — only C1 can earn Keep-narrow |
| C2  | Leave / red-herring — abandon dead patch, settle elsewhere                       | Secondary corroboration only               |
| C3  | General transfer — scenarios that pass both arms                                 | Retired with the removed ceiling suites    |

**Bar to stay first-class:** After fixture hygiene (guard-only seeds), run N≥3 same-model repeats. `full` must majority-beat `none` on C1 settlement **and** correct locus (`sessionGuard.ts`). `full` must also beat the **prompt** baseline (skill file ≠ pasted rules).

**Falsifiers (summary):**

- **Remove:** C1 `full` never majority-beats `none` after hygiene. Or `prompt` ≥ `full` on C1 across majority of runs.
- **Demote:** C1 `full` > `none` but `prompt` matches `full` on all repeats (verdict-gate in prompt suffices). Or weak/unstable lift — shrink install surface. Keep routing slug.
- **Keep (narrow):** C1 `full` majority-beats `none` **and** `full` beats `prompt`. Claim only verdict-without-patch under fix pressure.
- **Invest more:** Hygiene flips prior inversion but N&lt;3. Or judge/locus disagree. Or confounds remain.

## Claims under test (diagnose)

Do not score “diagnose quality” as one number. Split claims:

| ID  | Claim                                                                                        | Keep/remove gate                           |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| D1  | No-repro gate — without a failing signal, agent refuses to hypothesize (repro / investigate) | **Primary** — only D1 can earn Keep-narrow |
| D2  | Loop before cause — names/runs a red test command before stating cause or editing production | Secondary corroboration                    |
| D3  | Tight loop construction — loop is red-capable, deterministic, fast (seconds) on debug-app    | Retired with the removed ceiling suite     |

**Bar to stay first-class:** Run N≥3 same-model repeats. `full` must majority-beat `none` on D1 **and** `full` must beat the **prompt** baseline (skill file ≠ pasted rules).

**Falsifiers (summary):**

- **Remove:** D1 `full` never majority-beats `none` after hygiene.
- **Demote:** D1 `full` > `none` but `prompt` matches `full` on all repeats (gate is prompt-teachable).
- **Keep (narrow):** D1 `full` majority-beats `none` **and** `full` beats `prompt`. Transfer fails must be classified as _invent_ (cause named without repro)—not forage-only (`mustNotReadPath` / answer-key reads). Claim only “no repro → no hypotheses”.
- **Invest more (hygiene):** Aggregate looks like Keep but transfer fails are forage-only or unknown. Fix null-arm hygiene before Keep/Remove.
- **Invest more:** Direction flips. Or judge/locus disagree. Or confounds remain.

Investigate and diagnose parity are **independent manual cadences**. They use separate commands, manifests, and report dirs.

## Preflight

```bash
set -a && source .env && set +a
npx agent-test --doctor
npm run agent:test:evidence-parity
```

**One command** runs the discriminating cadence: `agent-test --compare-pairs probe-evidence-outcomes:probe-evidence-transfer` → `probe-evidence-prompt` (prompt baseline) → optional `probe-fix-outcomes` + `organization-ablations` → evolution-note proposals for failures. Writes `_agent/evidence-runs/<id>/manifest.json` and compare HTML/MD/JSON under `_agent/eval-reports/<id>/`. Exits non-zero when any scenario fails (for triage, not CI by default).

Ceiling-only suites were removed. Evidence parity contains only intentional direct agent comparisons.

**Not in CI:** `npm run check` and `npm test` run offline repository validation only. Evidence parity is a **manual** credentialed cadence with real agents and judges. It can incur provider usage. Do not wire it into `.github/workflows` unless you explicitly want that usage on every PR.

```bash
# Faster: investigate transfer only, no diagnose/ablations (forage-safe park between arms)
npm run agent:test:evidence-parity -- --no-diagnose --no-ablations

# Skip prompt baseline arm
npm run agent:test:evidence-parity -- --no-prompt

# N≥3 repeats (same model; writes batch manifest under _agent/evidence-runs/)
npm run agent:test:evidence-parity -- --no-diagnose --no-ablations --repeats 3

# Re-render compare from prior suite-report JSON (no provider usage)
npm run agent:test:evidence-parity -- --compare-only

# Diagnose parity (independent cadence; no investigate suites; ablations off by default)
npm run agent:test:diagnose-evidence-parity

# Diagnose: transfer only (skip prompt baseline)
npm run agent:test:diagnose-evidence-parity -- --no-prompt

# Diagnose: N≥3 repeats
npm run agent:test:diagnose-evidence-parity -- --repeats 3
```

Suites must not use `skip: true` as a credential-free fallback because it also skips direct execution. Use `--validate-only` for offline configuration checks.

If a direct run cannot start with valid credentials, check that the key is exported to isolated child processes. Then run `--doctor`. File upstream on `agent-spec` with the session id. Do not paper over the failure with JSON noise.

## Cadence

Run under the **same model** (`CURSOR_AGENT_MODEL`, `CURSOR_JUDGE_MODEL`) for both arms. Repeat N≥3 times before claiming lift.

**Automated (recommended):**

```bash
npm run agent:test:evidence-parity
```

**Manual steps** (same pipeline the orchestrator runs):

1. **Evidence parity (compare-pairs)** — one direct invocation runs both arms and writes compare artifacts:

   ```bash
   npm run sync:claude-skills && agent-test --suites-dir agent-suites --debug \
     --compare-pairs probe-evidence-outcomes:probe-evidence-transfer \
     --compare-out "_agent/eval-reports/$(date -u +%Y-%m-%dT%H-%M-%S)"
   ```

2. **Organization ablations** (optional, same session discipline):

   ```bash
   npm run agent:test:ablations -- --debug
   ```

Compare output lands in `_agent/eval-reports/<run-id>/` as `compare-report.html`, `.md`, and `.json`. It also writes `probe-evidence-outcomes.suite-report.json`, `probe-evidence-transfer.suite-report.json`, and `probe-evidence-prompt.suite-report.json`. Pairing uses `compareId` then band-neutral scenario name (agent-test native). The evidence-parity manifest links the HTML path as `report` and MD as `reportMd`.

Transfer-arm failures on C1 (full pass, none fail) are **expected discriminating signal**. The orchestrator continues to the prompt arm. It still exits non-zero for triage/proposals.

### Fixture hygiene (discriminating band)

The shared `debug-app` fixture plants **two** session bugs (`sessionGuard.ts` `>=`, `sessionCookie.ts` ms→s). The **discriminating** band applies per-scenario seeds so only the guard bug remains:

- `fix-invention-guard-only.patch` — C1 symptom (“valid exactly at expiry”)
- `leave-redirect-guard-only.patch` — redirect comment + guard-only cookie path

The dual-bug `debug-app` stays for diagnose D2.

### Fixture hygiene (investigate null-arm)

- **Outcomes:** Guard-only seeds with answer keys present (skill + suite judges).
- **Null-arm answer-key hygiene:** Same class as diagnose. Outcomes run first. Then answer-key bytes live only in the orchestrator process (no `$TMPDIR` plaintext park). Deletions are committed on a detached HEAD with `main` / `origin/main` retargeted so `git show` cannot recover keys. Refs + bytes restore afterward. Null-arm suite JSON under `_agent/null-arm-suites/` strips `judge` and uses **guard-only** seeds under `_agent/probe-evidence-fixture-seeds/` (bug plant only — no answer-bearing hygiene patch in the agent-visible tree). Scenario display names stay opaque (`session hunch A/B`). Keep `compareId` stable.
- Tracked transfer/prompt `seedPatch` points at `_agent/probe-evidence-null-arm-hygiene.patch` (regenerated, gitignored) for source-level checks. Direct `agent:test:evidence-parity` does **not** apply that patch after park-commit.

### Fixture hygiene (diagnose)

- **D1 (no-repro):** No production seed. The agent must not touch code. The judge checks refusal, not locus file.
- **D2 (loop-before-cause):** Dual-bug `debug-app` is OK if the judge checks **ordering** (test before fix), not which bug file the agent names. Optional later: a guard-only seed if cookie forage confounds D2.
- **D3 (tight loop):** Retired with the ceiling suite. D1 and D2 remain the intentional direct comparison band.
- **Null-arm answer-key hygiene:** Outcomes run with keys present. Then answer-key bytes live only in the orchestrator process (no `$TMPDIR` plaintext park). Deletions are committed on a detached HEAD with `main` / `origin/main` retargeted so `git show` cannot recover keys. Refs + bytes restore afterward. Restore must not `checkout -f` — that wipes unrelated working-tree edits. Null-arm suite JSON under `_agent/null-arm-suites/` omits `seedPatch` / `judge` / `mustNotReadPath` (path hints teach forage attempts). Skill-body cribs go in `mustNot` instead. `mustNotReadPath` in source scenarios still applies via agent-test only on **successful** Reads with content (miss attempts do not fail). Scenario display names stay opaque (`session hunch A/B`). Keep `compareId` stable.

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
- Primary budget metric: **total tokens** (`usage.total` in `result.json` — agent + judge) when the SDK reports usage. Wall time (`durationMs`) remains a secondary proxy.
- Compare reports include per-arm token columns and Δ tok when usage is present (agent-test HTML/MD compare).
- If `full` does not beat `none` on settlement judges across repeats → lower **Confidence** or add **Does not transfer** in `research-basis.md`. Do not add skill prose.

## Suites

| Suite                     | `skills` | Purpose                                   |
| ------------------------- | -------- | ----------------------------------------- |
| `probe-evidence-outcomes` | `full`   | Skill-on settlement (discriminating band) |
| `probe-evidence-transfer` | `none`   | Hunch-only null baseline (discriminating) |
| `probe-evidence-prompt`   | `none`   | Prompt-instructed verdict-gate baseline   |
| `probe-fix-outcomes`      | `full`   | Skill-on discriminating band (D1/D2)      |
| `probe-fix-transfer`      | `none`   | Hunch-only null baseline (discriminating) |
| `probe-fix-prompt`        | `none`   | Prompt-instructed entry-gate baseline     |
| `organization-ablations`  | `full`   | Primary vs council vs fit-check           |

Diagnose compare artifacts land under `_agent/eval-reports/diagnose-<id>/` with `probe-fix-outcomes.suite-report.json` / `probe-fix-transfer.suite-report.json` / `probe-fix-prompt.suite-report.json`. Manifests under `_agent/evidence-runs/diagnose-<id>/manifest.json` record the D1 pass matrix (`full` vs `none` vs `prompt`).

## After failures

The orchestrator autofill step runs `propose-skill-evolution` for each failed `.debug` bundle. Manual triage:

1. Open `_agent/evidence-runs/<id>/manifest.json` for session paths and proposal list.
2. Triage debug bundle (`failures.json`, `summary.md`, `transcript.md`).
3. Human Keep → patch → contract lock per [skill-evolution.md](skill-evolution.md).

## Related

- [Agent suites](../agent-suites/README.md)
- [Skill evolution](skill-evolution.md)
- [Skill organization ablations](skill-organization-ablations.md)
