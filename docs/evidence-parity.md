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

**One command** runs the full cadence: `investigate-outcomes` (full) → `investigate-transfer` (none) → optional `diagnose-outcomes` + `organization-ablations` → compare report → evolution-note proposals for failures. Writes `_agent/evidence-runs/<id>/manifest.json`. Exits non-zero when any scenario fails (for triage, not CI by default).

```bash
# Faster: investigate transfer only, no diagnose/ablations
npm run agent:test:evidence-parity -- --no-diagnose --no-ablations

# Re-compare + propose from an existing debug staging dir
npm run agent:test:evidence-parity -- --compare-only --debug-dir "$TMPDIR/toolbox-evidence-<id>"
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

1. **Skill-on (full)** — with debug on failures:

   ```bash
   npm run agent:test:outcomes -- --debug
   ```

   Or investigate only:

   ```bash
   npm run sync:claude-skills && agent-test --suites-dir agent-suites --suite investigate-outcomes --live --debug
   ```

2. **Skill-off (none)** — transfer band:

   ```bash
   npm run agent:test:transfer -- --debug
   ```

3. **Organization ablations** (optional, same session discipline):

   ```bash
   npm run agent:test:ablations -- --debug
   ```

4. **Compare** — two debug session roots (or use orchestrator output):

   ```bash
   node scripts/compare-agent-runs.mjs \
     --left  "$TMPDIR/agent-spec/sessions/<full-session-id>" \
     --right "$TMPDIR/agent-spec/sessions/<none-session-id>" \
     --left-label full \
     --right-label none \
     --align normalized
   ```

   Report lands in `_agent/eval-reports/<timestamp>.md` (gitignored).

## Equal-budget discipline

- Same model family for both arms in a comparison row.
- Primary budget metric: **total tokens** (`usage.total` in `result.json` — agent + judge) when the SDK reports usage; wall time (`durationMs`) remains a secondary proxy.
- Compare reports include per-arm token columns and Δ tok when usage is present.
- If `full` does not beat `none` on settlement judges across repeats → lower **Confidence** or add **Does not transfer** in `research-basis.md`; do not add skill prose.

## Suites

| Suite                    | `skills` | Purpose                              |
| ------------------------ | -------- | ------------------------------------ |
| `investigate-outcomes`   | `full`   | Skill-on settlement                  |
| `diagnose-outcomes`      | `full`   | Skill-on loop gates                  |
| `investigate-transfer`   | `none`   | Null baseline for investigate judges |
| `organization-ablations` | `full`   | Primary vs council vs fit-check      |

## After failures

The orchestrator autofill step runs `propose-skill-evolution` for each failed `.debug` bundle. Manual triage:

1. Open `_agent/evidence-runs/<id>/manifest.json` for session paths and proposal list.
2. Triage debug bundle (`failures.json`, `summary.md`, `transcript.md`).
3. Human Keep → patch → contract lock per [skill-evolution.md](skill-evolution.md).

## Related

- [Agent suites](../agent-suites/README.md)
- [Skill evolution](skill-evolution.md)
- [Skill organization ablations](skill-organization-ablations.md)
