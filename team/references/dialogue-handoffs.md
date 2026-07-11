# Dialogue handoffs

Canonical in-session routing for **crystallize** and **grill** — not a standalone skill. Cold-start routing lives in [README.md](../README.md); exit blocks in mode protocols are user-facing deliverables that mirror this table.

## Which skill

| Need | Skill |
|------|-------|
| Fuzzy idea, no plan yet | **crystallize** |
| Fuzzy or overloaded domain term | **domain-modeling** → [docs/domain/glossary.md](../../../docs/domain/glossary.md) |
| Pressure-test design before build | **grill** |
| Still fuzzy after starting grill | **crystallize** |
| Written plan on disk | **second-opinion** |
| One concrete code doubt | **investigate** |
| Reproducible broken behavior | **investigate** + **testing** (+ **debug** if session logs / layer unclear) |
| Scope/thesis scoring | **product-principles** → [product hub (decision framework)](../../../docs/product/README.md) |
| Serialize to plan / PRD / issues | **crystallize** or **grill** → [planning/build.md](planning/build.md) |
| Fresh read of written plan | **second-opinion** (fresh read) |
| Plan rejected or needs pressure-test after review | **grill** (or **crystallize** if intent regressed) |
| Completeness verify on plan/PRD | **second-opinion** (verify) → [planning/verify.md](planning/verify.md) |

Structural and product ambient checks during dialogue → [dialogue-contract.md](dialogue-contract.md).

Mid-task and implement routing → [agent-routing.md](agent-routing.md).

## Execution planning exit

When dialogue has produced enough clarity to serialize work (CreatePlan, PRD under `docs/prds/`, Linear issues), follow [planning/build.md](planning/build.md) and templates in [planning/](planning/) as needed.

**Continuing from grill:** skip re-asking points already settled in dialogue ([planning/build.md](planning/build.md), Step 4).
