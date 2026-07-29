# Review procedure (all sources)

Single primary-first contract for every source adapter ([sources.md](sources.md)). Intensity from [surfaces.md](surfaces.md). Escalation only via [escalation.md](escalation.md).

## Workflow

1. **Source** — pick adapter; run acquire commands; note framing if needed.
2. **Surface** — measure bulk in scope; assign band; apply risk attention; honor user intensity overrides.
3. **Re-review preflight** — when prior Action themes may exist or user re-reviews after fixes, run [anti-thrash.md](anti-thrash.md) **before synthesis** (any adapter).
4. **Primary review** — read diff + primary material; trace contracts, guards, async boundaries, introduced-only defects. Coordinator tools are the default review path.
5. **Escalate?** — only per [escalation.md](escalation.md) (Matched policy). If no escalation, synthesize and write [output.md](output.md).
6. **Escalated path** — `multi` specialists or council → primary validates every candidate → [synthesis.md](synthesis.md) → [output.md](output.md).

**Default:** step 5 ends with **primary only** — zero Task/Subagent members.

## Evidence

- Introduced-only / regression provenance — consumer review-gates overlay when injected; portable default: file what the diff introduced or newly made reachable.
- Each Action claim needs `path:line`, trigger, impact, and counter-evidence checked.
- Merge duplicate symptoms under one `theme_id` ([fix-loop-ledger.md](fix-loop-ledger.md)).
- Prefer no finding over speculation ([merge-blockers.md](merge-blockers.md)).
- On **Broad** surfaces, maximize **usefulness density** — fewer high-confidence production-reachable blockers with `path:line` evidence beat long low-value lists ([surfaces.md](surfaces.md)).

## Filing

Default **merge-blockers only** — [merge-blockers.md](merge-blockers.md). Improvements/exhaustive only on explicit user triggers listed there.

## Output

Always [output.md](output.md): finding blocks, optional Continuity, tails. **Review status** lines (`No findings in scope.`, `No merge-blockers in scope.`, counts) only when the user asked merge-readiness or equivalent — not on every casual review.

## Fix implementation (after review)

User "address all" / "fix all" / "yes" to ship-blockers → read prior themes (findings / git archaeology) before coding; invariant-complete batches; repo validation; end with findings + Continuity if themes remain open. On green, delete leftover `_agent/review/REVIEW_LEDGER.md` if present.
