# CreatePlan Output Format

**Opt-in soft-default recipe:** Full Linear / `docs/prds/` baseline for consumers with **no** planning remap. Consumers that remap via customize (`shared-agent-references` / docs) must **not** use this file. Open the consumer planning SSOT instead.

Use the `CreatePlan` tool to generate the plan artifact. Fill the template below. Then run the Self-Check before submitting.

## Template

```
# [Task Name]

## What this is
[Feature | Refactor | Cleanup | Bug fix | Architecture] — one sentence describing the goal

## Scope
In: [bullet list of what is included]
Out: [bullet list of what is explicitly excluded — even if obvious]

## Phases

### Phase 1: [Name]
- [ ] [Specific action] — [file or directory path]
- [ ] [Specific action] — [file or directory path]

### Phase 2: [Name — blocked by Phase 1]
- [ ] [Specific action] — [file or directory path]

## Blast radius
- [What shared code this touches and how it is accounted for in the plan]
- [Or: "Contained — only affects [specific area]"]

## Risks & unknowns
- [Risk]: [mitigation or "flag for investigation during Phase N"]
- [Unknown]: [what needs to be confirmed before/during implementation]
- [Or: "None identified"]

## Verification
- [How to make sure that each phase is complete]
- [Specific test cases or behaviors to observe]
```

## Self-Check

Run through this before submitting the plan. Fix anything that fails.

**Todos:**

- [ ] Every todo cites a specific file path or directory — not just "implement X"
- [ ] No todo is so vague that two different implementations both count as done
- [ ] Phase ordering respects dependencies (blocked tasks come later, stated as "blocked by Phase N")
- [ ] Each phase has a clear completion criterion

**Scope:**

- [ ] "Out" section exists and names at least one thing, even if obvious
- [ ] Acceptance criteria or success condition is stated somewhere

**Blast radius:**

- [ ] Shared packages or infra touched by the plan are named
- [ ] If shared packages are touched, consuming apps are mentioned
- [ ] If backend API changes, frontend client regeneration is noted

**Risks:**

- [ ] If there are unknowns (root cause not confirmed, external dependency not ready), they are listed
- [ ] If risks section is empty, that is an intentional statement — make sure that it is correct

## Notes

- Plans with 8+ todos must be split into phases with clear handoffs
- A todo that requires resolving an unknown before it can be executed must be sequenced after a "make sure / investigate" todo
- `CreatePlan` name must be short and slug-style: `add-source-scoring`, not "Plan to Add Scoring to the Source System"
