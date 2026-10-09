# Toolbox agent suites

<!-- source-of-truth: current SDK execution, claim mapping and evaluation boundaries -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-09 -->

Current tests are TypeScript SDK suites under v2/. claims.json files preserve original declarative claims and fixture-reader compatibility; they are not executed by a legacy SDK runtime. migration-index.json maps every historical scenario to its current assertion, selected judge inputs and normalized output.

`i-need-help` is available through normal global skill installation and automatic routing. Skill invocation is a portable agent instruction, not an enforced host watchdog; install and live behavior still depend on each agent honoring its loaded skill.

Run npm run agent:test for offline discovery/input validation. Live runs use the Claude Code CLI on Haiku (`claude-haiku-5-5`) for agent and judge, with Claude subscription auth and no API-key billing fallback. npm run agent:test:comparisons repeats representative paired tests three times; aggregate normalized evidence with scripts/lib/evidence-v2.mjs. Selected output, tool calls and source excerpts go to a fresh judge; missing evidence fails rather than becoming a pass. Global skills are disabled. Infrastructure and judge failures remain distinct from task failures.

The two previously skipped remote-fetch scenarios remain recorded as skipped. Native goal recovery, host-isolation guarantees, publication receipts and PostPrint live persistence require separate live qualification. SDK history reconstruction does not prove native continuation.
