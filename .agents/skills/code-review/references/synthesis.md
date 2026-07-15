# Council Synthesis

Review-specific synthesis after council members return. Generic multi synthesis → [multi synthesis gate](../../multi/SKILL.md#synthesis-gate).

**Prerequisite:** At least one completed `Task` per planned council member (unless valid skips in [multi non-negotiables](../../multi/SKILL.md#non-negotiables)). If no members ran, do not fabricate a review report.

After members return:

1. Merge findings that agree; state once with the highest shared confidence.
2. Group all symptoms and edge variants by root invariant. One invariant gets
   one stable `theme_id` and one Action block.
3. On pass 2+, reconcile every candidate against the prior ledger before
   deciding it is new: incomplete fix, same-invariant variant, genuinely new
   invariant, or non-blocking observation.
4. Same invariant + new edge on pass 2+ **extends** the existing `theme_id`
   (reopen / incomplete closure). Do not file a fresh sibling theme for an
   adjacent hole.
5. For every genuinely new Action theme on pass 2+, include a one-line
   `Prior-pass miss:` explanation in the finding description.
6. Before marking a theme closed, apply the applicable invariant matrix, check
   affected contract surfaces, and record **variant coverage checked** per
   [fix-loop-ledger.md](fix-loop-ledger.md) § Variant coverage before closure.
7. **Apply worth-doing gate** (consumer worth-doing gate / customize) — demote failures to **Noted** or **Deferred** tails; never Action blocks.
8. Only **Action** items (ship-blocker or in-scope hardening) get severity and scope in synthesis.
9. Preserve conflicts among Action candidates; do not flatten them away.
10. On high-risk contradiction among Action items, spawn a neutral tiebreaker at **Premium** tier (still parent-aware: Auto parent → `inherit-auto` / omit `model`; named parent → explicit Premium slug per multi routing) or escalate to the user.
11. Update the ledger, hotspot review status, variant-coverage notes, test
    evidence, and validation evidence per [fix-loop-ledger.md](fix-loop-ledger.md).
12. Write consolidated report per [output.md](output.md).

Fix-loop baseline comparison and **Baseline contradictions** section → consumer review-fix-loop / customize § Baseline comparison. Consumer rules may add context but cannot weaken stable theme identity or the portable exit gate.
