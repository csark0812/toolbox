---
name: debug
description: Bug localization and Cursor debug-mode instrumentation across PostPrint. Use when the owning layer is unknown, NDJSON at applications/.cursor/debug-*.log is needed, temporary instrumentation or compose mount/env is required, or cross-layer repro is needed. Not for new features (issues-format.md tracer bullets), writing/fixing tests (testing), read-only hunch verdicts (investigate), Playwright Inspector (testing), setup recovery (troubleshooting.md), or prod/k8s logs (k8s, observability.md).
---

# Debug

**Localize** (which layer?) then **instrument** (prove hypothesis with logs). Cursor debug mode expects NDJSON at `applications/.cursor/debug-<sessionId>.log`.

## When to Use

- Owning layer unknown; cross-layer repro needed
- Cursor debug mode, NDJSON at `.cursor/debug-*.log`, compose mount/env
- Instrumentation to prove or disprove a hypothesis

Not for: new features ([issues-format.md](references/planning/issues-format.md)), tests/CI ([`testing`](../testing/SKILL.md)), read-only hunches ([`investigate`](../investigate/SKILL.md)), prod/k8s logs (`k8s` project-local skill — see [docs/tiers.md](../docs/tiers.md)).

## Craft principles

1. **Localize before you fix** — never fix before you know the layer.
2. **Hypothesis first** — "I think X because Y. If true, Z will be observable."
3. **One variable at a time** — multiple changes = no learning.
4. **Read existing signals first** — DevTools, Network, Django logs, React Query DevTools — [localization.md](references/localization.md).
5. **One-sentence bug** — if you can't state it, keep investigating.
6. **Repeat bugs are design problems** — fix the mechanism, not the instance — [techniques.md](references/techniques.md) § When it's a design problem.

## Router

| Symptom / surface | Load |
|-------------------|------|
| Don't know which layer | [references/localization.md](references/localization.md) |
| Missing `.cursor/debug-*.log`, compose env/volume, Django/Celery | [references/surfaces/backend.md](references/surfaces/backend.md) + [references/docker-compose.md](references/docker-compose.md) |
| Client misbehavior in browser (`:5173`) | [references/surfaces/client.md](references/surfaces/client.md) |
| Extension (WXT, background/content script) | [references/surfaces/extension.md](references/surfaces/extension.md) |
| search-api / pdf-converter | [references/surfaces/node-services.md](references/surfaces/node-services.md) |
| Shared package logic (tspackages, pypackages) | [references/surfaces/packages.md](references/surfaces/packages.md) |
| Client + API + WebSocket + Celery | [references/cross-cutting.md](references/cross-cutting.md) |

Instrumentation: [references/instrumentation.md](references/instrumentation.md) · Workflow + cleanup: [references/workflow.md](references/workflow.md) · Techniques: [references/techniques.md](references/techniques.md)

## Before instrumenting

1. Read the debug-mode reminder for **log path**, **session ID**, and **ingest endpoint** (JS/TS only).
2. Confirm the relevant stack is running (see surface reference).
3. Define correlation keys: `sessionId`, `runId` (one per repro), `hypothesisId` — [references/instrumentation.md](references/instrumentation.md).

## Universal protocol

1. State **3–5 hypotheses** before adding logs.
2. Instrument at **boundaries** (request entry/exit, WS send/receive, Celery enqueue/dequeue) — not scattered internals first.
3. Clear prior debug artifacts (`delete_file` on NDJSON log), then run **one repro** with a fresh `runId`.
4. **Minimize** — shrink to the smallest scenario that still reproduces; cut inputs, callers, and config one at a time; done when every remaining element is load-bearing.
5. Read logs by hypothesis → mark **CONFIRMED / REJECTED / INCONCLUSIVE** with line citations.
6. Fix only with log proof; keep instrumentation through post-fix verification.
7. Verify: targeted tests + `bun run validate:changed <paths>` + cross-layer repro when applicable.
8. Cleanup — [references/workflow.md](references/workflow.md) § Cleanup checklist.

## Skill boundaries

See [agent-routing.md](references/agent-routing.md) § Quality & ops. **Handoffs:** reproducible failure with a test → `testing` first; add `debug` when test output is insufficient. Multi-surface wiring uncertainty → `debug` first.

## Path rules (summary)

| Runtime | Write target on host |
|---------|----------------------|
| Docker backend (recommended) | `applications/.cursor/debug-<sessionId>.log` via mount — [surfaces/backend.md](references/surfaces/backend.md) |
| Non-Docker `uv run` | `applications/.cursor/debug-<sessionId>.log` (repo-relative) |
| Client / extension (JS/TS) | Ingest fetch from debug-mode reminder, or `@postprint/logger` — [surfaces/client.md](references/surfaces/client.md) |
| Override | `POSTPRINT_CURSOR_DEBUG_LOG` inside container |

**Python:** append NDJSON — do **not** POST to ingest URL. **TypeScript/JavaScript:** use the one-line `fetch` template from the debug-mode reminder when session capture is required.

## References

- [references/localization.md](references/localization.md) — symptom → layer table
- [references/techniques.md](references/techniques.md) — bisect, isolation, delta, design-vs-bug
- [references/workflow.md](references/workflow.md) — hypothesis protocol, verification bar, cleanup
- [references/instrumentation.md](references/instrumentation.md) — NDJSON schema, per-runtime rules
- [references/docker-compose.md](references/docker-compose.md) — container names, recreate vs restart
- Per-surface: [backend](references/surfaces/backend.md) · [client](references/surfaces/client.md) · [extension](references/surfaces/extension.md) · [node-services](references/surfaces/node-services.md) · [packages](references/surfaces/packages.md) · [cross-cutting](references/cross-cutting.md)
- Agent traps (sandbox Docker): [`docs/developer/troubleshooting.md`](../../../docs/developer/troubleshooting.md) § Common agent traps

## Output format

Follow [references/output-schema.md](references/output-schema.md). End with hypothesis verdicts (CONFIRMED / REJECTED / INCONCLUSIVE) and cleanup status when instrumentation was used.
