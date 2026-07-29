# Agent Suites

Toolbox agent suites are portable conformance checks for public skills. They use neutral fixture files and replay traces so they can run outside any consumer repo.

## Suite bands

| Band             | Purpose                                                           | CI default                    | Command                                |
| ---------------- | ----------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
| **Contract**     | Process gates — did the agent follow the skill protocol?          | Replay (`npm run agent:test`) | `agent-test --suites-dir agent-suites` |
| **Outcome**      | Task settlement — did the agent reach the right verdict / loop?   | Stub replay (no judge)        | `npm run agent:test:outcomes` (live)   |
| **Ablation**     | Organization arms — primary vs council, fit-check vs forced spawn | Stub replay (no judge)        | `npm run agent:test:ablations` (live)  |
| **Ambient live** | Network fetch of GitHub raw ambient refs                          | Skipped (`skip: true`)        | `npm run agent:test:live`              |

Contract suites use golden `replayTrace` JSON. Outcome and ablation suites ship placeholder traces for live staging and stub replay in CI; the LLM judge runs only under `--live`.

### Authoring outcome scenarios

1. Plant bugs in neutral fixtures — see `agent-suites/fixtures/debug-app/`.
2. Write a prompt with a **held-out hunch** the agent has not seen in contract replays.
3. Tie `judge` questions to a `research-basis.md` claim (e.g. kill tests before forage, loop before cause).
4. Ship a placeholder `replayTrace` for CI stub replay and live staging (judge criteria evaluate only under `--live`).
5. Record goldens after a good live run: `npm run agent:test:live -- --suite <suite> --record-fixtures`.

**Good judge question:** “The agent cited sessionGuard.ts with a boundary comparator issue and did not invent a fix.”

**Bad judge question:** “The agent was thorough.”

Consumer repos own product integration outcomes (app paths, private docs, `validate:changed` dogfood). Toolbox owns portable cognition only.

## Ownership Boundary

Toolbox owns generic skill-contract behavior:

- `code-review`: source adapters, surface-size bands, primary-first default with escalation on demand, merge-blocker default filing, anti-thrash / contextual re-review convergence, and no-commit review behavior.
- `multi`: Fit check — name single-pass rival before `N ≥ 2`; skip when independence fails.
- `second-opinion`: staged debate with claim anchoring; unanchored kills tagged `drift`.
- `investigate`: discriminating kill tests; leave dead patches after 2–3 no-signal reads.
- `investigate-outcomes`: live settlement of founded/unfounded hunches (see `fixtures/debug-app/`).
- `crystallize`: alternate problem frame before crystallized output.
- `tdd`: seam confirmation before the first test; red-green slice discipline.
- `diagnose`: entry gate — no repro means no hypotheses; route to investigate or get a repro.
- `diagnose-outcomes`: live tight-loop construction before hypothesizing.
- `domain-model`: entry gate — no stated decision means no ADR; route to grill or crystallize.
- `prototype`: declare design question + mode before writing throwaway code.
- `grill`: falsifier recorded before leaving a decision node.
- `handoff`: paths-only artifacts, redaction before write to `_agent/handoffs/`.
- `writing-great-skills`: user-only skills stay user-invoked (`disable-model-invocation`).
- `organization-ablations`: live SkillJuror-lite arms — see [docs/skill-organization-ablations.md](../docs/skill-organization-ablations.md).
- `github-ambient-refs`: live-only dogfood that ambient refs via GitHub raw URLs are fetchable at agent runtime (scenarios skipped in replay CI). See [docs/github-ambient-refs-validation.md](../docs/github-ambient-refs-validation.md).

After live failures, follow [docs/skill-evolution.md](../docs/skill-evolution.md) for human-gated patches.

Consumer repos own integration dogfood suites for local product paths, rules, validation commands, and private docs. For example, PostPrint scenarios that mention `apps/client/**`, `apps/backend/**`, product auth/session code, council overlays, or PostPrint `validate:changed` stay in `PostPrint/applications`.

## Commands

```bash
npm run agent:test
```

Replay mode is the default and does not require live credentials. Install dependencies with `npm ci`. The `@post-print/agent-test` CLI runs under Node ≥ 22.

```bash
npm run agent:test:outcomes
```

Live outcome band for `investigate-outcomes` and `diagnose-outcomes`. Requires `CURSOR_API_KEY`.

```bash
npm run agent:test:ablations
```

Live organization ablation suite. Requires `CURSOR_API_KEY`.

```bash
npm run agent:test:live
```

Live mode uses the installed `@cursor/sdk` in isolated worktrees and requires `CURSOR_API_KEY` (copy `.env.example` to `.env`).

### Live debug

```bash
npm run agent:test:live:debug
```

`--debug` (via the script above) keeps staging traces and writes failure bundles with transcripts. **Default staging parent:** `$TMPDIR/agent-spec/sessions/<id>/…` — outside the repo.

| Do                                                                  | Avoid                                                                                                                               |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `npm run agent:test:live:debug`                                     | `tee agent-test-live.log` in repo root (shows up in `git status`)                                                                   |
| `--debug-dir "$TMPDIR/agent-test-debug"` when you need a fixed path | `--debug-dir ./agent-test-debug` inside the repo (clutters `git status`; pre-0.1.18 caused false `worktree_leak` on first scenario) |

Live runs already use **git worktree isolation** for agent edits (`$TMPDIR/agent-harness-wt-…`). The worktree leak guard watches your **caller checkout** (where you ran npm). Harness staging under `--debug-dir` is excluded from that check as of `@post-print/agent-test` 0.1.18; prefer `$TMPDIR` anyway.

`skip: true` skips a scenario in **both** replay and live. Use it only for suites that must never run in CI (e.g. `github-ambient-refs` network dogfood). Outcome and ablation scenarios must not set `skip` if you want `npm run agent:test:outcomes` / `agent:test:ablations` to invoke the agent.
