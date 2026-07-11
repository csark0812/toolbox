# Debug workflow

Hypothesis-driven session protocol for all surfaces. Instrumentation details: [instrumentation.md](instrumentation.md).

## Hypothesis workflow

1. State **3–5 hypotheses** before adding logs. Give each a stable `hypothesisId` (`H1`, `H2`, …) and expected disproof signal.
2. Define **correlation keys** before instrumenting: `sessionId`, `runId` (one per repro), `hypothesisId`, plus surface IDs (`requestId`, task ID, `correlationId`, entity IDs).
3. Tag each log with `hypothesisId`.
4. Clear prior debug artifacts, then run **one repro** with a fresh `runId`.
5. **Minimize** — shrink to the smallest scenario that still reproduces; cut inputs, callers, and config one at a time; done when every remaining element is load-bearing.
6. Read NDJSON/logs → mark each hypothesis **CONFIRMED / REJECTED / INCONCLUSIVE** with line citations.
7. Fix only with log proof; keep instrumentation through post-fix verification.
8. Cleanup when user confirms resolution — checklist below.

## Verification bar

A fix is complete only when all pass:

1. **Hypothesis closure** — root-cause hypothesis confirmed; competing hypotheses rejected or inconclusive with evidence.
2. **Repro closure** — original repro no longer fails in the same environment.
3. **Targeted tests** — add or adjust tests for the exact broken behavior when applicable; run smallest relevant layer first.
4. **Cross-layer confirmation** — for API + WS + Celery flows, validate at least one end-to-end path (scripted e2e or integration chain).
5. **Repo validation** — `bun run validate:changed <touched-paths>`.
6. **No residual debug debt** — no temporary logs, env overrides, compose debug mounts, or debug-only branching left behind.

## Cleanup checklist

- [ ] Delete temporary middleware / debug helpers and `#region agent log` blocks
- [ ] Remove `CURSOR_DEBUG_SESSION_ID` from `.django` (backend sessions)
- [ ] Remove `/cursor-debug` volume from compose (unless team keeps it)
- [ ] Recreate django if compose/env changed
- [ ] Remove temporary frontend/extension debug toggles and network intercepts
- [ ] Confirm no raw `console.log` / `debugger` additions remain in changed files — see [`docs/developer/ai-drift.md`](../../../../docs/developer/ai-drift.md)
- [ ] Confirm no secrets/PII in local debug logs; delete debug log files if needed
- [ ] Run `bun run validate:changed <paths>`
