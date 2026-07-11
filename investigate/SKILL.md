---
name: investigate
description: Narrow a hunch about code, approach, or claim, then confirm or refute with evidence and a verdict (Confirmed / Refuted / Partial) with citable primary-source references. Not a written plan review (second-opinion) or open-ended ideation (crystallize). For reproducible misbehavior, pair with consumer verify/testing skills (+ debug when layer or session logs are unclear).
disable-model-invocation: true
---

# Investigate

For when something feels wrong but the user can't fully articulate it yet, or they have a **specific** doubt about a code path, approach, claim, or conclusion. The goal is to narrow the hunch, then **confirm** or **refute** with evidence. Do not manufacture problems if the hunch is unfounded. **Narrow the unease together** — not doubting the user's instincts.

**Primary-source-first** after the target is clear: read the actual code, the actual source document, or the actual data — never secondhand description or memory.

## When to Use

- Specific doubt about a code path, approach, claim, or conclusion
- Narrow a vague unease into confirm/refute with citable primary-source evidence
- Parallel web research on independent topics (via **multi**)

Not for: written plan review ([`second-opinion`](../second-opinion/SKILL.md)), fuzzy ideation ([`crystallize`](../crystallize/SKILL.md)). For reproducible bugs, pair with consumer verify/testing (+ debug when layer/logs unclear) — see [agent-routing.md](references/agent-routing.md) § Quality & ops. Ambient extract → [agent-routing.md](references/agent-routing.md) § Specific doubt.

## Stance and routing

- If the user has **reproducible misbehavior**, use consumer verify/testing (repro + fix loop) alongside this skill; add debug when the layer is unclear or session instrumentation is needed — [agent-routing.md](references/agent-routing.md) § Quality & ops.
- If they have a **plan file** to critique, use **second-opinion**.
- For **fuzzy** thinking and no specific code target yet, **crystallize** can precede this skill.
- Multiple independent **web research** topics → [parallel-research.md](references/parallel-research.md) via **multi**.
- Mixed/contested evidence or explicit stress-test request → [parallel-perspective.md](references/parallel-perspective.md) via **multi** (not the default single-pass path).

## Structural and product checks

When evidence touches structure or product scope, apply [dialogue-contract.md](references/dialogue-contract.md) § Structural checks and § Product checks — name the spectrum in **What to do next** (localized change vs staged / ground-up). Full product gate → consumer product evaluation skill when present.

## Protocol

1. **Target-clarification chain.** Ask **short, invitational** questions until you know *where* to look. Iterate until the target is concrete enough that "read the code" is purposeful — dimension by dimension if needed: approach vs. UX vs. naming vs. placement vs. performance vs. data integrity vs. structure? If the user can only gesture at the discomfort, stay with one branch ("Is it closer to behavior or to structure?") before widening. **Do not start deep investigation** until the suspicion is specific enough that files or a subsystem are plausible — *unless* the user explicitly asks you to fish broadly, in which case use [parallel-broad.md](references/parallel-broad.md) via **multi** and say you're doing a wider pass and why.
2. **Read the primary material** — the actual code, the actual source document, or the actual dataset. Don't respond based on the description alone.
3. **Form 2–4 ranked, falsifiable hypotheses** before gathering evidence. Each in the form: "If `<X>` is the cause, then `<evidence Y>` should show `<Z>`." Rank by plausibility.
4. **Find evidence for and against** — look for both. Don't confirm-bias toward the hunch.
5. **Return a verdict** — confirmed, refuted, or partially confirmed (mixed evidence). Always cite specific locations in the primary material.

## Evidence standard

- A confirmed hunch needs: a specific, citable location in the primary material where the problem occurs + a concrete failure scenario (what breaks, when, under what conditions).
- A refuted hunch needs: the specific mechanism that prevents the problem + why the concern is unfounded.
- Partial: mixed evidence — say what's real and what isn't.

**Citation format by domain (additive):**

| Domain | Citation |
|--------|----------|
| Code | `file:line` (mandatory for code hunches) |
| Docs / web | `URL#section` or quoted passage |
| Product / research claims | Specific data point or quoted source |

## Principles

- Do not invent problems to validate the user's hunch. If it's unfounded, say so clearly.
- Cite exact locations — `file:line` for code; domain-appropriate equivalents for non-code targets. Vague conclusions are not useful.
- If you can't find the relevant primary material, say so and ask for better context before concluding.
- If the hunch is partially right, treat confirmed and refuted parts separately — don't average them into "it's complicated."

## Output format

Follow [output-schema.md](references/output-schema.md). End with this block when the clarification chain (when needed) and evidence pass are complete — not before. If the hunch is still too vague, **ask the next narrowing question** instead of forcing a verdict.

```markdown
## Hunch: [one-line restatement]

**Verdict:** Confirmed | Refuted | Partial

### Evidence

[path/to/file.ts:line] — [what this shows and why it matters]
[path/to/file.ts:line] — [supporting or contradicting evidence]

(For non-code targets, use the domain-appropriate citation from Evidence standard — e.g. `docs/foo.md#section` or a quoted passage.)

### Verdict reasoning

[2–3 sentences. Explain exactly why the verdict is what it is. If partial, separate what's real from what isn't.]

### What to do next

- [Concrete next action: fix, monitor, ignore, investigate further, or hand off to crystallize/grill → planning/build.md / second-opinion / consumer verify/testing / debug]
- [If structural: localized change vs staged / ground-up work — one line, tied to evidence]
```

## Consumer bindings

Project overrides inject via `.skeleton/customize/investigate.md` on skill read. Do not edit synced copies in place.
