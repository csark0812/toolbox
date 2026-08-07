# Slice adapters (v1)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

v1 supports **code slice** and **plan section** only. For other artifact types, extend this file in a follow-up. Do not force-fit.

## Code adapter

**When:** bounded implementation area — module, invariant class, symbol neighborhood.

**Coordinator expands:**

- Primary paths (files the slice owns)
- Related reads (callers, tests, config touched by invariant)
- Entrypoints / public symbols

**Matrix rows (minimum):** derive from [fix-loop-ledger § Invariant matrix](fix-loop-ledger.md#invariant-matrix). Use only rows that apply to the slice.

**Blind pack:** file contents (or excerpts within host limits), test files, relevant types. Do not include diff narrative or PR context unless the user scoped the slice to a diff hunk. In that case prefer **code-review**.

## Plan-section adapter

**When:** bounded written slice — PRD section, plan §, issue subset — during or after drafting. Not the full artifact.

**Coordinator expands:**

- Section ids / headings
- Linked premises or decisions in adjacent sections (read-only context for coordinator). Blind pack = target sections only unless the user included neighbors in the envelope.

**Matrix rows:** scope / gaps / sequencing — same three-axis overlay as **second-opinion** completeness attacker ([verify.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/verify.md) stub points at consumer SSOT). Do not invent a fourth axis set in this skill.

**Blind pack:** cited plan sections only. Not full-repo sweeps.

**Filing gravity:** Once DoD / Master Locked P / closed-set tables exist in the slice, treat adjacent wording or env-recipe edges as Noted or `declined`. Keep them Action only when they are structural (closed-set orphan, exit-vocab contradiction, phase-ownership hole, DoD vs phase table conflict). Prefer family collapse over novel kebabs ([thrash-ledger.md](thrash-ledger.md)).
