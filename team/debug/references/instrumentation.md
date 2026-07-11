# Instrumentation

Temporary debug logging for Cursor debug mode. Remove all instrumentation after verification — [workflow.md](workflow.md) § Cleanup checklist.

## Payload contract (all runtimes)

```json
{
  "timestamp": 0,
  "sessionId": "<sessionId>",
  "runId": "<runId>",
  "hypothesisId": "H1",
  "location": "file:line or fn",
  "message": "short event label",
  "data": {},
  "event": "optional",
  "outcome": "optional"
}
```

- `data` must be minimal, redacted — **no secrets, tokens, passwords, or PII**.
- Clear the log file with the **delete_file** tool before each repro run (debug-mode rule).
- One repro = one `runId`. Keep `sessionId` stable for the debug session.

## Python (Django / Celery)

- Wrap each log in `# #region agent log` / `# #endregion`.
- **Append NDJSON lines** to the log file — do **not** POST to the ingest URL.
- Resolve path: `/cursor-debug/debug-<sessionId>.log` when `/cursor-debug` exists, else repo `.cursor/`.
- Prefer **middleware** or a single request boundary over scattered prints.
- Use structured `logging` at boundaries; avoid ad-hoc `print`.
- Celery: log enqueue (API side) and dequeue/start/finish/fail (worker) with shared `runId` and task ID.

Docker mount setup: [surfaces/backend.md](surfaces/backend.md) · [docker-compose.md](docker-compose.md)

## TypeScript / JavaScript (client)

- For Cursor debug-mode session capture: use the one-line **fetch** template from the debug-mode reminder.
- Prefer `@postprint/logger` — includes `correlationId`; pass it in downstream evidence.
- Logger console transport is acceptable; raw `console.log` / `debugger` is ai-drift — remove before completion.
- Baseline: [surfaces/client.md](surfaces/client.md)

## Extension

- Same rules as client; include extension context in `data` (`background`, `popup`, `newtab`, `embed`).
- Log background relay boundaries for WS and ingest pipeline transitions.
- Baseline: [surfaces/extension.md](surfaces/extension.md)

## WebSocket

- Instrument subscribe/unsubscribe, connect/disconnect, send/receive envelope, handler errors.
- Include `channel`, `channelId`, `event`, and entity IDs in `data`.
- Cross-layer triage: [cross-cutting.md](cross-cutting.md)

## Node services (search-api, pdf-converter)

- Host-native stdout / structured errors — no container mount.
- Baseline: [surfaces/node-services.md](surfaces/node-services.md)

## Packages (tspackages, pypackages)

- Host paths only; unit tests + logger for package-local repro.
- Baseline: [surfaces/packages.md](surfaces/packages.md)
