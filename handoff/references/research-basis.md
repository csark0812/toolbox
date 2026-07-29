# Handoff research basis

**Source of truth for** evidence and limits behind session context transfer.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Read when calibrating a move or making a research claim. Not for every handoff.

## Evidence posture

- Handoff compresses **pointers**, not artifact bodies — fights context loss without duplicating SSOT files.
- Ephemeral `_agent/handoffs/` stays outside doc audit perimeter; never commit secrets.

## Reference don't duplicate

Plans, PRDs, and review synthesis stay at their paths; handoff cites paths and URLs only.

**Confidence:** High for maintainability; moderate for cold-start agent success without reading linked artifacts.

**Does not transfer:** Replacing `@`-reference with pasting full plan bodies “to be helpful.”

- Liu et al. (2023). Lost in the Middle — long pasted context degrades retrieval; pointers keep the hot path small.

## Redaction before write

Strip secrets, tokens, credentials, and PII — use `[REDACTED]`; never persist `.env` values.

**Confidence:** High as a hard gate; not a substitute for secret scanning in CI.

**Does not transfer:** Assuming the model will redact if asked later — redact before write.

## Honest state

Distinguish done, in-progress, and deferred; cite commits and tests when claiming progress.

**Confidence:** Moderate — reduces false continuity across sessions.

**Does not transfer:** Full session replay — handoff is a map, not a transcript archive.
