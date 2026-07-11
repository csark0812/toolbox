---
name: pull-request
description: PR description generation from diff. Use when user asks for PR description, document changes, or write the PR body. For code review, use the `code-review` skill instead.
---

# Pull request

Generate PR descriptions. For code review (review my PR, review the diff, check the code), use the `code-review` skill.

## When to Use

- PR description, body, or "document my changes"
- Prepare PR text from diff (Summary, outward contract, Key Changes)

Not for: code review, council dispatch, fix-loop ([`code-review`](../code-review/SKILL.md)).

## Quick Reference

| Need | Reference |
|------|-----------|
| Base branch, diff commands | [references/shared.md](references/shared.md) |
| Generate PR body (Summary, **outward contract**, implementation, Key Changes, …) | [references/describe.md](references/describe.md) |
| Both: describe + review in one pass | [references/both.md](references/both.md) |

## Intent disambiguation

| Keywords | Workflow |
| -------- | -------- |
| description, body, document, update | Describe (this skill) |
| review, check, analyze, code review | Use `code-review` skill |
| finalize, prepare | Both (describe here + code-review skill) |

## Edge cases

| Condition | Action |
| --------- | ------ |
| No PR for branch (edit requested) | Save to file; instruct to create PR first or paste manually |
| Base branch unclear | Use `main` or ask user |
| `gh` not installed | Output to file only |

## Related

- Branch creation, Closes links, GitHub–Linear tracking → `project-tracking` skill
- Code review → `code-review` skill

## Output format

Follow [references/output-schema.md](../references/output-schema.md).
