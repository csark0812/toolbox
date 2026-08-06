# Domain model research basis

**Source of truth for** evidence and limits behind glossary and ADR persistence.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Read when calibrating ADR gates or making a research claim. Not for every write.

## Evidence posture

- Ubiquitous language and bounded context reduce ambiguity when terms are canonical and decisions are explicit.
- ADRs document **decisions**, not open questions — rejected alternatives prove a choice was made.

## ADR and rejected alternatives

MADR-style records with at least one rejected alternative prevent decision-record theater.

**Confidence:** Moderate as team practice; low as automatic quality lift without human judgment.

**Does not transfer:** Writing ADRs before decisions are settled — route to **grill**.

- MADR project — Markdown Architectural Decision Records: https://adr.github.io/madr/
- Evans, E. (2003). _Domain-Driven Design_ — ubiquitous language and bounded context (conceptual basis for glossary writes).

## Dialogue vs persistence

**Crystallize** and **grill** sharpen terms; this skill persists only when the user or prior dialogue supplies a settled term or decision.

**Confidence:** High as separation of concerns.
