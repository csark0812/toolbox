---
name: investigate
description: Narrow a specific hunch — settle it with primary-source evidence and a plain-language verdict. Find and verdict only. Use when there is a concrete doubt to test. Not for written plan review (second-opinion), open ideation (crystallize), or repro→fix loops (diagnose).
---

# Investigate

**Source of truth for** evidence-based hunch verification.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

**Find and verdict only** — locate the issue or settle the claim with citable primary-source evidence. **Do not propose code edits, diffs, or “change X to Y” in the verdict or evidence sections** unless the user explicitly asked to implement, repro, or fix. Route fixes in **What to do next** (e.g. diagnose / tdd) — do not ship the fix in this pass.

After the verdict, **What to do next** prefers hub **[`diagnose`](../diagnose/SKILL.md)** / **[`tdd`](../tdd/SKILL.md)** when installed; otherwise consumer testing / debug or project `AGENTS.md`. If the user explicitly asks to implement, repro, or fix after the verdict, follow that request (or the named skill).

**Primary-source-first** after the target is clear: read the actual code, source document, or data.

Read [references/research-basis.md](references/research-basis.md) when calibrating a move or making a research claim. Do not load by habit.

## Stance

- Plan file to critique → **second-opinion**
- Fuzzy thinking, no specific target → **crystallize** first
- One framework for repo and external material — phases may weave code → research → code. Full loop → [framework.md](references/framework.md)
- Multiple independent web topics → [parallel-research.md](references/parallel-research.md) via **subagents**
- Mixed/contested evidence or explicit stress-test → [parallel-perspective.md](references/parallel-perspective.md) via **subagents** (not the default path)

## Structural checks

When evidence touches structure, apply [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md) § Structural checks — name the spectrum in **What to do next** (localized change vs staged / ground-up).

## Protocol

Follow [framework.md](references/framework.md). Summary:

1. **Target-clarification chain.** Ask **short, invitational** questions until you know _where_ to look. Iterate until the target is concrete enough that reading primary material is purposeful — dimension by dimension if needed. If the user can only gesture at the discomfort, stay with one branch before widening. Start deep investigation only when files, a subsystem, or a primary source is plausible — _unless_ the user explicitly asks you to fish broadly, in which case use [parallel-broad.md](references/parallel-broad.md) via **subagents** and say you're doing a wider pass and why.
2. **Form 2–4 ranked, falsifiable hypotheses** before gathering evidence. Prefer mechanism/model hypos over situation guesses. For code: "If `<X>` is the cause, then `<Y>` at `file:line` should show `<Z>`." For claims: "If `<X>` is true, then primary source should show `<Z>`."
3. **Discriminating checks** — for each ranked hypo, name the cheapest kill test (strong inference: most information per unit cost). Run top kill tests **before** confirmatory forage.
4. **Read primary material** — actual code, docs, data, or cited sources. Tool rankings or "likely file" lists are not evidence.
5. **Forage or leave** — follow scent (callers, tests, citations, error sites). **Leave** the patch when 2–3 reads yield no confirmatory or disconfirmatory signal — re-rank hypos and may switch material class (e.g. repo → docs → repo). Leaving is completion, not failure.
6. **Locate enough to cite** — verdict needs domain-appropriate citations; for behavioral code hunches, narrow to a citable locus, then stop.
7. **When evidence is external** — lateral check and source class before settling; conflicting independents → say so in the verdict or escalate to [parallel-perspective.md](references/parallel-perspective.md). Multi-topic gather without a single hunch → [parallel-research.md](references/parallel-research.md), then back into this loop if a specific claim remains.
8. **Return a verdict** — one plain-language settlement (what holds, what doesn't, what stays open). Always cite specific locations in the primary material. If the hunch is unfounded, say so — do not invent problems to validate it. When evidence supports multiple mechanisms, report them separately rather than forcing a single narrative root cause. **Completion gate:** no code fix, patch, or implementation steps in the verdict or evidence — only in **What to do next** when routing onward.

## Evidence standard

A verdict earns its close when it:

- cites specific primary material (see table), and
- separates what the evidence settles from what remains open or contested — including mixed or multi-mechanism cases in the same prose.

| Domain          | Citation                                 |
| --------------- | ---------------------------------------- |
| Code            | `file:line` (mandatory for code hunches) |
| Docs / web      | `URL#section` or quoted passage          |
| Research claims | Specific data point or quoted source     |

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). End with this block when the clarification chain (when needed) and evidence pass are complete — not before. If the hunch is still too vague, **ask the next narrowing question** instead of forcing a verdict.

```markdown
## Hunch: [one-line restatement]

**Verdict:** [1–3 lines. Plain-language settlement — what holds, what doesn't, what stays open. No fixed label required.]

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
