# Slice adapters (v1)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

v1 supports **code slice** and **plan section** only. Other artifact types → extend this file in a follow-up; do not force-fit.

## Code adapter

**When:** bounded implementation area — module, invariant class, symbol neighborhood.

**Coordinator expands:**

- Primary paths (files the slice owns)
- Related reads (callers, tests, config touched by invariant)
- Entrypoints / public symbols

**Matrix rows (minimum):** derive from [`code-review` fix-loop-ledger § Invariant matrix](../../code-review/references/fix-loop-ledger.md#invariant-matrix) — only rows applicable to the slice. High-dimensional contracts → use contract-class catalog when thrash applies.

**Blind pack:** file contents (or excerpts within host limits), test files, relevant types — no diff narrative, no PR context unless user scoped the slice to a diff hunk (then prefer **code-review**).

## Plan-section adapter

**When:** bounded written slice — PRD section, plan §, issue subset — during or after drafting; not the full artifact.

**Coordinator expands:**

- Section ids / headings
- Linked premises or decisions in adjacent sections (read-only context for coordinator; blind pack = target sections only unless user included neighbors in envelope)

**Matrix rows:** scope / gaps / sequencing — same three-axis overlay as **second-opinion** completeness attacker ([verify.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/verify.md) stub points at consumer SSOT). Do not invent a fourth axis set in this skill.

**Blind pack:** cited plan sections only — not full-repo sweeps.

## Routing overlap

| Ask                          | Skill                              |
| ---------------------------- | ---------------------------------- |
| Full plan pre-build critique | **second-opinion**                 |
| Plan § until cohesive        | **iterate** (plan-section adapter) |
| PR / branch diff merge-ready | **code-review**                    |

See [routing.md](routing.md).
