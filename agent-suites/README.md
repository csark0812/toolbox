# Toolbox agent suites

<!-- source-of-truth: current SDK execution, claim mapping and evaluation boundaries -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-09 -->

Current tests are TypeScript SDK suites under v2/. claims.json files preserve original declarative claims and fixture-reader compatibility; they are not executed by a legacy SDK runtime. migration-index.json maps every historical scenario to its current assertion, selected judge inputs and normalized output.

`i-need-help` is available through normal global skill installation and automatic routing. Skill invocation is a portable agent instruction, not an enforced host watchdog; install and live behavior still depend on each agent honoring its loaded skill.

Run npm run agent:test for offline discovery/input validation. Live runs use the Claude Code CLI on Haiku (`claude-haiku-5-5`) for agent and judge, with Claude subscription auth and no API-key billing fallback. npm run agent:test:comparisons repeats representative paired tests three times; aggregate normalized evidence with scripts/lib/evidence-v2.mjs. Selected output, tool calls and source excerpts go to a fresh judge; missing evidence fails rather than becoming a pass. Global skills are disabled. Infrastructure and judge failures remain distinct from task failures.

The two previously skipped remote-fetch scenarios remain recorded as skipped. Native goal recovery, host-isolation guarantees, publication receipts and PostPrint live persistence require separate live qualification. SDK history reconstruction does not prove native continuation.

## UI quality benchmark

`agent-suites/ui-bench/` measures whether `css-craft` and `interface-design` produce better UI, not whether they are followed. It has its own config (`ui-bench.config.ts`), so it does not change claim-suite discovery.

- Ten fixtures under `fixtures/ui-bench/tasks/`: five seeded CSS defects for `css-craft`, five briefs with a settled direction for `interface-design`. All use the shared Ledger design system.
- Each task runs in three arms: `none`, `one-liner` (one sentence asking for well-crafted UI) and `skill` (only the target skill, named explicitly). Every arm gets the same `render_page` MCP tool (`scripts/ui-bench-render-mcp.mjs`), which runs outside the agent's Bash sandbox because that sandbox blocks Chromium.
- After each run the harness renders the page with the same core (`ui-bench/render-core.mjs`) and records hard-check defects, screenshots, tokens, time and render-tool use. Tests fail only when no page exists.
- `scripts/ui-bench-judge.mjs` compares screenshots blind with Opus, in both orders, with identical-pair, known-gap (styles stripped) and re-test controls.
- `scripts/ui-bench-report.mjs` gives each skill a verdict against the one-liner: Better (win rate ≥ 60%, cluster-bootstrap lower bound > 50%, no more defects), Not better (upper bound < 60%) or Inconclusive. No verdict before 4 repeats; a failing judge-health check withholds it.

| Step                                           | Command                      |
| ---------------------------------------------- | ---------------------------- |
| Check the render tool works (6 runs)           | `npm run bench:ui:preflight` |
| Run batches of 2 repeats until decided (max 6) | `npm run bench:ui`           |
| Rate ~15 pairs blind, once                     | `npm run bench:ui:calibrate` |
| Rebuild the report                             | `npm run bench:ui:report`    |
| Hard-check unit tests (needs local Chromium)   | `npm run test:ui-bench`      |

Bench state lives in `.agent-test/ui-bench/<bench-id>/` (`bench.json`, `judgments.json`, `calibration.json`, `report.html`).
