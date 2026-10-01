# Skill evolution (AFTER-lite)

<!-- source-of-truth: human-gated skill patches after agent-suite failures. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-03 -->

Toolbox skills are static human SSOT. They do not self-mutate from transcripts. This doc defines the **human-gated** loop for turning live eval failures into durable skill improvements.

## When to use

- A **contract** or **outcome** scenario fails on `agent:test:live` / `agent:test:live:debug` / `agent:test:outcomes`
- You want to attach a failure to a specific claim in `references/research-basis.md`
- You are deciding whether to patch `SKILL.md`, add a contract scenario, or both

## Loop

1. **Reproduce** — run the failing suite with debug:
   ```bash
   npm run agent:test:live:debug -- --suite <suite> --scenario "<name>"
   ```
   Outcome band only:
   ```bash
   npm run agent:test:outcomes
   ```
   Full evidence cadence (compare + propose):
   ```bash
   npm run agent:test:evidence-parity
   ```
2. **Triage** — open the failure bundle under `$TMPDIR/agent-spec/sessions/<id>/` (or `--debug-dir`). Note which rubric clause failed (`must`, `mustNot`, `judge`) and which research-basis claim it maps to.

   Autofill a draft note (does not edit skills):

   ```bash
   node scripts/propose-skill-evolution.mjs /path/to/<scenario>.debug
   ```

   Writes `_agent/skill-evolution/<timestamp>-<suite>-<scenario>.md`. Human **Keep / Reject / Defer** before any `SKILL.md` edit.

   Optional LLM patch draft: in a fresh chat, attach the filled note plus `transcript.md` from the debug bundle. Ask for suggested `SKILL.md` / `research-basis.md` diffs into `_agent/` only. Never auto-merge.

3. **Draft patch** — minimal change to `SKILL.md` and/or `references/research-basis.md`:
   - Sharpen a completion criterion if the agent **prematurely completed**
   - Add a carve-out under **Does not transfer** if the failure falsifies an overclaim
   - Lower **Confidence** if evidence is mixed
4. **Authoring gate** — apply skill-authoring vocabulary (for example [mattpocock/skills](https://github.com/mattpocock/skills) `writing-for-agents` / `writing-great-skills`): prune no-ops, positive steering, progressive disclosure. Apply the public writing contract below.
5. **Lock** — add or update a **contract** scenario in `agent-suites/<skill>/`. Validate suite shape and run direct scenarios when live evidence is needed.
6. **Optional vitest lock** — add a string invariant in `tests/skills.test.js` only when the new rule is stable prose that regressions must catch globally.
7. **Record** — copy [`templates/skill-evolution-note.md`](../templates/skill-evolution-note.md) into `_agent/` or the PR description. Then bump `last-reviewed` on touched research-basis files.

### Public writing and evaluation

Use the [versioned writing contract](../references/v2/output-schema.md): preserve facts, uncertainty, technical terms and reader purpose. Constrained English is an explicit strict-english mode, not the default authoring gate. Evaluate observable decisions, public behavior and evidence instead of sentence length or modal presence.

Current suites use the TypeScript SDK and normalized evidence v1. Inspect agent-suites/migration-index.json for each claim's assertion, selected judge inputs, metric and parser. Historical legacy debug/compare readers remain for old evidence only; new execution uses agent:test:live and agent:test:comparisons. Proposals remain human-reviewed and no automatic skill patch or external backlog write follows an evaluation.

## What not to do

- Auto-apply skill patches from agent transcripts without human review
- Treat a single live judge pass as proof of transfer
- Paste failure transcripts into `SKILL.md` (sediment)

## Related

- [Agent suites](../agent-suites/README.md) — Contract vs Outcome bands
- [Evidence parity](evidence-parity.md) — skill-on vs skill-off cadence and compare reports
- [Skill organization ablations](skill-organization-ablations.md) — compare dispatch arms before reorganizing skills
