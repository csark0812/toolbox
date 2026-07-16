---
name: code-review
description: Multi-lens code review for PR, commit, unstaged, staged, merge, and implementation diffs. Default filing merge-blockers only; say "include improvements" for polish/tests/refactor. Dispatches council via parallel subagents; scannable finding-block output (output.md — not Cursor bugbot subagent). Use when reviewing code, checking a diff, analyzing changes, or the user asks for code review. Auto-detects mode when omitted.
---

# Code review

**Source of truth for** portable council code-review workflow.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-16 -->

Consumer overlays arrive as project-specific injected context on skill read.

References: [council-dispatch.md](references/council-dispatch.md) · [agent-selection.md](references/agent-selection.md). Ambient routing extract → [agent-routing.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/agent-routing.md) § Pre-ship / PR.

## When to Use

- Review PR, commit, staged/unstaged, merge, or implementation diff
- Council dispatch with merge-blocker filing (default)
- Fix-loop / same-session implement after review

Not for: PR description/body authoring (separate skill), Cursor `/review-bugbot` or `/review-security` shortcuts (use this skill for fix-loop and worth-doing gate).

## Quick reference

| Need                            | Reference                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Modes, diff, depth, escalation  | [references/modes.md](references/modes.md)                                                                    |
| Default filing (merge-blockers) | [references/merge-blockers.md](references/merge-blockers.md)                                                  |
| Council dispatch + spawn        | [references/council-dispatch.md](references/council-dispatch.md) · [`multi`](../multi/SKILL.md) kernel        |
| Agent selection                 | [references/agent-selection.md](references/agent-selection.md)                                                |
| Review synthesis                | [references/synthesis.md](references/synthesis.md)                                                            |
| Output                          | [references/output.md](references/output.md) — scannable finding-block shape (not Cursor `bugbot` subagent)   |
| Fix-loop continuity             | [references/fix-loop-ledger.md](references/fix-loop-ledger.md) — themes, matrix, exit gate; findings-first UI |

## Workflow

