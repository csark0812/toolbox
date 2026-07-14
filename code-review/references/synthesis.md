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
4. For every genuinely new Action theme on pass 2+, include a one-line
   `Prior-pass miss:` explanation in the finding description.
5. Apply the applicable invariant matrix and check affected contract surfaces
   before marking a theme closed.
6. **Apply worth-doing gate** (consumer worth-doing gate / customize) — demote failures to **Noted** or **Deferred** tails; never Action blocks.
7. Only **Action** items (ship-blocker or in-scope hardening) get severity and scope in synthesis.
8. Preserve conflicts among Action candidates; do not flatten them away.
9. On high-risk contradiction among Action items, spawn a neutral tiebreaker at **Premium** tier or escalate to the user.
10. Update the ledger, hotspot review status, test evidence, and validation
    evidence per [fix-loop-ledger.md](fix-loop-ledger.md).
11. Write consolidated report per [output.md](output.md).

Fix-loop baseline comparison and **Baseline contradictions** section → consumer review-fix-loop / customize § Baseline comparison. Consumer rules may add context but cannot weaken stable theme identity or the portable exit gate.
