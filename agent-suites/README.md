# Agent Suites

Toolbox agent suites are portable conformance checks for public process skills. They prove **portable process contracts**, not consumer product workflows. They use neutral fixture files and run through Cursor or Claude.

Every suite execution launches a real agent and can incur provider usage. JSON is only the suite-authoring format. Offline validation and comparison of existing reports do not launch agents.

## Suite bands

| Band         | Purpose                                                                      | Command                              |
| ------------ | ---------------------------------------------------------------------------- | ------------------------------------ |
| **Contract** | Process gates: did the agent follow the skill protocol?                      | `npm run agent:test`                 |
| **Outcome**  | Task settlement: did the agent reach the right verdict or loop?              | `npm run agent:test:outcomes`        |
| **Transfer** | Same judges as outcome with `skills: none` and hunch-only prompts            | `npm run agent:test:transfer`        |
| **Prompt**   | Verdict-gate rules in the prompt with `skills: none`                         | `npm run agent:test:evidence-parity` |
| **Ablation** | Organization arms: primary versus council, and fit-check versus forced spawn | `npm run agent:test:ablations`       |
| **Ambient**  | Agent fetch of GitHub raw ambient references                                 | `--suite github-ambient-refs`        |

### Authoring outcome scenarios

1. Plant bugs in neutral fixtures — see `agent-suites/fixtures/debug-app/`.
2. Write a prompt with a **held-out hunch** that is absent from the skill contract.
3. Tie `judge` questions to a `research-basis.md` claim (e.g. kill tests before forage, loop before cause).
4. Run the scenario directly with Cursor or Claude. Use `--debug` when you need a retained trace.

**Good judge question:** “The agent cited sessionGuard.ts with a boundary comparator issue and did not invent a fix.”

**Bad judge question:** “The agent was thorough.”

Consumer repos own product integration outcomes (app paths, private docs, `validate:changed` dogfood). Toolbox owns portable process contracts only.

## Ownership Boundary

Toolbox owns generic skill-contract behavior:

- `code-review`: task-shaped mode selection, proof-quality findings, speculation suppression, review-only behavior, and strict current-snapshot merge gating.
- `review-walkthrough`: choose the smallest useful story mode, bind source versions, use proportional evidence, and remain read-only.
- `refactor-companion`: inspect before asking, preserve resolved design decisions, prove coherent slices, protect unrelated work, and sweep old-design residue.
- `council`: create distinct task personas; select a useful interaction; run real members; skip when one pass is enough.
- `second-opinion`: invent lenses from ask; single-pass by default; layer council for multi-perspective depth; claim anchoring; unanchored kills tagged `drift`; path or paste artifact.
- `probe-evidence`: discriminating kill tests; leave dead patches after 2–3 no-signal reads (Evidence stance).
- `probe-evidence-outcomes` / `probe-evidence-transfer` / `probe-evidence-prompt`: discriminating evidence-parity band (2 scenarios). **Manual direct cadence only** (not part of `npm run check`). Discriminating scenarios use guard-only fixture seeds.
- `grill`: repo facts before questions; honest question forms; one active branch; supported recommendations and revisit triggers; alignment before implementation.
- `tdd`: seam confirmation before the first test; red-green slice discipline.
- `probe-fix`: entry gate — no repro means no hypotheses; route to Evidence stance or get a repro.
- `probe-fix-outcomes` / `probe-fix-transfer` / `probe-fix-prompt`: discriminating evidence-parity band (2 scenarios: `no-repro-refuse`, `loop-before-cause`). **Manual direct cadence only** — `npm run agent:test:probe-fix-evidence-parity` (not part of `npm run check`). Independent of Evidence parity.
- `domain-model`: entry gate — no stated decision means no ADR; route to grill.
- `handoff`: `channel:prompt` (user) vs `channel:artifact` (model-invoked); `Pack:` pointers/fix-loop/full — omit empty sections.
- `organization-ablations`: direct SkillJuror-lite arms — see [docs/skill-organization-ablations.md](../docs/skill-organization-ablations.md).
- `github-ambient-refs`: direct dogfood that GitHub raw ambient refs are fetchable at agent runtime. See [docs/github-ambient-refs-validation.md](../docs/github-ambient-refs-validation.md).

After direct-run failures, follow [docs/skill-evolution.md](../docs/skill-evolution.md) for human-gated patches.

Consumer repos own integration dogfood suites for local product paths, rules, validation commands, and private docs. For example, PostPrint scenarios that mention `apps/client/**`, `apps/backend/**`, product auth/session code, council overlays, or PostPrint `validate:changed` stay in `PostPrint/applications`.

## Commands

```bash
npm run agent:test
```

The default host is Cursor. Export `CURSOR_API_KEY` before running. Use `--host claude` with `ANTHROPIC_API_KEY` for Claude. Runs can incur provider usage. The CLI requires Node ≥ 22.

Validate every suite without launching an agent:

```bash
agent-test --validate-only --validate-paths --suites-dir agent-suites
```

```bash
npm run agent:test:outcomes
```

Direct outcome band for `probe-evidence-outcomes` and `probe-fix-outcomes`.

```bash
npm run agent:test:transfer
```

Direct transfer band. Use the full automated comparison cadence for paired reports:

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

Direct organization ablation suite.

```bash
npm run agent:test:debug
```

`--debug` keeps staging traces and writes failure bundles with transcripts. **Default staging parent:** `$TMPDIR/agent-spec/sessions/<id>/…` — outside the repo.

| Do                                                                  | Avoid                                                                                                                               |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `npm run agent:test:debug`                                          | `tee agent-test.log` in repo root (shows up in `git status`)                                                                        |
| `--debug-dir "$TMPDIR/agent-test-debug"` when you need a fixed path | `--debug-dir ./agent-test-debug` inside the repo (clutters `git status`; pre-0.1.18 caused false `worktree_leak` on first scenario) |

Direct runs use **git worktree isolation** for agent edits (`$TMPDIR/agent-harness-wt-…`). The worktree leak guard watches the checkout where you started the command. Prefer `$TMPDIR` for diagnostic output.

Do not add `skip: true` as an offline fallback. It skips direct execution too. Use `--validate-only` for credential-free configuration checks.