1. **Anti-thrash preflight + mode + depth** — explicit or auto-detect mode ([modes.md](references/modes.md)). **Before any council dispatch**, run the [anti-thrash preflight](#anti-thrash-preflight). Apply pr/merge escalation, then calibrate fix-loop depth per [modes.md](references/modes.md) § Contextual re-review (targeted closure vs Full). When prior Action findings exist, reconstruct and carry the stable-theme ledger from [fix-loop-ledger.md](references/fix-loop-ledger.md); derive applicable invariant-matrix rows and each theme’s sweep plan before dispatch. **Filing mode:** default **merge-blockers only** ([merge-blockers.md](references/merge-blockers.md)) unless user said include improvements / full audit / hardening pass / polish / test inventory / exhaustive triggers. Record depth **and** pass class (`first-baseline` / `closure-re-review` / `new-scope-review`) in synthesis header per [output.md](references/output.md) § Status line.
2. **Diff** — per modes.md (`pr`/`merge` → [shared.md](references/shared.md)).
3. **Council dispatch (mandatory spawn)** — parallel council per [council-dispatch.md](references/council-dispatch.md) ([`multi`](../multi/SKILL.md) kernel) → [synthesis.md](references/synthesis.md) → [output.md](references/output.md).

   **Hard rules (do not skip):**
   - Issue **one host Task/Subagent call per selected member** (depth budget: Quick 1 / Standard 2 / Thorough 4 / Full 5; targeted closure uses Standard or Quick per modes.md — never zero). Coordinator `Read` / `Grep` / `Shell` is **not** a substitute for member runs.
   - Before writing any review report this turn: read [`multi` Non-negotiables](../multi/SKILL.md#non-negotiables) and [synthesis.md](references/synthesis.md). If no planned Task completed, **stop** — do not fabricate a `Review · …` report.
   - Docs / skills / agent-infra / “single theme” diffs do **not** waive council. Escalation path exclusions only affect Full promotion counts, not Thorough/Standard spawn. Targeted closure is a calibrated member budget, not a solo-coordinator waiver.
   - [`multi` Fit check](../multi/SKILL.md#fit-check) does **not** apply once this skill is running — this entry skill already chose parallel council.
   - **Mandatory before spawn:** append [task-prompt-review.md](references/task-prompt-review.md) § Default filing overlay to **every** member prompt (and coordinator plan). When consumer overlay context was injected on skill read, prefer that overlay set (Filing gate / product-intent / Baseline / Contextual Full) over portable `task-prompt-review.md` thinned sections alone. Missing injected overlay when one is configured = incomplete dispatch.

4. **Chat handoff** — default user output is findings-first per [output.md](references/output.md): header → Action finding blocks with `Theme: …` → at most one `Continuity:` line when themes remain open/reopened → synthesis. Carry the full theme table + sweeps in **member prompts** ([fix-loop-ledger.md](references/fix-loop-ledger.md)), not in default chat. Leave out `## Fix-loop` / theme tables / `## Baseline contradictions` unless the user asked `include continuity` / `show ledger`. On green: omit Continuity; if an old leftover review ledger file is present, delete it. Re-review reconciles every candidate to a stable theme.

**Order when fix-loop applies:** council → synthesis → findings (+ Continuity if open) → cleanup leftover file if green → end turn.

**Merge gate (human):** Merge-ready / “final blockers” language is allowed only when the [fix-loop exit gate](references/fix-loop-ledger.md#exit-gate) passes. Zero findings alone is insufficient.

## Anti-thrash preflight

Run this before step 3 on every `pr`, `review vs main`, and `merge` review — **not** only when this chat already has prior review output. Bare `review vs main` in a **new** chat is the common thrash entry; treat it as a continuity check, not a fresh baseline. Continuity comes from prior findings (`Theme:`), PR body, and git tip/hotspot archaeology.

1. **Detect repeated review** — MUST treat as repeated when any is true:
   - Same branch/thread as a prior `Review · …` pass, or user asked to re-review after fixes.
   - Bare prompts (`review`, `review vs main`, `check the PR`) with no prior themes in the message.
   - Same branch with recent review-fix commits after a Full/Thorough Action pass.
   - **Commit-stack thrash:** tip history shows **≥2** consecutive commits that mostly touch the same hotspot file(s) / subsystem after an earlier broad Action pass (micro-fix trail).
   - Prior `Review ·` synthesis, `Theme:` finding lines, or theme table in commit messages or PR body; or an old leftover review ledger file from earlier skill versions (read once if present).
2. **Reconstruct themes** — rebuild the stable-theme table for dispatch from, in order ([fix-loop-ledger.md](references/fix-loop-ledger.md)):
   1. In-message synthesis / finding `Theme:` lines (if present).
   2. Prior synthesis embedded in PR body (if present).
   3. Recent commit messages containing a `theme_id` or `Review ·` block.
   4. Old leftover review ledger file (if present): read once for continuity.
   5. **Provisional themes from archaeology** when 1–4 miss: `git log` + hotspot paths from the micro-fix trail (one provisional `theme_id` per repeatedly patched invariant/family). Keep for member prompts / coordinator state.
      Do not reset closed themes. Missing chat context alone MUST NOT imply `first-baseline`.
3. **Classify the request** (record in dispatch plan and synthesis header as `Pass class:`):
   - `first-baseline` — no prior Action findings for this diff/PR **and** no recoverable themes / commit-stack signal from steps 1–2.
   - `fix-implementation` — user asked to implement/address findings (not a re-review yet).
   - `closure-re-review` — re-review after fixes; recoverable themes **and/or** commit-stack thrash; latest tip commit(s) only touch prior themes / their sweep surfaces / multi-pass hotspots. **Default** when step 1 detects repeated review. Still `closure-re-review` when themes look closed but the tip is another narrow patch on the same hotspot (verify exit gate — do not Full-baseline).
   - `new-scope-review` — re-review where scope materially expanded (new subsystems, new boundaries outside reconstructed themes), chat/PR/git archaeology all fail to bound themes, or contradictions unresolved.
4. **Choose depth lane** — `closure-re-review` → MUST prefer [targeted contextual re-review](references/modes.md#contextual-re-review) over another Full baseline council. Whole-branch file/line size thresholds MUST NOT alone promote to Full on this lane ([modes.md](references/modes.md)). Promote to Full contextual only when [modes.md](references/modes.md) § Contextual re-review lists a qualifying reason **other than** size alone. `new-scope-review` and `first-baseline` follow normal escalation.
5. **Thrash signal** — if the prior pass filed **two or more** Action blockers in the same subsystem / theme family, the same `theme_id` **reopened** on pass 2+, **or** the tip is another micro-fix on a multi-pass hotspot, MUST NOT spawn a symptom-hunting Full council. Require a [same-invariant sweep](references/fix-loop-ledger.md#same-invariant-sweep) for that family before filing more Action blocks; MUST NOT claim merge-ready until variant coverage is explicit. For [high-dimensional contract](references/fix-loop-ledger.md#high-dimensional-contract-themes) themes (parsers/classifiers), refuse theme `closed` until the matrix checklist is complete.
6. **Green cleanup** — when exit gate passes or zero themes are `open`/`reopened`, and an old leftover review ledger file is present, delete it.

**Routing:** PR description / body → separate authoring skill. Review / check / analyze → here.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

**Fix implementation:** User "address all" / "fix all" / "yes" to ship-blockers → read prior synthesis and themes (findings / git archaeology) before coding; implement invariant-complete theme batches; add regression evidence; run the repo’s authoritative validation lane; end with findings + Continuity line if themes remain open (full theme table only if user asked `show ledger` / `include continuity`). On green, delete any leftover review ledger file if present.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Review findings use [references/output.md](references/output.md) — scannable finding blocks, synthesis header, Action vs Noted/Deferred tiers per [merge-blockers.md](references/merge-blockers.md).
