# Subagent type selection

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Which host **`subagent_type`** to pass on Task/Subagent calls. Pair with [task-splitting.md](task-splitting.md) for slice size and [model-routing.md](model-routing.md) for cost.

## Decision order

1. Does an **entry skill** mandate a type or council agent? → follow it.
2. Is the slice **repo-local** or **web/docs**? → table below.
3. Is **breadth** (map) or **depth** (one hypothesis) the bottleneck? → `explore` vs `generalPurpose`.
4. Default **`generalPurpose`** only when no cheaper specialized type fits.

## Host built-ins

| `subagent_type`       | Use when                                                                                         | Avoid when                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| **`explore`**         | Fast repo map — find files, patterns, call sites; medium breadth; no deep fix loop               | Single-file review, sequential debate wave, user already named exact paths |
| **`generalPurpose`**  | Stance-based review, plan critique, blind review pass, adversarial attacker/defender, tiebreaker | Pure file-tree search (use `explore`)                                      |
| **`docs-researcher`** | Official docs, API reference, framework version facts on the web                                 | Repo-only questions                                                        |
| **`computerUse`**     | GUI/manual test of running app                                                                   | Headless code review, plan debate                                          |

## Entry-skill overrides

| Skill                      | Typical type                                        | Notes                                               |
| -------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| **iterative-review**       | `generalPurpose` · `stance=blind`                   | One member; slice materials only                    |
| **second-opinion**         | `generalPurpose` · premises / completeness / defend | Staged debate; see [adversarial.md](adversarial.md) |
| **code-review** (council)  | council agents or `explore` / `generalPurpose`      | [agent-discovery.md](agent-discovery.md)            |
| **investigate** (parallel) | `explore`, `docs-researcher`, `generalPurpose`      | Per parallel-*.md recipe                            |

## Council agents (consumer)

When `.claude/agents/*.md` (or equivalent) exist and match cited paths/contexts → prefer scored council agent over generic `generalPurpose`. Discovery → [agent-discovery.md](agent-discovery.md).

## Cost pairing

Specialized types do **not** justify premium models by themselves. Under Auto parent: **`inherit-auto`** for all members unless [model-routing.md](model-routing.md) records explicit escalation.

## Anti-patterns

- **`generalPurpose` for every member** — wastes tokens duplicating full-repo context; split with `explore` + coordinator synthesis.
- **`explore` for adversarial kill mandates** — use stanced `generalPurpose` or council lens.
- **Distinct premium models per member “for diversity”** — diversify stances and prompts; share Auto inherit.
