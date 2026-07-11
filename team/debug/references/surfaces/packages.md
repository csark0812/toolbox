# Packages (tspackages, pypackages)

Shared library logic — debug on the **host**, not inside backend containers.

## Approach

1. Reproduce with the **smallest scoped test** in the owning package (`bunx nx run <project>:test` or pytest for pypackages).
2. Instrument at package boundaries; write NDJSON to repo-relative `applications/.cursor/debug-<sessionId>.log`.
3. No compose mount — container paths do not apply.

## Key packages

| Package | Debug via |
|---------|-----------|
| `@postprint/logger` | Logger transports + `correlationId` — [`tspackages/logger/`](../../../../../tspackages/logger/) |
| `@postprint/query` | Vitest in package or client integration test |
| `@postprint/websocket` | Client/extension + backend — use [../cross-cutting.md](../cross-cutting.md) for full path |
| `@postprint/api-middleware` | Client Vitest or middleware unit tests |

Nx boundaries: import via `@postprint/*`, never relative paths across project roots — [`docs/developer/architecture.md`](../../../../../docs/developer/architecture.md).

Instrumentation: [../instrumentation.md](../instrumentation.md)
