# Parallel Broad Investigate

**Availability:** This parallel recipe requires `council` to be installed and attached. Without it, inspect the independent areas serially and return the normal `probe` evidence and verdict shape.

Wide fish when the user explicitly asks for a broad pass. Uses [`council`](https://raw.githubusercontent.com/csark0812/toolbox/main/council/SKILL.md) kernel — [non-negotiables](https://raw.githubusercontent.com/csark0812/toolbox/main/council/SKILL.md#non-negotiables), [task-prompt.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/task-prompt.md), [member-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/member-schema.md).

Profile: `repo`.

Default **probe** Evidence stays single-target. Use this recipe only on explicit user request.

## When to use

- User says "fish broadly", "check the whole subsystem", or names multiple areas without a single file target
- Hunch spans wiring across client + backend + shared packages

## When to skip

- Specific file, hook, or endpoint named — standard **probe** Evidence protocol
- Plan evidence pass — **council** (large-artifact gather)
- Code review — **code-review**

## Members (2–3)

Split by subsystem:

| Slice                        | Subagent                      | Tier |
| ---------------------------- | ----------------------------- | ---- |
| Area A (for example client)  | `explore` or `generalPurpose` | Fast |
| Area B (for example backend) | `explore` or `generalPurpose` | Fast |
| Shared / integration         | `explore`                     | Fast |

Optional: score council agents on known paths. Prefer `correctness` for mutation/cache paths if `contexts` includes `repo`. Path matching → [agent-discovery.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/agent-discovery.md).

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

Synthesis plan: merge evidence. Verdict per investigate schema (plain-language settlement)
```

## Synthesis

1. Merge findings with file:line citations.
2. Write **probe** verdict — plain-language settlement with evidence from all members.
3. If member conclusions conflict, state both. Escalate or narrow the target.
4. Output follows **probe** skill final shape. Use [council output-format.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/output-format.md) sections only as supporting detail.

## Handoff

- Hunch closed or narrow → close or single-target **probe**
- Reproducible bug → hub **diagnose** / **tdd** when installed. Else consumer **testing** / **debug** or `AGENTS.md`
- Reproducible bug needing session logs (NDJSON, compose mount) → hub **diagnose** when installed. Else consumer **debug** or `AGENTS.md`
- User explicitly asks to fix after the verdict → exit investigate find-only. Follow that request or the named consumer skill
