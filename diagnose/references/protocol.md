# Diagnose protocol

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Hard-bug discipline — **ordering is the value**. Loop catalog → [loop-catalog.md](loop-catalog.md).

## Entry gate

No on-demand failing signal → **stop**. Route to user repro or **investigate** when locus unclear.

## Phase 1 — Tight feedback loop

Try constructions from catalog until one is **tight** and **red** on this bug. Then tighten: faster, sharper signal, more deterministic.

**Done when** one command is red-capable, deterministic, and fast — and you have **run** it.

Cannot build loop → list attempts; ask for access/artifact; **do not hypothesize**.

## Phase 2 — Fix with loop red

Loop must be red before production changes. Fail-to-pass test is diagnostic instrument, not patch spec.

## Phase 3 — Regression lock

Hand loop to **tdd** for kept test at agreed seam. Structural cleanup → **code-review** if needed.
