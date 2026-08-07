# Codebase design vocabulary

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

**Portable ambient reference** — named concepts for module boundaries and test seams. Not a staged workflow. Load on context pointer only.

Consumer projects can extend via customize. Product-specific domain terms live in the project glossary, not here.

## Deep module

A module with a **small interface** and a **powerful implementation**. Callers get a lot of capability through a narrow API. Complexity stays inside. Errors are defined away at the boundary where possible.

**Tell:** callers need to know internal structure to use the module correctly.

## Information hiding

Each module hides a **design decision likely to change**. Stable callers depend on the interface. Volatile details stay behind it.

**Tell:** a change in one area forces edits across unrelated modules.

## Seam

A **seam** is where you can observe or alter behavior **without editing the module under test** (Feathers). Tests belong at seams — public interfaces, not internals.

Aligns with [`tdd`](../../tdd/SKILL.md) seam confirmation: agree the public boundary before writing tests.

## Anti-patterns

- **Shallow module** — interface nearly as complex as the implementation. No abstraction win.
- **Leaky abstraction** — callers must understand hidden details (timing, storage, wire format) to use the API.
- **Stringly-typed cross-cuts** — magic strings/flags propagated everywhere instead of named concepts at a boundary.

## When to reach

Open this ref when:

- Agreeing **test seams** (`tdd`)
- Discussing **module boundaries** after a structural bug (`diagnose`)
- Writing an ADR that documents a boundary decision (`domain-model`)
- Pressure-testing whether a design hides the right decisions (`grill`)

Do not load as always-on context. Use pointer only.
