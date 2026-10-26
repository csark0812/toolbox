<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

<!-- source-of-truth: bare consumers that want toolbox glossary / ADR path baselines. -->

**Setup** (only when the project has **no** domain-artifact remap):

1. Re-home `templates/domain-model-soft-default/` in a consumer-local skill or in project docs (for example `docs/domain-model-soft-default/`)
2. Copy this file beside it as the binder (the skill's `SKILL.md` body, or `docs/soft-default-domain-model.md`)
3. Point `AGENTS.md` at the binder so agents load it with domain-model work

Remapping consumers must **not** include this file. Soft-default recipes are **not** shipped inside portable skill trees.

## Soft-default domain-model remap

| Skill cites                                  | Soft-default recipe                            |
| -------------------------------------------- | ---------------------------------------------- |
| `references/domain-model/glossary-format.md` | `domain-model-soft-default/glossary-format.md` |
| `references/domain-model/adr-format.md`      | `domain-model-soft-default/adr-format.md`      |

## Default paths

| Artifact | Default            |
| -------- | ------------------ |
| Glossary | `docs/glossary.md` |
| ADRs     | `docs/adr/`        |

Override in the binder or `AGENTS.md` when the project uses different paths.
