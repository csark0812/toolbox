# Council synthesis

After **escalated** council members return ([escalation.md](escalation.md)). **Primary-only** passes synthesize directly to [output.md](output.md) without this gate.

**Escalated hard gate:** Do not write council-shaped findings until every SELECTED member has a completed Task run ([council-dispatch.md](council-dispatch.md)). If spawn failed or user declined → stop; do not fabricate output.

**Primary path:** coordinator synthesis after direct inspection is valid — no member prerequisite.

After members return (escalated):

1. Merge agreements; group by root invariant / `theme_id`.
2. On pass 2+, reconcile every candidate to the prior ledger ([fix-loop-ledger.md](fix-loop-ledger.md)).
3. Apply thrash collapse — one Action block per invariant family.
4. **Worth-doing gate** (consumer overlay) — demote to Noted/Deferred.
5. Primary **validates** every specialist candidate before Action filing; specialist output is evidence, not accepted findings.
6. Update ledger; write [output.md](output.md) with `Reviewer: primary+specialists` or `Reviewer: council`.

Header must include `Surface: …`, `Reviewer: …`, `Pass class:` when anti-thrash ran, and escalation carve-outs for `closure-re-review` ([output.md](output.md)).

Fix-loop baseline → consumer customize when injected; portable exit gate is not weakened.
