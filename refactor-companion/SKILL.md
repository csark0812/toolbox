---
name: refactor-companion
description: >-
  Collaborate with a developer through a full refactor loop: clarify intent,
  model the target design, ask focused questions, implement small slices,
  match the developer's local code style, simplify leftover abstractions, and
  validate each step. Use when a developer is vibe-coding a branch or asks to
  refactor, rewrite, simplify, cut over, replace architecture, or prepare the
  resulting code for review or handoff.
---

# Refactor companion

<!-- source-of-truth: iterative refactor collaboration from intent to handoff. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-08-30 -->

**Process skill** — guide one developer through an intent-led refactor. Keep
the developer's logic visible in the work. Optimize for code that reads like
the developer wrote it, not generic agent code.

References: [`grill`](../grill/SKILL.md) · [`review-walkthrough`](../review-walkthrough/SKILL.md) · [`code-review`](../code-review/SKILL.md) · [shared code-design vocabulary](../.skeleton/references/codebase-design.md).

## Entry gate

- The developer asks for implementation, refactoring, rewriting, simplification, a cutover, an architecture replacement, or review preparation.
- A repository, branch, working tree, commit, pull request, or named code path is in scope.
- The desired behavior or design is stated, implied by the task, or ready to shape through focused questions.
- Edit authority exists for the current work. If the request is analysis-only, stay read-only and route to [`code-review`](../code-review/SKILL.md) or [`review-walkthrough`](../review-walkthrough/SKILL.md).

If the task has no concrete code surface, ask for one. If the design has
several unresolved architecture branches, route the dialogue to [`grill`](../grill/SKILL.md) before implementation.

## Non-negotiables

1. Treat the developer's stated refactor logic as the design authority. Do not silently replace it with a convenient pattern.
2. Keep a conversation-local refactor model with goals, constraints, invariants, required shape, prohibited shape, decisions, rejected alternatives, evidence, and the next slice.
3. Ask only for human decisions. Read the repository for facts. Ask one focused question at a decision boundary, then pause.
4. Work in one small coherent slice at a time. State the slice intent and proof target before editing.
5. Match local idioms from evidence. Do not copy local defects, stale structure, or accidental complexity.
6. Stop when code conflicts with the refactor model. Show the exact conflict and ask the developer to choose before changing the design.
7. After each slice, inspect the changed path for residue from the previous design. Do not defer an obvious, in-scope simplification to human review.
8. Preserve unrelated work. Do not commit, push, merge, reset, rebase, or clean unknown changes unless the developer explicitly requests that action.
9. Finish with focused proof and a review handoff. Do not claim that this process replaces tests, walkthroughs, or formal review.

## Refactor model

Maintain this model in the conversation. Update it after every decision and
slice. Do not create a project file unless the developer requests one.

```text
Goal: the result the developer wants
Current behavior: the path that exists now
Target behavior: the path that must exist after the refactor
Invariants: behavior, contract, safety, and data rules that remain true
Meaningful complexity:
- Source:
- Domain name:
- Owner:
- Public contract:
- Failure and recovery behavior:
- Test seam:
Required shape: structures or ownership the developer explicitly wants
Prohibited shape: structures the refactor must not introduce or retain
Style evidence: nearby code and accepted patterns that define local idioms
Decisions: choices already made
Rejected alternatives: choices no longer under consideration
Open decisions: choices that need the developer
Evidence: code, tests, commands, and search results
Next slice: one bounded change and its proof target
```

Use the complexity map for each meaningful source of state, temporal identity,
async lifecycle, cross-context coordination, cache mutation, retry, recovery,
policy, side effect, or trust boundary. Keep the model short. Record only
decisions that affect implementation, architecture, style, scope, or proof.

## Collaborative loop

### 1. Bind the work

Read the repository instructions, relevant package scripts, the named code,
nearby implementations, callers, tests, and applicable contracts. Inspect
the working-tree state before editing. Treat existing branch changes as
developer-owned until proven unrelated.

Record the source, scope, current revision when relevant, and unrelated work
that must remain untouched. Do not widen the scope because nearby code looks
interesting.

### 2. Learn the developer's code

Sample the closest working examples before choosing an implementation shape.
Look for:

- Functions, classes, records, hooks, and module boundaries.
- Naming, argument order, return shapes, and error handling.
- Control-flow style, early returns, callbacks, async patterns, and ownership.
- Test setup, fixture shape, assertion style, and test naming.
- Comment density, documentation style, and the level of abstraction used.
- Recent accepted changes when branch history provides them.

Follow the strongest local pattern. Do not average contradictory examples. If
the developer's stated preference conflicts with local code, ask which one
defines the target. Preserve correctness, security, and explicit contracts.

### 3. Shape intent before code

Fill the refactor model from repository evidence and the developer's request.
Separate these statements:

- What the code does today.
- What the developer wants it to do.
- Which design shape carries that behavior.
- Which historical shape must disappear.
- Which constraints remain in force.

State required and prohibited shapes explicitly. Map each meaningful
complexity to a domain name, one owner, its contract, failure/recovery
behavior, and a test seam. Include ownership and source of defaults. Include
behavior counts when the choice concerns wrappers, entrypoints, classes,
records, or duplicated logic.

### 4. Ask at decision boundaries

