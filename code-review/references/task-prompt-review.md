# Task Prompt — Review Overlays

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

Review-specific member prompt overlays. Generic template → [multi task-prompt.md](../../multi/references/task-prompt.md).

Orchestrated by [`code-review`](../SKILL.md) via [`multi`](../../multi/SKILL.md) kernel + [council-dispatch.md](council-dispatch.md).

**Consumer overlays:** Consumers keep product-intent, filing-gate → quality-gates, baseline, and contextual Full overlay _prose_ in project docs / customize — not in this portable file. See [council-dispatch.md](council-dispatch.md) § Overlays.

**Mandatory consumer overlay gate:** If the consumer remaps overlays via customize / project docs, **load that consumer overlay SSOT before** Filing gate, product-intent, Baseline, or Contextual Full. This file's thinned portable sections are **not** sufficient when a consumer remap exists — do not stop here.

## Review overlay (always — toolbox)

Include in the coordinator dispatch plan before spawning:

```
Mode: <mode>
Depth: <depth>  # after escalation per modes.md
Selected agents: <from agent-selection>
Diff source: <command from modes.md>
Mode overlay: "<overlay from modes.md>"
```

Append to each member Task `prompt`:

```
Review: [mode] at [depth] depth.

Diff:
<diff content>

Mode framing: <overlay from modes.md>

Apply your [agent-name] lens (map depth: Quick→quick, Standard→standard, Thorough→thorough, Full→full per agent file).
```

Synthesis → [synthesis.md](synthesis.md) then [output.md](output.md).

## Invariant overlay (Thorough+)

Append to the coordinator plan and every Thorough/Full member prompt:

```
Invariant review:
- State the behavioral invariant for each candidate before filing it.
- Derive the applicable input/contract rows from fix-loop-ledger.md § Invariant matrix.
- Inspect every affected contract surface, not only the reported example.
- Merge symptoms and edge variants under one root invariant.
- Default filing remains merge-blockers only; the matrix broadens inspection, not filing.
```

For path, routing, source-rewrite, contract, state/persistence, or
auth/permission changes, include the matching portable matrix dimensions from
[fix-loop-ledger.md](fix-loop-ledger.md).

## Default filing overlay (portable optional)

When the consumer has **not** supplied a fuller Default filing overlay, append:

```
Default filing: merge-blockers only
- File ONLY scope: ship-blocker — reachable production bugs (wrong behavior, data loss, auth/security on path)
- Do NOT file: test inventory, docs gaps, refactor, architecture nits, UX polish, RFC gaps without reachable client break
- Council depth unchanged — still read whole diff; narrow what you FILE
- Improvements mode only if user said: include improvements, full audit, hardening pass, polish, test inventory, or exhaustive triggers
```

Prefer the consumer overlay SSOT when customize / project docs define one.

## Pointer — consumer overlays

After the Review overlay (and portable Default filing if used), append **consumer overlays** when present:

- Named by `.skeleton/customize/code-review.md` (and `alwaysInclude` shared refs)
- Typically: Default filing (consumer wording), Filing gate, Product intent, Baseline checklist, Contextual Full re-review, path boosts, Needs confirmation

Do **not** hardcode consumer repo paths in this toolbox file.

## Contextual Full ledger overlay (pass 2+)

When prior Action findings exist, append to the coordinator plan and every
member prompt in addition to any consumer overlay:

```
Fix-loop: contextual Full re-review
Prior synthesis + ledger: <paste current stable-theme ledger>
Depth: Full; diff: whole branch

Read the whole diff independently, then reconcile every candidate:
1. Same theme, incomplete fix → reopen existing theme_id.
2. Same invariant, new variant → add evidence to the existing theme.
3. Genuinely new invariant → create a theme_id and explain in one line why prior passes missed this blocker class.
4. No reachable production failure → Noted/Deferred under filing rules.

Identify files/subsystems changed in 2+ fix passes and review those hotspots holistically.
Do not claim merge-ready or "final blockers" unless fix-loop-ledger.md § Exit gate passes.
```

The whole-diff read stays fresh; theme identity and closure state do not reset.
