# Handoff research basis

**Source of truth for** evidence and limits behind session context transfer.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Read when calibrating a move or making a research claim. Not for every handoff.

## Evidence posture

- Handoff compresses **pointers**, not artifact bodies — fights context loss without duplicating SSOT files.
- Ephemeral `_agent/handoffs/` stays outside doc audit perimeter. Never commit secrets.

## Same-root @ attach

Relative `@_agent/handoffs/...` resolves against the **next chat's workspace root**. Writing under the current chat root when next-session work lives in another repo produces a missing-file miss. That miss occurs even when the paste prompt looks correct.

**Confidence:** High — observed failure mode when handoff was written under an unrelated repo while `@` was used from the skill-owning workspace.

**Does not transfer:** Noting “work lives elsewhere” in the handoff body while still writing `_agent/handoffs/` under the wrong root. Relative `@` does not cross roots.

## Reference do not duplicate

Plans, PRDs, and review synthesis stay at their paths. Handoff cites paths and URLs only.

**Confidence:** High for maintainability. Moderate for cold-start agent success without reading linked artifacts.

**Does not transfer:** Replacing `@`-reference with pasting full plan bodies “to be helpful.”

- Liu et al. (2023). Lost in the Middle — long pasted context degrades retrieval. Pointers keep the hot path small.

## Redaction before write

Strip secrets, tokens, credentials, and PII — use `[REDACTED]`. Never persist `.env` values.

**Confidence:** High as a hard gate. Not a substitute for secret scanning in CI.

**Does not transfer:** Assuming the model will redact if asked later — redact before write.

## Honest state

Distinguish done, in-progress, and deferred. Cite commits and tests when claiming progress.

**Confidence:** Moderate — reduces false continuity across sessions.

**Does not transfer:** Full session replay — handoff is a map, not a transcript archive.
