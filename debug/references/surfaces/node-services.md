# Node services (search-api, pdf-converter)

Host-native runtimes — **no Docker debug mount**. Per-surface commands: [`docs/developer/surfaces.md`](../../../../../docs/developer/surfaces.md).

## search-api (:4000)

```bash
bunx nx run backend:up          # Postgres, Redis, etc.
bunx nx run search-api:dev
curl -s http://localhost:4000/health  # or project health route
```

- Logs: host stdout / structured `ApiError` middleware output
- Env: copy from [`apps/search-api/.env.example`](../../../../../apps/search-api/.env.example) — `postprint.internal:5432` for shared stack (not `:5433`)

## pdf-converter

```bash
bunx nx run pdf-converter:dev   # see surfaces.md for port
```

- Logs: Express error middleware / host stdout
- Env: [`getting-started.md`](../../../../../docs/developer/getting-started.md) § Prerequisites

## Instrumentation

Append NDJSON to `applications/.cursor/debug-<sessionId>.log` from host paths, or use ingest fetch if running TS instrumentation. No `/cursor-debug` mount — paths are repo-relative on the host.

Codegen dependency: `bun run generate-clients` needs backend `:8000` and search-api `:4000` — [`docs/developer/builds.md`](../../../../../docs/developer/builds.md).
