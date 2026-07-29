# Evidence parity (agent-test)

**Source of truth for** running skill-on vs skill-off outcome comparisons and interpreting transfer tables.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Measure whether toolbox skills improve settlement under transfer — without autonomous skill mutation.

## Preflight

```bash
set -a && source .env && set +a
npx agent-test --doctor
npm run agent:test:evidence-parity
```

**One command** runs the discriminating cadence: `agent-test --compare-pairs investigate-outcomes:investigate-transfer` → optional `diagnose-outcomes` + `organization-ablations` → evolution-note proposals for failures. Writes `_agent/evidence-runs/<id>/manifest.json` and compare HTML/MD/JSON under `_agent/eval-reports/<id>/`. Exits non-zero when any scenario fails (for triage, not CI by default).

Scenarios that pass on both arms (ceiling) live in `investigate-outcomes-ceiling` / `investigate-transfer-ceiling` — replay CI only, not this command.

**Not in CI:** `npm run check` / `npm test` runs replay contract suites only. Evidence-parity is a **manual** cadence (`CURSOR_API_KEY`, live judges). Do not wire `agent:test:evidence-parity` into `.github/workflows` unless you explicitly want live spend on every PR.

```bash
# Faster: investigate transfer only, no diagnose/ablations
npm run agent:test:evidence-parity -- --no-diagnose --no-ablations

# Re-render compare from prior suite-report JSON (no live spend)
npm run agent:test:evidence-parity -- --compare-only
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

Compare output lands in `_agent/eval-reports/<run-id>/` as `compare-report.html`, `.md`, and `.json`, plus `investigate-outcomes.suite-report.json` and `investigate-transfer.suite-report.json`. Pairing uses `compareId` then band-neutral scenario name (agent-test native). The evidence-parity manifest links the HTML path as `report` and MD as `reportMd`.

## Equal-budget discipline

- Same model family for both arms in a comparison row.
- Primary budget metric: **total tokens** (`usage.total` in `result.json` — agent + judge) when the SDK reports usage; wall time (`durationMs`) remains a secondary proxy.
- Compare reports include per-arm token columns and Δ tok when usage is present (agent-test HTML/MD compare).
- If `full` does not beat `none` on settlement judges across repeats → lower **Confidence** or add **Does not transfer** in `research-basis.md`; do not add skill prose.

## Suites

| Suite                          | `skills` | Purpose                                   |
| ------------------------------ | -------- | ----------------------------------------- |
| `investigate-outcomes`         | `full`   | Skill-on settlement (discriminating band) |
| `investigate-transfer`         | `none`   | Null baseline (discriminating band)       |
| `investigate-outcomes-ceiling` | `full`   | Replay CI only — ceiling scenarios        |
| `investigate-transfer-ceiling` | `none`   | Replay CI only — ceiling scenarios        |
| `diagnose-outcomes`            | `full`   | Skill-on loop gates                       |
| `organization-ablations`       | `full`   | Primary vs council vs fit-check           |

## After failures

The orchestrator autofill step runs `propose-skill-evolution` for each failed `.debug` bundle. Manual triage:

1. Open `_agent/evidence-runs/<id>/manifest.json` for session paths and proposal list.
2. Triage debug bundle (`failures.json`, `summary.md`, `transcript.md`).
3. Human Keep → patch → contract lock per [skill-evolution.md](skill-evolution.md).

## Related

- [Agent suites](../agent-suites/README.md)
- [Skill evolution](skill-evolution.md)
- [Skill organization ablations](skill-organization-ablations.md)
