# Codebase design vocabulary

<!-- source-of-truth: reusable code-design vocabulary for explicit complexity, module boundaries, ownership, and test seams. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-08-30 -->

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

Agree the public boundary before writing tests.

## Making complexity explicit

Make every meaningful source of complexity visible, named, owned, and testable.

Meaningful complexity includes domain state, temporal identity, async lifecycles, cross-context coordination, cache mutation, retries, recovery, policy decisions, side effects, and trust boundaries. Treat these as design concerns, not incidental implementation details.

| Requirement  | Meaning                                                                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Visible**  | Represent behavior that depends on sequence or history explicitly. Do not hide lifecycle state in unrelated booleans, callback order, effects, or ambient globals.                                           |
| **Named**    | Use domain terms for important states, transitions, identities, policies, and failure outcomes. A reader should not need to infer the concept from infrastructure code.                                      |
| **Owned**    | Give each mutable concern, lifecycle, policy decision, and source of truth one clear owner. Separate policy from mechanism and core behavior from platform, transport, persistence, and UI adapters.         |
| **Testable** | Expose public contracts and load-bearing seams that tests can control and observe. Cover races, cancellation, recovery, stale work, restart behavior, and trust boundaries when they are part of the design. |

File decomposition alone does not satisfy this principle. Several named files can still conceal shared state, duplicate ownership, or an implicit lifecycle. An abstraction earns its place when it clarifies ownership, hides real complexity, or creates a useful test seam.

Use the smallest structure that makes the design explicit. This principle does not require a class, state machine, port, or adapter when a direct function and value model express the behavior clearly.

## Anti-patterns

- **Shallow module** — interface nearly as complex as the implementation. No abstraction win.
- **Leaky abstraction** — callers must understand hidden details (timing, storage, wire format) to use the API.
- **Stringly-typed cross-cuts** — magic strings/flags propagated everywhere instead of named concepts at a boundary.

## When to reach

Open this ref when:

- Agreeing test seams
- Discussing module boundaries after a structural bug
- Writing an ADR that records a boundary decision
- Pressure-testing whether a design hides the right decisions
- Reviewing ownership and evidence on a changed path
- Refactoring through small, proven slices

Do not load as always-on context. Use pointer only.
