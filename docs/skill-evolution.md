# Skill evolution

<!-- source-of-truth: human-gated skill patches after agent-suite failures. -->
<!-- doc-meta: owner=eng -->

Toolbox skills are static, human-owned sources. They never change themselves from transcripts. This is the loop for turning a live failure into a durable skill change.

## Loop

1. **Reproduce.** Rerun the failing tests by title: `npm run agent:test:live -- "<suite or test title>"`. Open the run in the viewer (`node node_modules/@post-print/agent-test/dist/cli.js viewer --config agent-test.config.ts`) or read `.agent-test/executions/<run>/test-results/<test>/normalized.json`.
2. **Triage.** Separate infrastructure failures (sandbox, workspace guard, judge errors) from task failures. For a task failure, name the rubric clause that failed and the skill sentence it tests.
3. **Draft a patch.** Make the smallest `SKILL.md` change that addresses the failure: sharpen a completion criterion, add a "Not …" boundary, or remove an instruction that had no effect. Follow the [writing contract](../references/v2/output-schema.md).
4. **Lock it.** Add or update a claim in `agent-suites/<skill>/claims.json` and its migration rows. Add a `tests/` invariant only for a stable rule that regressions must catch.
5. **Prove it helps.** Run the [skill bench](skill-bench.md) for the skill. A change that does not beat the previous version is reverted.
6. **Record.** Copy [`templates/skill-evolution-note.md`](../templates/skill-evolution-note.md) into `_agent/` or the PR description.

## Do not

- Apply skill patches from agent transcripts without human review.
- Treat one live judge pass as proof.
- Paste failure transcripts into `SKILL.md`.

## Related

- [Agent suites](../agent-suites/README.md)
- [Evidence parity](evidence-parity.md)
- [Skill organization ablations](skill-organization-ablations.md)
