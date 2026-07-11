# Council Synthesis

Review-specific synthesis after council members return. Generic multi synthesis → [multi synthesis gate](../../multi/SKILL.md#synthesis-gate).

**Prerequisite:** At least one completed `Task` per planned council member (unless valid skips in [multi non-negotiables](../../multi/SKILL.md#non-negotiables)). If no members ran, do not fabricate a review report.

After members return:

1. Merge findings that agree; state once with the highest shared confidence.
2. **Apply worth-doing gate** ([code-review-quality-gates.md](../../../../docs/developer/code-review-quality-gates.md) § Worth-doing gate) — demote failures to **Noted** or **Deferred** tails; never Action blocks.
3. Only **Action** items (ship-blocker or in-scope hardening) get severity and scope in synthesis.
4. Preserve conflicts among Action candidates; do not flatten them away.
5. On high-risk contradiction among Action items, spawn a neutral tiebreaker at **Premium** tier or escalate to the user.
6. Write consolidated report per [output.md](output.md).

Fix-loop baseline comparison and **Baseline contradictions** section → [review-fix-loop.md](../../../../docs/developer/review-fix-loop.md) § Baseline comparison.
