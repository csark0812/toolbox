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

## Cross-client execution examples

Use the same sections, then change only transport mode.

### Prompt payload (all clients)

```text
Open workspace: /abs/target/workspace

Continue this task.

Goal: implement the next slice
Start with: Fix the auth race in the data layer.

## Current state

- The auth reducer now handles token-refresh callbacks.

## Files and links

| Type | Path or URL |
| --- | --- |
| Plan | .cursor/plans/hand-off.plan.md |

## Blockers

- The CI token fixture is unstable on macOS.

## Next actions

- Run token-refresh matrix with stale-cookie edge cases.

## Redacted information

- API key and internal email addresses were removed.
```

### Cursor continuation

- Use the same block above as the user-visible handoff message.
- Set `Open workspace` to the requested target workspace when it differs from current root.

### Claude Code continuation

- Use the same prompt block as the new conversation seed message.
- Do not include tool-specific control text inside the handoff body.

### Codex continuation

- `prompt` channel: send the block directly for fresh chat handoff.
- `artifact` channel: write the handoff markdown at `<workspace>/_agent/handoffs/<slug>.md` and return the paste stub only.

### Claude API / GPT-style continuation

- Use the same fenced block as the first user/content message for the new thread.
- Keep the body minimal and do not include transport metadata.

### ChatGPT or chat-like UI continuation

- Use the same block above as the opening handoff message.
- Include absolute workspace in `Open workspace`.

### GitHub Copilot Chat continuation

- Use the same prompt block in a fresh chat.
- Never claim IDE action APIs unless directly visible in the request context.

### Generic client fallback

- Keep sections unchanged.
- Send the same prompt block as the initial message in a new chat.
