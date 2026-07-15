# Agent Suites

Toolbox agent suites are portable conformance checks for public skills. They use neutral fixture files and replay traces so they can run outside any consumer repo.

## Ownership Boundary

Toolbox owns generic skill-contract behavior:

- `routing`: Low hands-on routing, hands-off PR routing blocks, and delegation to `grill` / `crystallize`.
- `code-review`: review mode detection, depth selection, merge-blocker default filing, anti-thrash / contextual re-review convergence, and no-commit review behavior.
- `github-ambient-refs`: live-only dogfood that ambient refs via GitHub raw URLs are fetchable at agent runtime (scenarios skipped in replay CI). See [docs/github-ambient-refs-validation.md](../docs/github-ambient-refs-validation.md).

Consumer repos own integration dogfood suites for local product paths, rules, validation commands, and private docs. For example, PostPrint scenarios that mention `apps/client/**`, `apps/backend/**`, product auth/session code, council overlays, or PostPrint `validate:changed` stay in `PostPrint/applications`.

## Commands

```bash
npm run agent:test
```

Replay mode is the default and does not require live credentials. Install dependencies with `npm ci`. The `@post-print/agent-test` CLI runs under Node ≥ 22.

```bash
npm run agent:test:live
```

Live mode uses the installed `@cursor/sdk` in isolated worktrees and requires `CURSOR_API_KEY` (copy `.env.example` to `.env`).
