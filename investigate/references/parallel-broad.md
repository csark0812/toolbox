# Parallel Broad Investigate

Wide fish when the user explicitly asks for a broad pass. Uses via subagents for spawn — non-negotiables, member prompts, member schema (load the subagents skill).

Profile: `repo`.

Default **investigate** stays single-target — use this recipe only on explicit user request.

## When to use

- User says "fish broadly", "check the whole subsystem", or names multiple areas without a single file target
- Hunch spans wiring across client + backend + shared packages

## When to skip

- Specific file, hook, or endpoint named — standard **investigate** protocol
- Plan evidence pass — [parallel-plan-evidence.md](../../second-opinion/references/parallel-plan-evidence.md)
- Code review — **code-review**

## Members (2–3)

Split by subsystem:

| Slice                 | Subagent                      | Tier |
| --------------------- | ----------------------------- | ---- |
| Area A (e.g. client)  | `explore` or `generalPurpose` | Fast |
| Area B (e.g. backend) | `explore` or `generalPurpose` | Fast |
| Shared / integration  | `explore`                     | Fast |

Optional: score council agents on known paths — prefer `correctness` for mutation/cache paths if `contexts` includes `repo`. Path matching → via subagents (agent-discovery).

## Dispatch plan template

```markdown
Task: Broad investigate — [user-stated hunch]
Classification: explore
Source of truth: repo
Goal: coverage
Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]

Selected members:

- explore · tier=Fast · model=[inherit-auto | slug] · stance=n/a: [client slice — hypothesis to test]
- explore · tier=Fast · model=[inherit-auto | slug] · stance=n/a: [backend slice]

Synthesis plan: merge evidence; verdict per investigate schema (plain-language settlement)
```

## Synthesis

1. Merge findings with file:line citations.
2. Write **investigate** verdict — plain-language settlement with evidence from all members.
3. Conflicting member conclusions → state both; escalate or narrow target.
4. Output follows **investigate** skill final shape; use via subagents (output-format) sections only as supporting detail.

## Handoff

- Hunch closed or narrow → close or single-target **investigate**
- Reproducible bug → hub **diagnose** / **tdd** when installed; else consumer **testing** / **debug** or `AGENTS.md`
- Reproducible bug needing session logs (NDJSON, compose mount) → hub **diagnose** when installed; else consumer **debug** or `AGENTS.md`
- User explicitly asks to fix after the verdict → exit investigate find-only; follow that request or the named consumer skill
