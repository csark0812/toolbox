# Shared: Base Branch and Diff

Used by code-review PR/merge modes. PR body generation is a separate authoring skill.

## Base branch

- From user message (e.g. "Base branch: development")
- If PR exists on current branch: `gh pr view --json baseRefName -q .baseRefName`

## Diff commands

Always run before review:

```bash
git fetch origin <base>
git diff origin/<base>...HEAD
```

For merge review: `git diff <base>...HEAD` on the integration branch.

## gh

- `gh` optional for review-only; required when applying PR body via authoring skill
