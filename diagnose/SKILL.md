---
name: diagnose
description: Hard-bug diagnosis loop — repro → tighten feedback loop → fix → regression lock. Use when something is broken, throwing, failing, slow, or the user says diagnose/debug this. Not for find-only hunches without a repro (investigate) or greenfield test-first build (tdd).
---

# Diagnose

**Source of truth for** hard-bug and regression diagnosis with a tight feedback loop.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `diagnosing-bugs` (MIT © 2026 Matt Pocock).

A discipline for hard bugs. **Ordering is the value** — build a **tight** pass/fail signal before hypothesizing. Skip phases only when explicitly justified.

**Not for:** find-only hunch verification ([`investigate`](../investigate/SKILL.md)), greenfield test-first build ([`tdd`](../tdd/SKILL.md)), or throwaway design spikes ([`prototype`](../prototype/SKILL.md)).

## When to Use

- Reproducible or on-demand failing signal (test, script, user repro, CI failure)
- User says diagnose, debug this, or reports broken / throwing / failing / slow
- [`investigate`](../investigate/SKILL.md) confirmed locus and hands off to fix

Not for: vague hunch without repro ([`investigate`](../investigate/SKILL.md)), new behavior at agreed seams ([`tdd`](../tdd/SKILL.md)), design questions ([`prototype`](../prototype/SKILL.md)).

## Entry gate — no loop, no hypotheses

If there is **no on-demand failing signal** — no failing test, script, CI artifact, or user repro you can run — **stop**. Do not hypothesize.

Route to:

- get a repro from the user (environment, steps, artifact), or
- [`investigate`](../investigate/SKILL.md) when the locus is still unclear.

## Protocol

### Phase 1 — Build a tight feedback loop

**This is the skill.** Everything else consumes the loop. Full catalog → [loop-catalog.md](references/loop-catalog.md).

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

### Phase 2 — Fix with the loop red

Only after Phase 1 is complete. The loop must be **red** on this bug before you change production code.

A fail-to-pass test is a **diagnostic instrument**, not a patch spec — it proves the bug; the fix may differ.

### Phase 3 — Lock the regression

Hand the loop to [`tdd`](../tdd/SKILL.md) to turn the diagnostic into a kept regression test at an agreed seam. Structural root causes may reference [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/codebase-design.md). Then [`code-review`](../code-review/SKILL.md) for structural cleanup if needed.

## Output format

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

- [tdd slice, code-review, investigate if locus unclear, or handoff]
```

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.
