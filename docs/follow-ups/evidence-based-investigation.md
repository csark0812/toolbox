# Follow-up: nontechnical evidence-based investigation

<!-- source-of-truth: deferred discussion scope for a possible nontechnical investigation skill. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-05 -->

**Status:** Deferred design discussion. Revisit when the user wants to explore concrete nontechnical cases. This note does not authorize creating a new skill.

## Start with examples

Use a few real cases to determine whether existing skills cover the work or a separate `evidence-based-investigation` skill earns its place.

| Example                       | Question to investigate                                            | Candidate evidence                                                               |
| ----------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Unexplained spending increase | Which changes explain the increase over a comparable period?       | Transactions, categories, billing periods, price changes and recurring charges   |
| Missed team handoffs          | Where does the handoff break, and which conditions contribute?     | Agreed responsibilities, timestamps, work records and accounts from participants |
| Conflicting research claims   | What does each claim establish, and why do the conclusions differ? | Original studies, methods, populations, measurements and limitations             |

Choose examples with enough accessible evidence to try an investigation. Treat these candidate explanations and evidence sources as starting points, not established causes.

## Keep the current boundaries

- `probe` tests a specific hunch or claim against primary evidence and returns a cited verdict. Its existing scope includes documents, data and research.
- [evidence-based-debugging](../../evidence-based-debugging/SKILL.md) investigates reported software and system failures. Keep its technical scope focused.
- A possible `evidence-based-investigation` skill would need a distinct user intent, procedure and completion standard demonstrated by the examples.

## Questions to resolve

1. Is the user testing a specific explanation, or trying to discover why an unexpected outcome occurred? Which cases does `probe` already handle well?
2. What counts as an observation, a supported explanation and a demonstrated cause when controlled reproduction is unavailable? How should the procedure handle confounders, incomplete records and conflicting accounts?
3. What result should close an investigation: a settled claim, a bounded causal explanation, a recommended next observation, or a separate decision about an intervention?
4. Which rules genuinely transfer from technical debugging, and which need a different contract? Evidence must still remain separate from authorization to act.

## Decision and next proof

Walk through the selected cases using existing `probe` coverage first. Record where its claim-assessment contract is sufficient and where a broader investigation needs distinct guidance. Compare results against the user's intended outcome before deciding to author anything new.

Keep this as a discussion until that distinction is clear. If a new skill is justified, define its scope and completion criteria with the user, then propose its implementation. Extract shared guidance only after both skills demonstrate a need for it, and keep each independently usable.
