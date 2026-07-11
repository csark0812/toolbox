# Client (Vite web / desktop)

Dev server: Vite **:5173** at <http://postprint.internal:5173>. Per-surface commands: [`docs/developer/surfaces.md`](../../../../../docs/developer/surfaces.md) § Client.

## Baseline checks

```bash
curl -s -o /dev/null -w '%{http_code}' http://postprint.internal:5173/
# or confirm bun dev / client:dev is running
```

Backend optional for UI-only work; API bugs need backend up at `:8000`.

## Log targets

| Method | Target |
|--------|--------|
| Cursor debug mode (session capture) | Ingest **fetch** from debug-mode reminder → `applications/.cursor/debug-<sessionId>.log` |
| Dev tracing | `@postprint/logger` — includes `correlationId`; see [`tspackages/logger/`](../../../../../tspackages/logger/) |
| Browser | DevTools → Console (logger output); Network tab for API calls |

Instrumentation rules: [../instrumentation.md](../instrumentation.md). Do not leave raw `console.log` / `debugger` in shipped code — [`docs/developer/ai-drift.md`](../../../../../docs/developer/ai-drift.md).

## Dev commands

```bash
bunx nx run client:dev
# or from root: bun run dev (full stack, best-effort :5173)
```

## Traps

| Symptom | Fix |
|---------|-----|
| `:5173` unreachable after `bootstrap:full` | Bootstrap is backend-only — run `bun run dev` or `bootstrap:full:dev` |
| esbuild exit 137 | [`docs/developer/troubleshooting.md`](../../../../../docs/developer/troubleshooting.md) § Frontend dev (esbuild) |
| Playwright Inspector / E2E debug | [`testing` skill](../../../testing/SKILL.md) — `bun run test:e2e:debug`, not this skill |

Deep dive: [`apps/client/README.md`](../../../../../apps/client/README.md)
