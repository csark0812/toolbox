# Verdict (find-and-settle)

**Source of truth for** hunch verdict output shape and find-and-settle gate (coordinator explore path).

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Ambient ref for **hunch → evidence → pragmatic STE verdict** — find and settle only, not fix. Extends [output-schema.md](output-schema.md). Shared vocabulary → [context-pack.md](../../council/references/context-pack.md).

## Entry gate

- **Concrete hunch** — falsifiable target (path, behavior, claim).
- If the hunch is too vague, stop. Ask narrowing questions (dialogue) before the evidence pass.

## Non-negotiables

1. **Verdict not fix** — no patches in verdict/evidence unless the user asked to implement.
2. **Primary-source-first** — after the target is clear, read actual code/docs/data.
3. **Citations required** — `file:line` for code. URL#section or quote for docs/web.
4. **Prefer no finding over speculation** — if the hunch is unfounded, say so.

## Loop (coordinator or explore member)

1. **Narrow** until primary material is purposeful.
2. **Hypothesize** — 2–4 ranked, falsifiable hypos.
3. **Discriminating checks** — cheapest kill test per hypo before confirmatory reads.
4. **Primary material** — read the actual code, document, dataset, or cited source.
5. **Forage or leave** — follow scent. After 2–3 reads with no signal, leave the patch and re-rank.
6. **Verdict** — citable locus + pragmatic STE settlement (what holds / does not / stays open).

## When to escalate (multi-member)

| Situation                                    | Recipe                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| User asks to fish broadly                    | Attach **council**, or [probe parallel-broad.md](../../probe/references/parallel-broad.md)                  |
| Multiple independent topics, no single hunch | Attach **council**, or [probe parallel-research.md](../../probe/references/parallel-research.md)            |
| Genuinely mixed or contested evidence        | Attach **council**, or [probe parallel-perspective.md](../../probe/references/parallel-perspective.md)      |

## Exit artifact

End with this block when clarification (if needed) and the evidence pass are complete. Do not end before that.

```markdown
## Hunch: [one-line restatement]

**Verdict:** [1–3 lines in pragmatic STE — what holds, what does not, what stays open]

### Evidence

[path:line or URL#section] — [what this shows and why it matters]

### What stays open

- …
```

**Find and verdict only** — no code fix in verdict/evidence unless the user explicitly asked to implement.

**Verdict prose:** Write the Verdict block in pragmatic Simplified Technical English. Use short sentences and active voice. Do not use contractions. Do not use `should`, `would`, `may`, `might`, or `could`.
