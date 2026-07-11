# Localization — which layer?

Narrow the layer before reading implementation code or adding instrumentation.

| Symptom | Suspect layer | First check |
|---------|---------------|-------------|
| Stale data after mutation | TanStack Query cache | Invalidation in mutation `onSuccess` — [`tanstack-query` SKILL.md](../../tanstack-query/SKILL.md) |
| Data correct in DevTools, wrong on screen | React render | Prop chain, `useMemo` deps |
| Sporadic 401s / redirect loops | Auth middleware | Token refresh race — [`tspackages/api-middleware/`](../../../../tspackages/api-middleware/) |
| State doubled or missing | WebSocket handler | Event idempotency — [`docs/developer/websocket.md`](../../../../docs/developer/websocket.md) |
| TS passes, runtime `undefined` | API type mismatch | Generated client vs Network tab response — regenerate clients per [`docs/developer/builds.md`](../../../../docs/developer/builds.md) |
| Worked on main, broken on branch | Regression | `git bisect` — [techniques.md](techniques.md) |
| CI only failing | Environment / config | [`docs/developer/troubleshooting.md`](../../../../docs/developer/troubleshooting.md) |
| Backend 500 | Django router → service → DB | Error body first — [surfaces/backend.md](surfaces/backend.md) |
| Client + API + WS + Celery | Cross-layer wiring | [cross-cutting.md](cross-cutting.md) |

## Read signals first

1. Browser DevTools → Console, Network (HTTP + WS)
2. React Query DevTools
3. `bunx nx run backend:logs`
4. Existing NDJSON at `applications/.cursor/debug-<sessionId>.log`

Add instrumentation only when existing signals don't narrow the hypothesis — [instrumentation.md](instrumentation.md).
