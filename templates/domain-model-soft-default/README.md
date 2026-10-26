# Domain-model soft-default pack

**Opt-in soft-default recipe:** Glossary + ADR path defaults for consumers with **no** domain-artifact remap.

Consumers that remap through `AGENTS.md` / project docs or a consumer-local skill must **not** use this pack. Open the consumer SSOT instead.

## Setup

1. Re-home `templates/domain-model-soft-default/` in a consumer-local skill or in project docs (for example `docs/domain-model-soft-default/`)
2. Copy `templates/soft-default-domain-model.md` beside it as the binder
3. Point `AGENTS.md` at the binder so agents load it with domain-model work

## Default paths (override in the binder)

| Artifact | Default path       |
| -------- | ------------------ |
| Glossary | `docs/glossary.md` |
| ADRs     | `docs/adr/`        |

## Files

| File                                     | Purpose                 |
| ---------------------------------------- | ----------------------- |
| [glossary-format.md](glossary-format.md) | Glossary row shape      |
| [adr-format.md](adr-format.md)           | MADR-style ADR template |

Canonical copies also live under [`references/domain-model/`](../../references/domain-model/). Skills link via GitHub raw URLs.
