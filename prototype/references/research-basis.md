# Prototype research basis

**Source of truth for** evidence and limits behind throwaway design spikes.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Read when calibrating a move or making a research claim. Not for every spike.

## Evidence posture

- Prototypes answer a **falsifiable design question** — not production features dressed as experiments.
- Throwaway by default. Promotion requires explicit user consent or `keep-skeleton` mode declared up front.

## Question before code

Declare design question, mode, and branch (logic vs UI) before writing runnable code.

**Confidence:** High for preventing silent graduation to production. Moderate for agent remembering the gate under urgency.

**Does not transfer:** Claiming every spike must become a prototype skill invocation — grill can suffice without code.

## Tracer bullets vs throwaway

`keep-skeleton` is rare — walking skeleton when the question is integration path, not polish.

**Confidence:** Moderate — practice lineage from Fowler / Cockburn. Limited LLM-specific RCTs.

**Does not transfer:** Shipping throwaway paths to main without promote gate.

## Verdict and routing

End with promote / discard / more grill. Capture learning in handoff when crossing sessions.

**Confidence:** High for explicit verdict. Not a guarantee the learning generalizes.
