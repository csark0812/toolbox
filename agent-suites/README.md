# Agent Suites

Toolbox agent suites are portable conformance checks for public skills. They use neutral fixture files and replay traces so they can run outside any consumer repo.

## Ownership Boundary

Toolbox owns generic skill-contract behavior:

- `routing`: Low hands-on routing, hands-off PR routing blocks, and delegation to `grill` / `crystallize`.
- `code-review`: review mode detection, depth selection, merge-blocker default filing, and no-commit review behavior.

Consumer repos own integration dogfood suites for local product paths, rules, validation commands, and private docs. For example, PostPrint scenarios that mention `apps/client/**`, `apps/backend/**`, product auth/session code, council overlays, or PostPrint `validate:changed` stay in `PostPrint/applications`.

## Commands

```bash
npm run agent:test
```

Replay mode is the default and does not require live credentials. Install dependencies with `npm ci` and ensure Bun is available. The published `@post-print/agent-test` CLI currently needs Bun for its built ESM imports; keep this workaround local to the `agent:test` scripts until the package ships Node-compatible import specifiers.

```bash
npm run agent:test:live
```

Live mode uses the installed `@cursor/sdk` in isolated worktrees and requires `CURSOR_API_KEY` (copy `.env.example` to `.env`).
