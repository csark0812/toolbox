---
name: investigate
description: Narrow a specific hunch about code, approach, or claim — then confirm or refute with evidence and a verdict (Confirmed / Refuted / Partial) plus a one- or two-line explanation, with citable primary-source references. Find and verdict only, not the fix. Use when there is a concrete doubt to test. Not a written plan review (second-opinion) or open-ended ideation (crystallize).
---

# Investigate

**Source of truth for** evidence-based hunch verification.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

For when something feels wrong but the user can't fully articulate it yet, or they have a **specific** doubt about a code path, approach, claim, or conclusion. The goal is to narrow the hunch, then **confirm** or **refute** with evidence. Do not manufacture problems if the hunch is unfounded. **Narrow the unease together** — not doubting the user's instincts.

**Find and verdict only** through the evidence pass — locate the issue or settle the claim with citable evidence. Do not implement the fix, run full repro/repair loops, or "make it green" while investigating. After the verdict, **What to do next** prefers hub **[`diagnose`](../diagnose/SKILL.md)** / **[`tdd`](../tdd/SKILL.md)** when installed; otherwise consumer **testing** / **debug** or project `AGENTS.md`. If the user explicitly asks to implement, repro, or fix after the verdict, **stop applying find-only constraints** and follow that request (or the named skill).

**Primary-source-first** after the target is clear: read the actual code, the actual source document, or the actual data — never secondhand description or memory.

## When to Use

- Specific doubt about a code path, approach, claim, or conclusion
- Research or claim hunch that needs confirm/refute with citable primary-source evidence
- Narrow a vague unease into confirm/refute with citable primary-source evidence
- Parallel web research on independent topics (via **multi**)

Not for: written plan review ([`second-opinion`](../second-opinion/SKILL.md)), fuzzy ideation ([`crystallize`](../crystallize/SKILL.md)).

## Stance

- If they have a **plan file** to critique, use **second-opinion**.
- For **fuzzy** thinking and no specific target yet, **crystallize** can precede this skill.
- One investigation framework for repo and external material — phases may weave code → research → code. Full loop and domain moves → [framework.md](references/framework.md).
- Multiple independent **web research** topics → [parallel-research.md](references/parallel-research.md) via **multi**.
- Mixed/contested evidence or explicit stress-test request → [parallel-perspective.md](references/parallel-perspective.md) via **multi** (not the default single-pass path).

## Structural checks

When evidence touches structure, apply [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md) § Structural checks — name the spectrum in **What to do next** (localized change vs staged / ground-up).

## Protocol

Follow [framework.md](references/framework.md). Summary:

1. **Target-clarification chain.** Ask **short, invitational** questions until you know _where_ to look. Iterate until the target is concrete enough that reading primary material is purposeful — dimension by dimension if needed: approach vs. UX vs. naming vs. placement vs. performance vs. data integrity vs. structure? If the user can only gesture at the discomfort, stay with one branch ("Is it closer to behavior or to structure?") before widening. **Do not start deep investigation** until the suspicion is specific enough that files, a subsystem, or a primary source is plausible — _unless_ the user explicitly asks you to fish broadly, in which case use [parallel-broad.md](references/parallel-broad.md) via **multi** and say you're doing a wider pass and why.
2. **Form 2–4 ranked, falsifiable hypotheses** before gathering evidence. Prefer mechanism/model hypos over situation guesses. For code: "If `<X>` is the cause, then `<Y>` at `file:line` should show `<Z>`." For claims: "If `<X>` is true, then primary source should show `<Z>`."
3. **Disconfirm-first** — for each ranked hypo, name the cheapest evidence that would *kill* it; gather that before confirmatory reads.
4. **Read primary material** — actual code, docs, data, or cited sources. Tool rankings or "likely file" lists are not evidence.
5. **Forage or leave** — follow scent (callers, tests, citations, error sites). If 2–3 reads yield no confirmatory or disconfirmatory signal, leave the patch, re-rank hypos, and may switch material class (e.g. repo → docs → repo).
6. **Locate enough to cite** — verdict needs domain-appropriate citations; for behavioral code hunches, narrow to a citable locus, then stop. Do not implement the fix here.
7. **When evidence is external** — lateral check and source class before Confirmed/Partial; conflicting independents → Partial or [parallel-perspective.md](references/parallel-perspective.md). Multi-topic gather without a single hunch → [parallel-research.md](references/parallel-research.md), then back into this loop if a specific claim remains.
8. **Return a verdict** — Confirmed, Refuted, or Partial, plus a one- or two-line explanation of why. Always cite specific locations in the primary material.

## Evidence standard

- A confirmed hunch needs: a specific, citable location in the primary material where the problem occurs + a concrete failure scenario (what breaks, when, under what conditions).
- A refuted hunch needs: the specific mechanism that prevents the problem + why the concern is unfounded.
- Partial: mixed evidence — say what's real and what isn't.

**Citation format by domain (additive):**

| Domain          | Citation                                 |
| --------------- | ---------------------------------------- |
| Code            | `file:line` (mandatory for code hunches) |
| Docs / web      | `URL#section` or quoted passage          |
| Research claims | Specific data point or quoted source     |

## Principles

- Do not invent problems to validate the user's hunch. If it's unfounded, say so clearly.
- Cite exact locations — `file:line` for code; domain-appropriate equivalents for non-code targets. Vague conclusions are not useful.
- If you can't find the relevant primary material, say so and ask for better context before concluding.
- If the hunch is partially right, treat confirmed and refuted parts separately — don't average them into "it's complicated."
- Do not treat automated rankings or localization hints as a verdict — read the primary material.
- Do not stop at a single narrative root cause when evidence supports multiple mechanisms.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). End with this block when the clarification chain (when needed) and evidence pass are complete — not before. If the hunch is still too vague, **ask the next narrowing question** instead of forcing a verdict.

```markdown
## Hunch: [one-line restatement]

**Verdict:** Confirmed | Refuted | Partial

[1–2 lines. Plain-language why the verdict is what it is. If partial, separate what's real from what isn't.]

### Evidence

[path/to/file.ts:line] — [what this shows and why it matters]
[path/to/file.ts:line] — [supporting or contradicting evidence]

(For non-code targets, use the domain-appropriate citation from Evidence standard — e.g. `docs/foo.md#section` or a quoted passage.)

### What to do next

- [Concrete next action: fix → diagnose/tdd when installed, else consumer testing/debug or project AGENTS.md; monitor; ignore; investigate further; or hand off to crystallize/grill → planning/build.md / second-opinion]
- [If structural: localized change vs staged / ground-up work — one line, tied to evidence]
```

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.
