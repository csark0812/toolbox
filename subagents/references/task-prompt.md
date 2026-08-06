# Task Prompt Template

Each member Task `prompt` is composed by the coordinator — subagents do not receive the full user thread or the `subagents` skill.

Review overlays → host recipe member templates (e.g. code-review task-prompt-review).

**Model is not part of the prompt body.** Resolve `model` on the Task/Subagent call per [subagents Model assignment](../SKILL.md#model-assignment): plan `model=inherit-auto` → omit the tool `model` argument; plan `model=<slug>` → pass that slug only when present in the host enum.

## Generic template (job-first)

Open with the job — not a `Member N/N · stance=` salutation. Keep `subagent_type` / stance in the dispatch **plan table**.

**Review / blind exemplar:**

```
Review this slice as a fresh look. Do not treat prior-pass findings or fix stories as given.

Then: your matrix, findings, and whether the slice holds together this pass.

Sub-task: [slice only — not the whole job]

Source:
[file paths / web topic / repo area]

Output: follow [member-schema.md](member-schema.md)

Constraints:
- Do not assume other members' conclusions.
- Return only your perspective; coordinator synthesizes.
```

Other recipe shapes keep job-first leads without requiring this exact review paste.

## Job types

| Job        | Sub-task focus                                     |
| ---------- | -------------------------------------------------- |
| `explore`  | Area, subsystem, or artifact to map                |
| `gather`   | Single source of truth to collect                  |
| `research` | Independent web topic                              |
| `mixed`    | One slice per member; no cross-member dependencies |

Job recipes → host skill references (arrive as project-specific injected context on skill read).

## Perspective diversity

When `N ≥ 2` members share the same `subagent_type`, assign distinct `stance` values from the agent's `dispatch.stances` (or define ad hoc stances). Never use identical `model` + identical prompt for parallel members. Shared Auto inherit (`inherit-auto` / omit tool `model`) is fine when prompts/stances differ — do not pick distinct slugs under an Auto parent just to diversify.

Adversarial kill mandates, context packs, staged debate, and cross-model carve-out → [adversarial.md](adversarial.md).
