# Cross-cutting (API ↔ client ↔ WebSocket ↔ Celery)

Use when the bug spans multiple layers. WebSocket SSOT: [`docs/developer/websocket.md`](../../../../docs/developer/websocket.md) § Dev and debug.

## Triage order

1. **User trigger + client mutation** — `runId` starts here
2. **API boundary** — request accepted/rejected, key entity IDs
3. **DB mutation result** — committed state or failure
4. **Async dispatch** — Celery task queued / started / completed ([surfaces/backend.md](surfaces/backend.md))
5. **Realtime broadcast** — event emitted + channel target
6. **Client subscription handling** — cache/state mutation after WS receive

## Correlation

- Reuse the same **`runId`** across all logs in one repro.
- Keep **`sessionId`** stable for the debug session.
- Attach runtime-native IDs: `requestId`, logger `correlationId`, Celery task ID, `sourceId` / `projectId` / entity IDs.
- If nothing auto-propagates, pass `runId` explicitly in request metadata during debug instrumentation.

## Where to look

| Layer | Inspection |
|-------|------------|
| Client | DevTools → Network (HTTP + WS frames); `@postprint/logger` output |
| API | NDJSON / Django logs — [surfaces/backend.md](surfaces/backend.md); `bunx nx run backend:logs` |
| WebSocket | Browser DevTools → Network → WS; backend channel handlers |
| Celery | `docker logs postprint_local_celeryworker`; enqueue logs on API side |

## Surface references

- Client: [surfaces/client.md](surfaces/client.md)
- Backend + Celery: [surfaces/backend.md](surfaces/backend.md)
- Extension relay: [surfaces/extension.md](surfaces/extension.md)
- Payload schema: [instrumentation.md](instrumentation.md)
- Verification: [workflow.md](workflow.md) § Verification bar
