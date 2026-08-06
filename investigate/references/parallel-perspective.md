# Parallel Perspective Investigate

Adversarial stress-test when evidence is mixed or the user explicitly asks. Uses via subagents for spawn — non-negotiables, adversarial (parallel), member prompts, member schema (load the subagents skill).

Profile: `mixed`. Goal: `adversarial`.

Default **investigate** stays single-target, single-pass — use this recipe only when evidence is genuinely contested or the user requests a stress test.

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

| Slice                        | Subagent         | Stance                                                                                                                      |
| ---------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Strongest case for the hunch | `generalPurpose` | `steelman` / `attacker` — assume the hunch is real; build the strongest case; try to _kill_ skeptic hypos with evidence     |
| Mechanism that prevents it   | `generalPurpose` | `skeptic` / `refuter` — assume it's a non-issue; find what prevents the problem; try to _kill_ steelman hypos with evidence |

Use distinct stances. Under an Auto parent, share `inherit-auto` (omit tool `model`); diversify via prompts/stances, not slugs. Distinct explicit models only under a named parent (same tier), user cross-model request, or recorded user overrides — via subagents (adversarial) § Model routing overlay.

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

Synthesis plan: preserve conflicts per subagents + adversarial synthesis; tag convergent/divergent; each stance tries to kill the opposing hypo (ACH-lite); verdict per investigate schema if evidence allows
```

## Synthesis

1. Merge findings per via subagents synthesis gate and via subagents (adversarial) — **preserve conflicts; do not flatten disagreements.** Tag `convergent` vs `divergent`.
2. Each stance should try to **kill the opposing hypothesis** with primary evidence — not rhetoric. Steelman/attacker and skeptic/refuter are ACH-lite, not debate theater.
3. State both sides if genuinely split rather than averaging into "it's complicated."
4. Write **investigate** verdict — plain-language settlement of what holds / doesn't / stays open; if stances remain split, say so in that prose.
5. Output follows **investigate** skill final shape; use via subagents (output-format) sections only as supporting detail.

## Handoff

- Hunch closed or narrow → close or single-target **investigate**
- Reproducible bug → hub **diagnose** / **tdd** when installed; else consumer **testing** / **debug** or `AGENTS.md`
- Reproducible bug needing session logs (NDJSON, compose mount) → hub **diagnose** when installed; else consumer **debug** or `AGENTS.md`
- User explicitly asks to fix after the verdict → exit investigate find-only; follow that request or the named consumer skill
