# Docker compose reference (debug sessions)

Working directory for all commands: `apps/backend`.

## Compose files

| File | Services |
|------|----------|
| `docker-compose.infra.yml` | Postgres, Redis, MinIO, Mailpit, ClickHouse |
| `docker-compose.local.yml` | Django, Celery worker, Celery beat |

Full stack uses **both** `-f` flags (same order as Nx `backend:dev`).

## Container names

| Service | Container |
|---------|-----------|
| Django | `postprint_local_django` |
| Celery worker | `postprint_local_celeryworker` |
| Celery beat | `postprint_local_celerybeat` |

## Nx equivalents

| Task | Command |
|------|---------|
| Infra up | `bunx nx run backend:up` |
| App stack | `bunx nx run backend:dev` |
| Shell | `bunx nx run backend:shell` |
| pytest | `bunx nx run backend:test` |

## Recreate vs restart

| Change | Action |
|--------|--------|
| Python code under `/app` | Hot reload / restart process (volume bind) |
| `env_file` or `volumes` in compose | `up -d --force-recreate django` |
| New env in `.django` only | Recreate (env baked at container create) |

## Debug mount path math

Compose file lives at `apps/backend/docker-compose.local.yml`.

- Host: `applications/.cursor/` (monorepo root)
- Compose relative: `../../.cursor` → `/cursor-debug` in container
- Log file in container: `/cursor-debug/debug-<sessionId>.log`
- Same file on host: `applications/.cursor/debug-<sessionId>.log`

## Sandbox note

Agent shells may block `docker info`. Request unrestricted permissions before bootstrap, recreate, or backend tests — see [`docs/developer/troubleshooting.md`](../../../../docs/developer/troubleshooting.md).
