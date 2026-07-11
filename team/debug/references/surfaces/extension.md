# Extension (WXT)

Per-surface commands: [`docs/developer/surfaces.md`](../../../../../docs/developer/surfaces.md) § Extension.

## Baseline checks

```bash
bunx nx run extension:dev
# Full stack: bun run dev (includes extension when esbuild healthy)
```

## Log targets

| Context | Notes |
|---------|-------|
| Background service worker | Primary relay for WS and API; instrument boundary transitions |
| Popup / newtab / embed | Include context in log `data` — see [../instrumentation.md](../instrumentation.md) |
| Cursor debug mode | Ingest fetch from debug-mode reminder (same as client) |
| Dev tracing | `@postprint/logger` with extension context field |

Instrumentation rules: [../instrumentation.md](../instrumentation.md). Remove raw `console.log` before completion.

## Traps

| Symptom | Fix |
|---------|-----|
| `extension:prepare` failed on install | Non-fatal — [`docs/developer/troubleshooting.md`](../../../../../docs/developer/troubleshooting.md) |
| esbuild exit 137 | Same as client — § Frontend dev (esbuild) in troubleshooting |
| Arc toolbar panel unavailable | Newtab fallback — [`apps/extension/README.md`](../../../../../apps/extension/README.md) |

Deep dive: [`apps/extension/README.md`](../../../../../apps/extension/README.md)
