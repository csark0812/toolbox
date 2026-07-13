# CreatePlan Output Format

**Portable soft-default (consumer remaps apply):** Toolbox ships Linear / `docs/prds/` baselines. **If the consumer remaps this path** via customize (`shared-agent-references` / docs), **load the consumer SSOT instead** — do not treat `docs/prds/` or path examples below as authoritative for that consumer.

Use the `CreatePlan` tool to generate the plan artifact. Fill the template below, then run the self-check before submitting.

## Template

```
# [Task Name]

## What this is
[Feature | Refactor | Cleanup | Bug fix | Architecture] — one sentence describing the goal

## Scope
In: [bullet list of what's included]
Out: [bullet list of what's explicitly excluded — even if obvious]

## Phases

### Phase 1: [Name]
- [ ] [Specific action] — [file or directory path]
- [ ] [Specific action] — [file or directory path]

### Phase 2: [Name — blocked by Phase 1]
- [ ] [Specific action] — [file or directory path]

## Blast radius
- [What shared code this touches and how it's accounted for in the plan]
- [Or: "Contained — only affects [specific area]"]

## Risks & unknowns
- [Risk]: [mitigation or "flag for investigation during Phase N"]
- [Unknown]: [what needs to be confirmed before/during implementation]
- [Or: "None identified"]

## Verification
- [How to confirm each phase is complete]
- [Specific test cases or behaviors to verify]
```

## Self-Check

Run through this before submitting the plan. Fix anything that fails.

**Todos:**
- [ ] Every todo cites a specific file path or directory — not just "implement X"
- [ ] No todo is vague enough that two different implementations would satisfy it
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
- [ ] If risks section is empty, that is an intentional statement — confirm it's correct

## Notes

- Plans with 8+ todos should be split into phases with clear handoffs
- A todo that requires resolving an unknown before it can be executed should be sequenced after a "confirm/investigate" todo
- `CreatePlan` name should be short and slug-style: `add-source-scoring`, not "Plan to Add Scoring to the Source System"
