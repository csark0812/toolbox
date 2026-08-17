# Task prompt template

<!-- doc-meta: owner=eng | last-reviewed=2026-08-16 -->

Each member Task `prompt` is composed by the coordinator. Members do not receive the full user thread or the `council` skill body.

Review overlays → [code-review/references/task-prompt-review.md](../../code-review/references/task-prompt-review.md).

**Model is not part of the prompt body.** Resolve `model` on the Task call per [model-routing.md](model-routing.md): plan `model=inherit-auto` → omit the tool `model` argument.

## Generic template

```
Member [k]/[N] · [job] · perspective=[id]

Sub-task: [slice only — not the whole job]

Source:
[file paths / web topic / repo area]

Output: follow [member-schema.md](member-schema.md) unless the process skill defines member output

Constraints:
- Do not assume other members' conclusions.
- Return only your perspective. The coordinator synthesizes.
```

## Host built-in types

| `subagent_type`       | Use when                                                                      | Avoid when                                       |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| **`explore`**         | Fast repo map — find files, patterns, call sites                              | Single-file critique, sequential debate defender |
| **`generalPurpose`**  | Stance-based review, plan critique, adversarial attacker/defender, tiebreaker | Pure file-tree search (use `explore`)            |
| **`docs-researcher`** | Official docs, API reference, framework version facts on the web              | Repo-only questions                              |
| **`computerUse`**     | GUI/manual test of running app                                                | Headless code review, plan debate                |

Workspace council agents when available → [agent-discovery.md](agent-discovery.md). Prefer scored agent over generic `generalPurpose` when paths/contexts match.

## Perspective diversity

When `N ≥ 2` members share the same `subagent_type`, assign distinct `perspective` / stance values. Never use identical `model` + identical prompt for parallel members. Shared Auto inherit is fine when prompts differ.

Member envelope + token rules → [context-pack.md](context-pack.md). Adversarial kill mandates → [adversarial.md](adversarial.md).