Ask a question when two credible designs remain, when code conflicts with the
model, or when a choice changes ownership, public shape, behavior, or scope.

Use one to three lettered options from one decision branch. Mark one option as
recommended when a clear fit exists. Ask in plain language. Pause after the
question. Do not bury a question inside a progress report.

Do not ask for repository facts. Read them. Do not ask permission for routine
edits inside the agreed slice. Ask before changing the stated design.

### 5. Choose one implementation slice

State the slice in four short parts:

1. Intent — what changes for the user or system.
2. Shape — which owner, boundary, or abstraction changes.
3. Scope — exact files, symbols, and related tests.
4. Proof — the focused search, test, typecheck, or runtime signal.

Prefer a direct readable path. Keep compatibility code only when a named
consumer or contract requires it. Keep a wrapper only when it owns an
independent policy, boundary, behavior, or supported extension point.

### 6. Implement and inspect

Make the smallest coherent edit that satisfies the slice. Then inspect the
result as a refactor author, not only as a test author.

Ask:

- Does the code express the target design directly?
- Does each meaningful complexity have a named owner and an observable seam?
- Does the ownership match the refactor model?
- Does the code use the developer's established idioms?
- Did the old entry point, fallback, retry, callback wrapper, or contract survive without a current reason?
- Did one behavior gain multiple names or paths?
- Did a generic helper keep historical structure while serving one caller?
- Do names, comments, tests, fixtures, mocks, and docs describe the current design?

Collapse or remove confirmed residue in the same slice. Do not start a
separate cleanup project.

### 7. Prove the slice

Use the strongest cheap evidence available:

- Search removed symbols, aliases, exports, old terms, and old message names.
- Trace callers and consumers of the changed boundary.
- Inspect the diff and run `git diff --check`.
- Run focused tests and type checks for the changed path.
- Run the repository's normal validation when the slice is complete.
- Use runtime or end-to-end proof only when the task requires it and the environment supports it.

For each mapped complexity, verify the owner, contract, failure/recovery
behavior, and seam against code or tests. Separate source failures from
missing dependencies, unavailable services, permission errors, cache failures,
and other environment limits. A green test does not prove that the
architecture matches the refactor model.

Update the evidence and decisions in the model. Choose the next slice only
after the current slice has proof or a clearly stated limitation.

### 8. Repeat without thrashing

Continue automatically when the next slice follows from an agreed decision
and no material conflict exists. Re-read the current code after each slice.

Pause for the developer when:

- The implementation exposes a new design choice.
- The stated logic conflicts with an existing contract or live caller.
- Two abstractions have different plausible owners.
- The requested shape changes behavior or compatibility.
- The next edit expands beyond the agreed scope.

When a pause is necessary, show the current evidence, the competing choices,
and the smallest decision needed to continue.

### 9. Run the final simplification pass

Before review or handoff, trace every removed or replaced pathway through:

- Callers, exports, routes, and entrypoints.
- Public contracts, types, messages, schemas, and adapters.
- Names, comments, docs, telemetry, and error text.
- Tests, fixtures, mocks, and snapshots.
- Helpers, callbacks, retries, fallbacks, and compatibility layers.

Retain an abstraction only when it has an independent live reason to exist.
Remove, inline, merge, or rename confirmed residue. Search again for removed
symbols and old concepts. Make sure the final diff reflects the target
architecture and contains no unrelated refactor.

## Stop conditions

Stop editing and report the boundary when:

- The developer has not chosen between material design alternatives.
- Current code or an external contract conflicts with the stated logic.
- A proposed simplification depends on unknown external consumers.
- The next change needs a new requirement, new authority, or a wider scope.
- The remaining abstraction has a real independent caller, policy, boundary, behavior, or extension reason.
- Validation cannot distinguish a source problem from an environment problem.
- The diff no longer represents one coherent refactor.

Do not turn uncertainty into a speculative cleanup. Route unresolved design
intent to `grill`. Route a written plan critique to `second-opinion`. Route a
runtime symptom to `probe`.

## Handoff

Use this compact report after a slice or at completion:

```markdown
Refactor companion · source:[adapter] · Scope:[paths] · Slice:[name]

Intent: [one sentence]
Decision: [the design choice applied]
Change: [what changed and why it matches the model]
Complexity: [named state/lifecycle/policy, owner, contract, failure/recovery behavior, and seam]
Style: [local evidence followed]
Residue: [removed, retained with reason, or none found]
Proof: [searches, tests, typechecks, runtime evidence, and limits]
Next: [next slice, focused question, or handoff]
```

At completion, route the final code to [`review-walkthrough`](../review-walkthrough/SKILL.md) for a story-first explanation and [`code-review`](../code-review/SKILL.md) for independent review. Do not present this report as a merge-readiness result.

## Non-goals

- Generic lint cleanup or dead-code hunting without a refactor model.
- Replacing the developer's design with a framework pattern.
- Copying local defects to imitate style.
- Broad architecture redesign outside the agreed refactor.
- Formal review findings, merge decisions, commits, pushes, or pull-request actions.

## Consumer bindings

Project-specific instructions, validation commands, contracts, and style
evidence come from the consumer repository. Do not edit installed copies in
place.

## Output format

Use the compact handoff format above. User-facing questions and reports use
pragmatic Simplified Technical English.
