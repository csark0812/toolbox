<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

<!-- source-of-truth: bare consumers that want toolbox glossary / ADR path baselines. -->

**Setup** (only when the project has **no** domain-artifact remap):

1. Copy `templates/domain-model-soft-default/` → `.skeleton/customize/domain-model-soft-default/`
2. Copy this file → `.skeleton/customize/soft-default-domain-model.md`
3. Add `soft-default-domain-model.md` to `customize.alwaysInclude` in `skeleton.toml`

Remapping consumers must **not** include this file. Soft-default recipes are **not** shipped inside portable skill trees.

## Soft-default domain-model remap

| Skill cites                                  | Soft-default recipe                                                |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `references/domain-model/glossary-format.md` | `.skeleton/customize/domain-model-soft-default/glossary-format.md` |
| `references/domain-model/adr-format.md`      | `.skeleton/customize/domain-model-soft-default/adr-format.md`      |

## Default paths

| Artifact | Default            |
| -------- | ------------------ |
| Glossary | `docs/glossary.md` |
| ADRs     | `docs/adr/`        |

Override in customize stub when the project uses different paths.
