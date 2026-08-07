# Skill evolution (AFTER-lite)

**Source of truth for** human-gated skill patches after agent-suite failures.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Toolbox skills are static human SSOT — they do not self-mutate from transcripts. This doc defines the **human-gated** loop for turning live eval failures into durable skill improvements.

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

   Optional LLM patch draft: in a fresh chat, attach the filled note plus `transcript.md` from the debug bundle; ask for suggested `SKILL.md` / `research-basis.md` diffs into `_agent/` only — never auto-merge.

3. **Draft patch** — minimal change to `SKILL.md` and/or `references/research-basis.md`:
   - Sharpen a completion criterion if the agent **prematurely completed**
   - Add a carve-out under **Does not transfer** if the failure falsifies an overclaim
   - Lower **Confidence** if evidence is mixed
4. **Authoring gate** — apply skill-authoring vocabulary (e.g. [mattpocock/skills](https://github.com/mattpocock/skills) `writing-for-agents` / `writing-great-skills`): prune no-ops, positive steering, progressive disclosure.
5. **Lock** — add or update a **contract** scenario + replay fixture in `agent-suites/<skill>/`. Outcome scenarios use stub `replayTrace` for replay CI only (no `skip` — that disables live too).
6. **Optional vitest lock** — add a string invariant in `tests/skills.test.js` only when the new rule is stable prose that regressions should catch globally.
7. **Record** — copy [`templates/skill-evolution-note.md`](../templates/skill-evolution-note.md) into `_agent/` or the PR description; bump `last-reviewed` on touched research-basis files.

## What not to do

- Auto-apply skill patches from agent transcripts without human review
- Treat a single live judge pass as proof of transfer
- Paste failure transcripts into `SKILL.md` (sediment)

## Related

- [Agent suites](../agent-suites/README.md) — Contract vs Outcome bands
- [Evidence parity](evidence-parity.md) — skill-on vs skill-off cadence and compare reports
- [Skill organization ablations](skill-organization-ablations.md) — compare dispatch arms before reorganizing skills
