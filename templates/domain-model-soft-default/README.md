# Domain-model soft-default pack

**Opt-in soft-default recipe:** Glossary + ADR path defaults for consumers with **no** domain-artifact remap.

Consumers that remap via customize (`shared-agent-references` / project docs) must **not** use this pack. Open the consumer SSOT instead.

## Setup

1. Copy `templates/domain-model-soft-default/` → `.skeleton/customize/domain-model-soft-default/`
2. Copy `templates/soft-default-domain-model.md` → `.skeleton/customize/soft-default-domain-model.md`
3. Add `soft-default-domain-model.md` to `customize.alwaysInclude` in `.skeleton/config.yaml`

## Default paths (override in customize stub)

| Artifact | Default path       |
| -------- | ------------------ |
| Glossary | `docs/glossary.md` |
| ADRs     | `docs/adr/`        |

## Files

| File                                     | Purpose                 |
| ---------------------------------------- | ----------------------- |
| [glossary-format.md](glossary-format.md) | Glossary row shape      |
| [adr-format.md](adr-format.md)           | MADR-style ADR template |

Canonical copies also live under [`.skeleton/references/domain-model/`](../../.skeleton/references/domain-model/). Skills link via GitHub raw URLs.
