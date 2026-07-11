# Backend (Django / Celery in Docker)

Cursor debug mode for Python runs in **`postprint_local_django`** with only `apps/backend` → `/app` mounted — the monorepo `.cursor/` tree is **not** visible inside the container unless you add a mount.

Compose details: [../docker-compose.md](../docker-compose.md) · Orchestration SSOT: [`docs/developer/backend.md`](../../../../../docs/developer/backend.md)

## Baseline checks

Run before blaming instrumentation:

```bash
docker ps --format '{{.Names}}' | grep postprint_local_django
docker exec postprint_local_django printenv CURSOR_DEBUG_SESSION_ID POSTPRINT_CURSOR_DEBUG_LOG
docker inspect postprint_local_django --format '{{json .Mounts}}' | python3 -m json.tool
curl -s http://localhost:8000/api/health/
```

Celery worker logs: `docker logs postprint_local_celeryworker --tail 50` or `bunx nx run backend:logs`.

## One-time Docker setup (per debug session)

### 1. Mount monorepo `.cursor` into Django

In `apps/backend/docker-compose.local.yml`, under `django.volumes`:

```yaml
volumes:
  - .:/app:z
  - ../../.cursor:/cursor-debug:z
```

Celery services inherit the anchor — same mount if they need logging.

### 2. Env (optional gate)

Add to `apps/backend/.envs/.local/.django` while debugging:

```bash
CURSOR_DEBUG_SESSION_ID=<sessionId>
# POSTPRINT_CURSOR_DEBUG_LOG=/cursor-debug/debug-<sessionId>.log  # only if not using default resolver
```

### 3. Recreate — not just restart

Compose **volume and env_file** changes require recreate:

```bash
cd apps/backend
docker compose -f docker-compose.infra.yml -f docker-compose.local.yml up -d --force-recreate django
```

`bun dev` restart alone often leaves the old container spec.

### 4. Verify mount + write

```bash
docker exec postprint_local_django test -d /cursor-debug && echo ok
curl -s http://localhost:8000/api/health/
# host:
cat ../../.cursor/debug-<sessionId>.log
```

Expect valid NDJSON with `"sessionId":"<sessionId>"`.

## Instrumentation

Prefer **middleware** or a single request boundary over scattered prints. Python NDJSON pattern: [../instrumentation.md](../instrumentation.md).

## Common traps

| Symptom | Likely cause |
|---------|----------------|
| No log file on host | Middleware/env not loaded, or container not recreated |
| Log inside container only | Missing `../../.cursor:/cursor-debug` mount |
| Env unset in container | Var not in `.envs/.local/.django` or recreate skipped |
| `OSError` swallowed | Path parent missing — `mkdir(parents=True)` before append |
| Wrong path in container | Code used host absolute path instead of `/cursor-debug/...` |
