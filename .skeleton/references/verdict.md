# Verdict (find-and-settle)

**Source of truth for** hunch verdict output shape and find-and-settle gate (coordinator explore path).

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Ambient ref for **hunch → evidence → plain-language verdict** — find and settle only, not fix. Extends [output-schema.md](output-schema.md). Coordinator-default path: **explore** subagent (or coordinator tool pass) + this block when evidence is ready.

## Non-negotiables

1. **Verdict not fix** — no patches in verdict/evidence unless user asked to implement.
2. **Primary-source-first** — after target is clear, read actual code/docs/data.
3. **Citations required** — `file:line` for code; URL#section or quote for docs/web.
4. **Prefer no finding over speculation** — unfounded hunch → say so.

## Loop (coordinator or explore member)

1. **Narrow** until primary material is purposeful.
2. **Hypothesize** — 2–4 ranked, falsifiable hypos.
3. **Discriminating checks** — cheapest kill test per hypo before confirmatory reads.
4. **Primary material** — read the actual code, document, dataset, or cited source.
5. **Forage or leave** — follow scent; after 2–3 reads with no signal, leave the patch and re-rank.
6. **Verdict** — citable locus + plain-language settlement (what holds / doesn't / stays open).

## When to escalate (multi-member)

| Situation                                    | Recipe                                                                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| User asks to fish broadly                    | **subagents** [explore-escalation-dispatch.md](../../subagents/references/explore-escalation-dispatch.md) § Parallel broad       |
| Multiple independent topics, no single hunch | **subagents** [explore-escalation-dispatch.md](../../subagents/references/explore-escalation-dispatch.md) § Parallel research    |
| Genuinely mixed or contested evidence        | **subagents** [explore-escalation-dispatch.md](../../subagents/references/explore-escalation-dispatch.md) § Parallel perspective |

## Output block

End with this block when clarification (if needed) and evidence pass are complete — not before. If hunch too vague, route to **grill** intent phase or ask next narrowing question.

```markdown
## Hunch: [one-line restatement]

**Verdict:** [1–3 lines — what holds, what doesn't, what stays open]

### Evidence

[path:line or URL#section] — [what this shows and why it matters]

### What to do next

- [fix → diagnose/tdd; monitor; ignore; grill; second-opinion; …]
- [If structural: localized vs staged/ground-up — one line]
```

**Find and verdict only** — no code fix in verdict/evidence unless user explicitly asked to implement.

## Handoffs (after verdict)

| Next need                               | Where                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| Implement fix, repro, make tests pass   | **diagnose** / **tdd** when installed; else consumer testing/debug or project `AGENTS.md` |
| User explicitly asks to fix / implement | **Exit find-only** — follow the request or named consumer skill                           |
| Still fuzzy on intent                   | **grill** intent phase ([intent-phase.md](../../grill/references/intent-phase.md))        |
| Written plan to critique                | **second-opinion**                                                                        |
| Pressure-test design before build       | **grill** design tree                                                                     |
