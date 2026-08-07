# Parallel Perspective Investigate

Adversarial stress-test when evidence is mixed or the user explicitly asks. Uses [`subagents`](../../subagents/SKILL.md) kernel — [non-negotiables](../../subagents/SKILL.md#non-negotiables), [adversarial.md](../../subagents/references/adversarial.md) § Parallel, [task-prompt.md](../../subagents/references/task-prompt.md), [member-schema.md](../../subagents/references/member-schema.md).

Profile: `mixed`. Goal: `adversarial`.

Default **investigate** stays single-target, single-pass. Use this recipe only when evidence is genuinely contested or the user requests a stress test.

## When to use

- User explicitly asks for a stress-test on a hunch
- Evidence gathered so far is genuinely mixed or contested — not a mild uncertainty

## When to skip

- Single-target hunch with a clear next read — standard **investigate** protocol
- Multiple independent topics — [parallel-research.md](parallel-research.md)
- Broad fish without a single target — [parallel-broad.md](parallel-broad.md)
- Plan review — **second-opinion**

## Members (2)

Same target — adversarial stances (kill mandates):

| Slice                        | Subagent         | Stance                                                                                                                        |
| ---------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Strongest case for the hunch | `generalPurpose` | `steelman` / `attacker` — assume the hunch is real. Build the strongest case. Try to _kill_ skeptic hypos with evidence.      |
| Mechanism that prevents it   | `generalPurpose` | `skeptic` / `refuter` — assume it is a non-issue. Find what prevents the problem. Try to _kill_ steelman hypos with evidence. |

Use distinct stances. Under an Auto parent, share `inherit-auto` (omit tool `model`). Diversify via prompts/stances, not slugs. Distinct explicit models only under a named parent (same tier), user cross-model request, or recorded user overrides — [adversarial.md](../../subagents/references/adversarial.md) § Model routing overlay.

## Dispatch plan template

```markdown
Task: Perspective investigate — [one-line hunch]
Classification: mixed
Source of truth: [repo | plan | docs | data]
Goal: adversarial
Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]

Selected members:

- generalPurpose · tier=Standard · model=[inherit-auto | slug] · stance=steelman: strongest case for hunch
- generalPurpose · tier=Standard · model=[inherit-auto | slug] · stance=skeptic: mechanism that prevents or refutes

Synthesis plan: preserve conflicts per subagents + adversarial synthesis. Tag convergent/divergent. Each stance tries to kill the opposing hypo (ACH-lite). Verdict per investigate schema if evidence allows
```

## Synthesis

1. Merge findings per [subagents synthesis gate](../../subagents/SKILL.md#synthesis-gate) and [adversarial.md](../../subagents/references/adversarial.md) — **preserve conflicts. Do not flatten disagreements.** Tag `convergent` vs `divergent`.
2. Each stance must try to **kill the opposing hypothesis** with primary evidence — not rhetoric. Steelman/attacker and skeptic/refuter are ACH-lite, not debate theater.
3. If the sides are genuinely split, state both. Do not average into "it is complicated."
4. Write **investigate** verdict — plain-language settlement of what holds / does not / stays open. If stances remain split, say so in that prose.
5. Output follows **investigate** skill final shape. Use [subagents output-format.md](../../subagents/references/output-format.md) sections only as supporting detail.

## Handoff

- Hunch closed or narrow → close or single-target **investigate**
- Reproducible bug → hub **diagnose** / **tdd** when installed. Else consumer **testing** / **debug** or `AGENTS.md`
- Reproducible bug needing session logs (NDJSON, compose mount) → hub **diagnose** when installed. Else consumer **debug** or `AGENTS.md`
- User explicitly asks to fix after the verdict → exit investigate find-only. Follow that request or the named consumer skill
