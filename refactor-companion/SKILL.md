---
name: refactor-companion
description: Load first, before reading code, whenever the user asks to rename, move, merge, tidy up, replace or migrate existing code, files, fields or an API while output stays the same, even a one-word rename. Finds hidden uses of old names, migrates every caller and proves output unchanged. Not new features or read-only review.
when_to_use: Requests such as "rename this module and update its callers", "replace these booleans with one enum", "consolidate these two APIs", "migrate X to Y without changing behavior".
---

# Refactor companion

<!-- source-of-truth: evidence-led refactor collaboration from target design to proven cutover. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-22 -->

Preserve the developer's target design while changing existing code in small, coherent, proven slices. Read facts first. Ask only for material human decisions. Remove obsolete design residue and protect unrelated work.

Internal record → [refactor-card.md](references/refactor-card.md). Mode selection → [interaction-modes.md](references/interaction-modes.md). Slice proof → [slice-proof.md](references/slice-proof.md). Cutover rules → [residue-and-cutover.md](references/residue-and-cutover.md). User-facing reports → [output-format.md](references/output-format.md).

Extended design vocabulary is available in [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/codebase-design.md). Named principles for slice decisions (subtract before you add, migrate callers then delete) are in [engineering-principles.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/engineering-principles.md). The core workflow remains complete without companion skills.

Composition boundaries → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/process-skill-composition.md).

## Entry gate

- The user authorizes edits to an existing code surface.
- The task replaces, simplifies, migrates, cuts over, reassigns ownership, or removes an old design shape.
- A repository, branch, worktree, commit, pull request, or named path is in scope.
- If the request is analysis-only, stay read-only and explain that implementation is not active.
- If no concrete surface exists, ask for one. Do not invent code from a scenario description.

## Core contract

1. Treat the developer's stated target, required shape, and prohibited shape as design authority.
2. Inspect current behavior, callers, contracts, tests, local style, and worktree state before editing.
3. Ask only when a material human-owned decision remains after repository inspection. **Decide, don't stall.** When an edge case has a reasonable, reversible answer, pick it, implement it, and name the choice in your reply. Ask before acting only for irreversible or product decisions. Never end a requested change with no change made. When merging or moving code, move every related piece the request implies and delete the emptied module, rather than leaving a stray helper behind.
4. Never reopen a resolved decision unless new evidence conflicts with it. Show that evidence first.
5. Define one coherent slice and its proof before editing. **A rename or move changes only the identifiers the user named.** Config keys, data fields, file and column names, CLI flags, printed labels, and anything read from or written to disk or by another program stay exactly as they are unless the user names them. Where the old word must stay, translate it at that boundary, in the one place that reads or writes it, never as an alias in core code. Check that every config value still reaches the code, not a renamed default. Do not widen the public API.
   When behavior must stay the same, write one before/after script before the first edit: it runs every entry point and every command form the user named over representative inputs, including edge cases and every caller's input shape, and saves the outputs. Run it once before and once after your last edit, and report the count compared and any differences. Prefer it to many ad-hoc commands. Existing tests alone do not prove behavior unchanged.
   Before the first edit, find every indirect use of an old name: labels or keys built from identifiers, `Object.keys` output, names in data or config files, and lookup strings. Replace derived labels or keys with explicit data or a small table. Core code and its unit tests use only the new name.
   When merging or renaming copies, diff them first. List every behavior difference, such as an odd value counted in one copy and not the other, with the records it affects, even when output stays identical.
6. Implement, prove, and inspect the slice for residue from the old design.
7. Continue automatically while the next slice follows from agreed decisions and stays in scope.
8. Stop at contract, authority, scope, or evidence boundaries.
9. Preserve unrelated work. Git state changes need explicit user authority.
10. Use clear English for previews, questions, progress, and reports.
11. Cite every repository-backed claim in user-facing output as `file:line`.

## Refactor card

Keep this record internal and current:

```text
Outcome:
Invariants:
Required shape:
Prohibited shape:
Style evidence:
Resolved decisions:
Open decision:
Current slice:
Proof:
Stop if:
```

Do not dump the card into routine user updates. Details → [refactor-card.md](references/refactor-card.md).

## Choose the current mode

| Mode                        | Use when                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Discovery before change** | Behavior, consumers, or invariants are unclear                           |
| **Decision checkpoint**     | Two credible choices change behavior, ownership, compatibility, or scope |
| **Direct slice**            | Target, contract, and scope are clear                                    |
| **Cutover sweep**           | A path, concept, or abstraction was replaced                             |

Read [interaction-modes.md](references/interaction-modes.md).

## Behavior and handoff

Record approved deltas separately, and never turn known defects into the target contract. For compatibility/defensive paths inspect targeted history and distinguish recorded rationale from inference. Reopen only affected decisions when repeated workarounds, caller leakage, type escapes or conflicting lifecycle needs supply evidence.

When composed, return changed source identity, affected parts, proof and residue to the outer owner without advancing its cursor. A direct invocation owns its temporary refactor card. Revalidate integrated output rather than combining green slice claims.

**Work lean.** Read files together in one call, batch independent commands, and keep output short, for example `| tail -20`. A reader of the log sees only the start of a long command, so put what matters first. After your last edit, run the before/after script and the tests as one short call of its own, and quote a few lines of its output in the reply. Stop once the result and its scope check are verified.

## Slice loop

1. Bind the worktree, scope, and protected unrelated changes.
2. Fill the card from the request and repository evidence.
3. Select the current mode.
4. For a direct slice, state its outcome, change, scope, proof, and stop condition in compact form.
5. Make the smallest coherent edit that expresses the target design.
6. Run focused proof and inspect the changed path for old names, duplicate paths, wrappers, contracts, tests, fixtures, mocks, docs, and telemetry.
7. Remove confirmed in-scope residue or retain it for a named live reason.
8. Update the internal card. Continue or report the exact boundary.

## Questions

Before asking, search callers, read the controlling contract, inspect nearby accepted code, and remove choices that evidence settles.

When a human decision remains:

- show the controlling evidence;
- ask one decision branch with one to three lettered options;
- mark one recommendation when evidence supports it;
- pause without editing the disputed shape.

Do not ask for repository facts or routine edit permission inside an agreed slice.

## Boundaries

- Stop when the requested shape conflicts with a live caller, public contract, user decision, authority boundary, or coherent scope.
- Separate source failures from missing dependencies, unavailable services, permissions, and other environment limits.
- A green test does not prove that the target architecture exists. Use caller, contract, search, diff, and runtime evidence as relevant.
- Do not turn uncertainty into speculative cleanup.
- Do not commit, push, merge, reset, rebase, or clean unless the user explicitly authorizes that action.

## Finish

Use [output-format.md](references/output-format.md). List the callers migrated, outside names kept, behavior differences found, the before/after comparison (inputs compared, differences found) and every changed file from `git status`. **Reply check.** Every result you state names a command that appears in your actions and ran after your last edit: say `node --test` if that is what ran, not `npm test`. Claim a clean tree only after `git status`, and claim a test failed first only when that failing run is shown. Offer an installed walkthrough or formal review as a next action. Do not activate either automatically or present this process as merge readiness.

## Consumer bindings

Project instructions supply local contracts, validation commands, and accepted style evidence. Do not edit installed copies in place.
