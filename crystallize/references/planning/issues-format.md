<!-- skeleton: generated-reference
source: .skeleton/references/planning/issues-format.md
redundancy: intentional
-->

# Linear Issues Output Format

Break a plan or PRD into independently grabbable Linear issues. Each issue is a vertical slice — independently testable and executable without waiting for other issues (except explicit blockers).

## Vertical Slice Principle

Every issue must be a **tracer bullet**: the thinnest end-to-end slice that solves one specific case, touching all layers required (API + query + UI, or backend + frontend, etc.).

**Horizontal slicing is wrong:**
- ❌ "Build the API layer for scoring"
- ❌ "Build all UI components for scoring"
- ❌ "Write all tests for scoring"

**Vertical slicing is right:**
- ✅ "Display score badge on source card — API endpoint + query + badge component"
- ✅ "Score sorting in source list — sort param + query update + list UI"

Each slice should have a clear, user-observable pass/fail: either the thing works end-to-end or it doesn't.

## Blocking Relationships

Identify which issues must complete before others can start. Unblocked issues can be picked up in parallel immediately.

Draw the blocking graph before creating issues:
```
[Issue A] ──blocks──► [Issue B]
[Issue A] ──blocks──► [Issue C]
[Issue B] ──blocks──► [Issue D]
[Issue C] ──────────► (unblocked)
```

Issues B and C can start after A. D waits on B. C is parallel to B.

## Linear MCP Usage

Use the `save_issue` tool. Required fields: `title`, `team`.

```
save_issue(
  title: "Display score badge on source card",
  team: <team_id>,
  description: "<acceptance criteria and implementation notes>",
  blockedBy: [<issue_id_A>]   # only when this issue depends on another
)
```

**Order of creation:** Create unblocked issues first (they have no `blockedBy`). Then create blocked issues, referencing the IDs from the first batch.

## Issue Description Template

Each issue description should include:

```
## What
[One sentence: what this issue delivers, end-to-end]

## Acceptance criteria
- [ ] [Testable criterion]
- [ ] [Testable criterion]

## Implementation notes
[Optional: key files, approach hints, constraints — keep brief]
```

## Process

1. **Locate input** — Read the plan/PRD from path, URL, or search `docs/prds/`.
2. **Explore codebase** — Use **multi** or explore subagents for domains the feature touches. Understand existing structure so slices match real boundaries.
3. **Draft slices** — Break into thinnest vertical slices. Aim for 3–8 issues for a typical feature.
4. **Establish blocking graph** — Which slices depend on others? An issue blocks another only when the second cannot be started at all without the first.
5. **Create unblocked issues first** — Record their IDs.
6. **Create blocked issues** — Set `blockedBy` using recorded IDs.
7. **Output** — List created issue IDs/links with the blocking graph summarized.

**After creation:** hand off to **project-tracking** (`start` mode) for branch, draft PR, and Closes linking when someone picks up an issue.

## Output Summary Format

```
## Issues created

| Issue | ID | Blocked by |
|---|---|---|
| Display score badge on source card | POS-120 | — |
| Score sorting in source list | POS-121 | POS-120 |
| Score filter in source list | POS-122 | POS-120 |
| Score analytics endpoint | POS-123 | POS-121, POS-122 |

Blocking graph: POS-120 → POS-121, POS-122 → POS-123
Immediately startable: POS-120
```

## Common Mistakes

- **Slices that are too large**: if an issue takes more than 2–3 days, split it
- **Slices that are too small**: infrastructure-only issues (just the DB schema) are horizontal slices — combine with the first feature that uses the schema
- **Missing acceptance criteria**: without them, "done" is undefined and the issue can't be closed confidently
- **Blocking everything on one setup issue**: if only one person can work at a time, the slices aren't independent enough
