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
4. **Authoring gate** — apply skill-authoring vocabulary (for example [mattpocock/skills](https://github.com/mattpocock/skills) `writing-for-agents` / `writing-great-skills`): prune no-ops, positive steering, progressive disclosure. Also apply **Pragmatic STE for toolbox** (below).
5. **Lock** — add or update a **contract** scenario in `agent-suites/<skill>/`. Validate suite shape and run direct scenarios when live evidence is needed.
6. **Optional vitest lock** — add a string invariant in `tests/skills.test.js` only when the new rule is stable prose that regressions must catch globally.
7. **Record** — copy [`templates/skill-evolution-note.md`](../templates/skill-evolution-note.md) into `_agent/` or the PR description. Then bump `last-reviewed` on touched research-basis files.

### Pragmatic STE for toolbox

Write skill bodies, references, hub docs, and ambient refs in **pragmatic** Simplified Technical English (structural rules). Keep toolbox domain nouns (`Slice`, `Artifact`, `spawn`, `verdict`, skill names, paths, commands). Full catalog: user-level `/simple-english` skill (ASD-STE100 aid). This house note is not official STE compliance.

**House picks (one word, one meaning):**

| Concept           | Use                                                                     |
| ----------------- | ----------------------------------------------------------------------- |
| Verification      | `make sure that` (not ensure / verify / confirm / check-as-verb)        |
| CLI / npm actions | `run` as technical verb                                                 |
| Modals            | `can` / `will` / `must` only (not should / would / may / might / could) |
| Compound steps    | vertical lists (one instruction per sentence)                           |

**Structural rules (minimum):**

- Procedural sentences: max 20 words. Descriptive sentences: max 25 words.
- No contractions. No semicolons as clause joiners.
- Put conditions before commands: `If X, do Y.`
- Untouchables: code fences, identifiers, CLI flags, paths, quoted errors.

**User-facing output contracts:** Named blocks that face the human (ask Questions, verdicts, pass progress, review findings, cast summaries, human-facing handoff packs) must **require** pragmatic STE. Examples in those files must show it. Ambient baseline: [`references/output-schema.md`](../references/output-schema.md). Mid-turn free chat outside those blocks is not required to be STE. Coordinator-internal and blind-member envelopes stay schema-dense unless labeled user-facing.

**Self-check before merge:**

1. Count words in the three longest sentences. Split any over the 20/25 limit.
2. Search for contractions, `has been` / `have been`, `should`, `-ing` verbs after a comma, and semicolons.
3. Search for every `if` and `when`. Each one must stand at the start of its sentence before the command.
4. Search for ensure / verify / confirm / check-as-verb. Replace each hit with `make sure that` (or restructure).
5. If you edit a user-facing output contract, make sure that the file requires pragmatic STE and that examples obey it.

## What not to do

- Auto-apply skill patches from agent transcripts without human review
- Treat a single live judge pass as proof of transfer
- Paste failure transcripts into `SKILL.md` (sediment)

## Related

- [Agent suites](../agent-suites/README.md) — Contract vs Outcome bands
- [Evidence parity](evidence-parity.md) — skill-on vs skill-off cadence and compare reports
- [Skill organization ablations](skill-organization-ablations.md) — compare dispatch arms before reorganizing skills
