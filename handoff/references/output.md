# Handoff output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-20 -->

Use this minimal shape for a **prompt** or an **artifact**. Omit empty sections.

Write all receiving-agent content in pragmatic STE. Use short sentences, active voice, and one instruction per sentence.

Channel and pack values are producer controls. Do not put them in the receiving prompt or handoff artifact.

## Prompt output

For `channel:prompt`, return one fenced block. Do not write a handoff file.

```text
Open workspace: <absolute path>

Continue this task.

Goal: [one descriptive sentence]
Start with: [one imperative sentence]

## Current state

- [complete sentence]

## Files and links

| Type | Path or URL |
| --- | --- |
| Plan | `.cursor/plans/foo.plan.md` |
| Pull request | https://github.com/.../pull/N |

## Blockers

- [complete sentence]

## Failed attempts

- [path or URL and one sentence about the result]

## Next actions

- [imperative sentence]

## Redacted information

- [one sentence about what was removed]
```

Do not add a header above `Open workspace`. Delete each empty section instead of writing `none`.

## Artifact output

For `channel:artifact`, write the following body to the handoff file. Start the file with `Goal:`.

```markdown
Goal: [one descriptive sentence]
Start with: [one imperative sentence]

## Current state

- [complete sentence]

## Files and links

| Type         | Path or URL                   |
| ------------ | ----------------------------- |
| Plan         | `.cursor/plans/foo.plan.md`   |
| Pull request | https://github.com/.../pull/N |

## Blockers

- [complete sentence]

## Failed attempts

- [path or URL and one sentence about the result]

## Next actions

- [imperative sentence]

## Redacted information

- [one sentence about what was removed]
```

Do not add a header above `Goal:`. Delete each empty section instead of writing `none`.

Do not paste plan bodies, diff hunks, or full review summaries. Link to these artifacts.

## Paste stub (after artifact write)

After the subagent writes the artifact, return this stub:

```text
Open workspace: <absolute path>

Read @_agent/handoffs/<filename>.md and continue.

Goal: <one descriptive sentence>
Start with: <one imperative sentence>
```

Do not paste the artifact body. You can note `prompt-only` outside the receiving block.

## Fix-loop pack shortcut

For a `fix-loop` pack, current state can be one line. Include known pull requests, commits, and review-theme identifiers.
