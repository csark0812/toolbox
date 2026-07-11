# Shared: Base Branch and Diff

Used by code-review PR/merge modes. PR body generation is a consumer-local skill (when present).

## Base branch

- From user message (e.g. "Base branch: development") or consumer default (when present)
- If PR exists on current branch: `gh pr view --json baseRefName -q .baseRefName`

## Diff commands

Always run before review:

```bash
git fetch origin <base>
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

## Prerequisites

- `gh` optional for review-only; required when applying PR body in consumer-local pull-request skill
