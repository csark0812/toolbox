# Agent Suites

Toolbox agent suites are portable conformance checks for public process skills. They prove **portable process contracts**, not consumer product workflows. They use neutral fixture files and replay traces so they can run outside any consumer repo.

## Suite bands

| Band             | Purpose                                                                         | CI default                    | Command                                |
| ---------------- | ------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
| **Contract**     | Process gates — did the agent follow the skill protocol?                        | Replay (`npm run agent:test`) | `agent-test --suites-dir agent-suites` |
| **Outcome**      | Task settlement — did the agent reach the right verdict / loop?                 | Stub replay (no judge)        | `npm run agent:test:outcomes` (live)   |
| **Transfer**     | Same judges as outcome with `skills: none` (null baseline — hunch-only prompts) | Stub replay (no judge)        | `npm run agent:test:transfer` (live)   |
| **Prompt**       | Verdict-gate rules in prompt, `skills: none` (no skill file)                    | Stub replay (no judge)        | `npm run agent:test:evidence-parity`   |
| **Ceiling**      | Scenarios that pass on both arms — replay CI only, not evidence-parity          | Stub replay (no judge)        | `npm run agent:test` only              |
| **Ablation**     | Organization arms — primary vs council, fit-check vs forced spawn               | Stub replay (no judge)        | `npm run agent:test:ablations` (live)  |
| **Ambient live** | Network fetch of GitHub raw ambient refs                                        | Skipped (`skip: true`)        | `npm run agent:test:live`              |

Contract suites use golden `replayTrace` JSON. Outcome and ablation suites ship placeholder traces for live staging and stub replay in CI. The LLM judge runs only under `--live`.

### Authoring outcome scenarios

1. Plant bugs in neutral fixtures — see `agent-suites/fixtures/debug-app/`.
2. Write a prompt with a **held-out hunch** the agent has not seen in contract replays.
3. Tie `judge` questions to a `research-basis.md` claim (for example kill tests before forage, loop before cause).
4. Ship a placeholder `replayTrace` for CI stub replay and live staging (judge criteria evaluate only under `--live`).
5. Record goldens after a good live run: `npm run agent:test:live -- --suite <suite> --record-fixtures`.

**Good judge question:** “The agent cited sessionGuard.ts with a boundary comparator issue and did not invent a fix.”

**Bad judge question:** “The agent was thorough.”

Consumer repos own product integration outcomes (app paths, private docs, `validate:changed` dogfood). Toolbox owns portable process contracts only.

## Ownership Boundary

Toolbox owns generic skill-contract behavior:

- `code-review`: diff adapters, merge-blocker filing, review-only — no orchestration in skill body.
- `subagents`: Fit check — name single-pass rival before `N ≥ 2`. Skip when independence fails.
- `second-opinion`: full or light cast with claim anchoring. Unanchored kills tagged `drift`. Path or paste artifact.
- `iterate`: blind pass protocol markers (`Pass: blind`, `Cohesion: attested-local`). Thrash reopen without sibling mint.
- `probe-evidence`: discriminating kill tests. Leave dead patches after 2–3 no-signal reads (Evidence stance).
- `probe-evidence-outcomes` / `probe-evidence-transfer` / `probe-evidence-prompt`: discriminating evidence-parity band (2 scenarios). **Manual live cadence only** (not part of `npm run check`). Discriminating scenarios use guard-only fixture seeds. Dual-bug `debug-app` remains for ceiling/Fix bands.
- `probe-evidence-outcomes-ceiling` / `probe-evidence-transfer-ceiling`: ceiling scenarios (replay CI only).
- `grill`: ask-block Context+Questions (N=1 slim). Alternate frame before crystallized output. Falsifier before leaving a decision node.
- `tdd`: seam confirmation before the first test. Red-green slice discipline.
- `probe-fix`: entry gate — no repro means no hypotheses. Route to Evidence stance or get a repro.
- `probe-fix-outcomes` / `probe-fix-transfer` / `probe-fix-prompt`: discriminating evidence-parity band (2 scenarios: `no-repro-refuse`, `loop-before-cause`). **Manual live cadence only** — `npm run agent:test:probe-fix-evidence-parity` (not part of `npm run check`). Independent of Evidence parity.
- `probe-fix-outcomes-ceiling`: ceiling scenario (tight loop — replay CI only).
- `domain-model`: entry gate — no stated decision means no ADR. Route to grill.
- `handoff`: `channel:prompt` (user) vs `channel:artifact` (model-invoked). `Pack:` pointers/fix-loop/full — omit empty sections.
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

Live outcome band for `probe-evidence-outcomes` and `probe-fix-outcomes`. Requires `CURSOR_API_KEY`.

```bash
npm run agent:test:transfer
```

Live transfer band via native compare: `agent-test --compare-pairs probe-evidence-outcomes:probe-evidence-transfer` (or the full automated cadence):

```bash
npm run agent:test:evidence-parity
```

Probe Evidence discriminating band. See [docs/evidence-parity.md](../docs/evidence-parity.md).

```bash
npm run agent:test:probe-fix-evidence-parity
```

Probe Fix discriminating band (outcomes vs transfer + prompt baseline). Manual cadence only — not wired to CI. Alias: `agent:test:diagnose-evidence-parity`.

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

| Do                                                                  | Avoid                                                                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run agent:test:live:debug`                                     | `tee agent-test-live.log` in repo root (shows up in `git status`)                                                                    |
| `--debug-dir "$TMPDIR/agent-test-debug"` when you need a fixed path | `--debug-dir ./agent-test-debug` inside the repo (clutters `git status` — pre-0.1.18 caused false `worktree_leak` on first scenario) |

Live runs already use **git worktree isolation** for agent edits (`$TMPDIR/agent-harness-wt-…`). The worktree leak guard watches your **caller checkout** (where you ran npm). Harness staging under `--debug-dir` is excluded from that check as of `@post-print/agent-test` 0.1.18. Prefer `$TMPDIR` anyway.

`skip: true` skips a scenario in **both** replay and live. Use it only for suites that must never run in CI (for example `github-ambient-refs` network dogfood). Outcome and ablation scenarios must not set `skip` if you want `npm run agent:test:outcomes` / `agent:test:ablations` to invoke the agent.
