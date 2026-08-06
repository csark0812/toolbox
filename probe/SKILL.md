---
name: probe
description: Narrow a hunch or hard bug — evidence and plain-language verdict by default; fix only when explicitly asked to implement/repro/fix or when a broken/throwing/failing/slow symptom already has an on-demand failing signal. Use when there is a concrete doubt to test, or the user says diagnose/debug/investigate this. Find and verdict only unless Fix is authorized under that gate. Not for written plan review (second-opinion), open ideation (crystallize), or greenfield test-first build (tdd).
---

# Probe

**Source of truth for** evidence-based hunch settlement and hard-bug fix loops under one Authority B gate.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Authority B** — Evidence/verdict by default. Enter the Fix family only when:

- the user explicitly asks to fix/implement/repro-debug, **or**
- the user describes a broken symptom **and** an on-demand failing signal already exists (command/test/CI you can run).

**Explicit ask vs no-loop:** Explicit ask enters **Fix (loop-building)**, not patch-without-loop. Hypothesize-and-patch without a red signal is banned in all states.

Adapted (Fix path) from [mattpocock/skills](https://github.com/mattpocock/skills) `diagnosing-bugs` (MIT © 2026 Matt Pocock).

Read [references/research-basis.md](references/research-basis.md) (Evidence) or [references/research-basis-fix.md](references/research-basis-fix.md) (Fix) when calibrating a move or making a research claim. Do not load by habit.

## Stance select

| State                   | Enter when                                                    | May edit production?                              | Next                                                    |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| **Evidence**            | Default; locus unclear; hunch/claim                           | No                                                | Verdict → stop, or user asks fix → evaluate Authority B |
| **Fix (loop-building)** | Authority B satisfied **and** no tight red loop yet           | **No** — build/tighten loop or ask for repro only | When red loop exists → Fix (patch)                      |
| **Fix (patch)**         | Authority B satisfied **and** on-demand failing signal exists | **Yes** after red                                 | Regression lock; optional **tdd** handoff               |

If locus is unclear → start **Evidence** (even if the user said “broken”).

Routes elsewhere: plan file to critique → **second-opinion**; fuzzy thinking, no specific target → **crystallize** first; greenfield test-first at a seam → **tdd**.

## Evidence

**Find and verdict only** — locate the issue or settle the claim with citable primary-source evidence. **Do not propose code edits, diffs, or “change X to Y” in the verdict or evidence sections.** Route fixes in **What to do next** (e.g. Fix under Authority B / **tdd**) — do not ship the fix in this pass.

**Primary-source-first** after the target is clear: read the actual code, source document, or data.

### Evidence stance

- One framework for repo and external material — phases may weave code → research → code. Full loop → [framework.md](references/framework.md)
- Multiple independent web topics → [parallel-research.md](references/parallel-research.md) via **subagents**
- Mixed/contested evidence or explicit stress-test → [parallel-perspective.md](references/parallel-perspective.md) via **subagents** (not the default path)

### Structural checks

When evidence touches structure, apply [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md) § Structural checks — name the spectrum in **What to do next** (localized change vs staged / ground-up).

### Evidence protocol

Follow [framework.md](references/framework.md). Summary:

1. **Target-clarification chain.** Ask **short, invitational** questions until you know _where_ to look. Iterate until the target is concrete enough that reading primary material is purposeful — dimension by dimension if needed. If the user can only gesture at the discomfort, stay with one branch before widening. Start deep investigation only when files, a subsystem, or a primary source is plausible — _unless_ the user explicitly asks you to fish broadly, in which case use [parallel-broad.md](references/parallel-broad.md) via **subagents** and say you're doing a wider pass and why.
2. **Form 2–4 ranked, falsifiable hypotheses** before gathering evidence. Prefer mechanism/model hypos over situation guesses. For code: "If `<X>` is the cause, then `<Y>` at `file:line` should show `<Z>`." For claims: "If `<X>` is true, then primary source should show `<Z>`."
3. **Discriminating checks** — for each ranked hypo, name the cheapest kill test (strong inference: most information per unit cost). Run top kill tests **before** confirmatory forage.
4. **Read primary material** — actual code, docs, data, or cited sources. Tool rankings or "likely file" lists are not evidence.
5. **Forage or leave** — follow scent (callers, tests, citations, error sites). **Leave** the patch when 2–3 reads yield no confirmatory or disconfirmatory signal — re-rank hypos and may switch material class (e.g. repo → docs → repo). Leaving is completion, not failure.
6. **Locate enough to cite** — verdict needs domain-appropriate citations; for behavioral code hunches, narrow to a citable locus, then stop.
7. **When evidence is external** — lateral check and source class before settling; conflicting independents → say so in the verdict or escalate to [parallel-perspective.md](references/parallel-perspective.md). Multi-topic gather without a single hunch → [parallel-research.md](references/parallel-research.md), then back into this loop if a specific claim remains.
8. **Return a verdict** — one plain-language settlement (what holds, what doesn't, what stays open). Always cite specific locations in the primary material. If the hunch is unfounded, say so — do not invent problems to validate it. When evidence supports multiple mechanisms, report them separately rather than forcing a single narrative root cause. **Completion gate:** no code fix, patch, or implementation steps in the verdict or evidence — only in **What to do next** when routing onward.

### Evidence standard

A verdict earns its close when it:

- cites specific primary material (see table), and
- separates what the evidence settles from what remains open or contested — including mixed or multi-mechanism cases in the same prose.

| Domain          | Citation                                 |
| --------------- | ---------------------------------------- |
| Code            | `file:line` (mandatory for code hunches) |
| Docs / web      | `URL#section` or quoted passage          |
| Research claims | Specific data point or quoted source     |

### Evidence output

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). End with this block when the clarification chain (when needed) and evidence pass are complete — not before. If the hunch is still too vague, **ask the next narrowing question** instead of forcing a verdict.

```markdown
## Hunch: [one-line restatement]

**Verdict:** [1–3 lines. Plain-language settlement — what holds, what doesn't, what stays open. No fixed label required.]

### Evidence

[path/to/file.ts:line] — [what this shows and why it matters]
[path/to/file.ts:line] — [supporting or contradicting evidence]

(For non-code targets, use the domain-appropriate citation from Evidence standard — e.g. `docs/foo.md#section` or a quoted passage.)

### What to do next

- [Concrete next action: Fix under Authority B / tdd when installed, else consumer testing/debug or project AGENTS.md; monitor; ignore; probe further; or hand off to crystallize/grill → planning/build.md / second-opinion]
- [If structural: localized change vs staged / ground-up work — one line, tied to evidence]
```

## Fix

A discipline for hard bugs. **Ordering is the value** — build a **tight** pass/fail signal before hypothesizing. The loop is the **verifier** (environment oracle); hypotheses serve the loop, not the other way around. Skip phases only when explicitly justified.

### Fix (loop-building) — no loop, no hypotheses, no production edits

If there is **no on-demand failing signal** — no failing test, script, CI artifact, or user repro you can run — **stop**. Do not hypothesize. Do not edit production code.

Route to:

- get a repro from the user (environment, steps, artifact), or
- stay in / return to **Evidence** when the locus is still unclear.

### Phase 1 — Build a tight feedback loop

**This is the Fix skill.** Everything else consumes the loop. Full catalog → [loop-catalog.md](references/loop-catalog.md).

Spend disproportionate effort here. Try loop constructions in roughly catalog order until one is **tight** and **red** on _this_ bug.

**Tighten the loop** once you have one:

- Faster? (cache setup, skip unrelated init, narrow scope)
- Sharper signal? (assert the specific symptom, not "didn't crash")
- More deterministic? (pin time, seed RNG, isolate filesystem/network)

**Completion criterion:** you can name **one command** you have **already run** that is:

- [ ] **Red-capable** — drives the bug path and asserts the user's exact symptom
- [ ] **Deterministic** — same verdict every run (flake: raise reproduction rate until debuggable)
- [ ] **Fast** — seconds, not minutes

If you genuinely cannot build a loop, say so explicitly. List what you tried. Ask for environment access, a captured artifact, or permission for temporary instrumentation. **Do not proceed to hypothesize.**

### Phase 2 — Fix (patch) with the loop red

Only after Phase 1 is complete. The loop must be **red** on this bug before you change production code.

A fail-to-pass test is a **diagnostic instrument**, not a patch spec — it proves the bug; the fix may differ.

### Phase 3 — Lock the regression

Hand the loop to [`tdd`](../tdd/SKILL.md) to turn the diagnostic into a kept regression test at an agreed seam. Structural root causes may reference [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/codebase-design.md). Then [`code-review`](../code-review/SKILL.md) for structural cleanup if needed.

### Fix output

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). End with:

```markdown
## Diagnosis

**Symptom:** [user-visible failure]
**Loop:** `[one command]` — [red/green, deterministic, fast]

### Cause

[mechanism + citable location]

### Fix

[what changed]

### Regression lock

[test path or pending tdd handoff]

### What to do next

- [tdd slice, code-review, Evidence if locus unclear, or handoff]
```

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.
