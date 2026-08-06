# Review procedure (all sources)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-03 -->

Single primary-first contract for every source adapter ([sources.md](sources.md)). Intensity from [surfaces.md](surfaces.md). Escalation only via [escalation.md](escalation.md).

## Workflow

1. **Source** — pick adapter; run acquire commands; note framing if needed.
2. **Surface** — measure bulk in scope; assign band; apply risk attention; honor user intensity overrides.
3. **Re-review preflight** — run [anti-thrash.md](anti-thrash.md) **before synthesis and before any Task/council spawn** when any of: prior Action themes may exist; user re-reviews after fixes; bare `review` / `review vs main` / `check the PR` in a new chat; tip may show a same-hotspot micro-fix trail. Missing chat context alone MUST NOT imply `first-baseline`.
4. **Hard stop** — if anti-thrash triggers (same-hotspot trail or recoverable `Theme:` lines), set `Pass class:` to `closure-re-review` or justified `new-scope-review` per [anti-thrash.md](anti-thrash.md) § Hard stop. **Do not** call Task/Subagent or open council until that gate passes. `first-baseline` is forbidden while a trigger is active.
5. **Primary review** — read diff + primary material; trace contracts, guards, async boundaries, introduced-only defects. Coordinator tools are the default review path. On `closure-re-review`, prefer same-invariant inventory over symptom hunting ([anti-thrash.md](anti-thrash.md) thrash signal).
6. **Escalate?** — only per [escalation.md](escalation.md) (Matched policy), and only after steps 3–4. If no escalation, synthesize and write [output.md](output.md).
7. **Escalated path** — `subagents` specialists or council → primary validates every candidate → [synthesis.md](synthesis.md) → [output.md](output.md). Dispatch plan MUST include `Pass class:` + archaeology evidence from the hard stop.

**Default:** step 6 ends with **primary only** — zero Task/Subagent members.

## Evidence

- Introduced-only / regression provenance — consumer review-gates overlay when injected; portable default: file what the diff introduced or newly made reachable.
- Each Action claim needs `path:line`, trigger, impact, and counter-evidence checked.
- Merge duplicate symptoms under one `theme_id` ([fix-loop-ledger.md](fix-loop-ledger.md)).
- Prefer no finding over speculation ([merge-blockers.md](merge-blockers.md)).
- On **Broad** surfaces, maximize **usefulness density** — fewer high-confidence production-reachable blockers with `path:line` evidence beat long low-value lists ([surfaces.md](surfaces.md)).

## Filing

Default **merge-blockers only** — [merge-blockers.md](merge-blockers.md). Improvements/exhaustive only on explicit user triggers listed there.

## Output

Always [output.md](output.md): finding blocks, optional Continuity, tails. When Action > 0, include Continuity session hint **and** persistence instructions ([output.md](output.md) § Continuity persistence). **Review status** lines (`No findings in scope.`, `No merge-blockers in scope.`, counts) only when the user asked merge-readiness or equivalent — not on every casual review.

## Fix implementation (after review)

User "address all" / "fix all" / "yes" to ship-blockers → read prior themes (findings / git archaeology) before coding; invariant-complete batches; **MUST** include `Theme: <id>` in each fix commit message (footer or body) so channel #3 stays recoverable; repo validation; end with findings + Continuity session hint + persistence reminder if themes remain open. On green, delete leftover `_agent/review/REVIEW_LEDGER.md` if present — **never write** a new ledger file.
