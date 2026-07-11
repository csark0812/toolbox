# Shared: Base Branch and Diff

Used by Describe and Review workflows.

## Base branch

- From user message (e.g. "Base branch: development") or `main`
- If PR exists on current branch: `gh pr view --json baseRefName -q .baseRefName`

## Diff commands

Always run before Describe or Review:

```bash
git fetch origin <base>
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

## Prerequisites

- `gh` required when applying body to PR (`gh pr edit`); not needed for review-only or file output
