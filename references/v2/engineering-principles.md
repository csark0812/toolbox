# Engineering principles

<!-- source-of-truth: portable engineering principles that skills cite when a principle changes a decision -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

**Portable ambient reference.** It is a menu of named principles, not a workflow. Open it when a decision is in play. Module-boundary vocabulary (deep module, seam, explicit complexity) lives in [codebase-design.md](../codebase-design.md). This file does not repeat it.

**Citation rule.** When a principle changed a decision, name the principle and the decision it changed. Cite only principles whose entry you read in this session. A principle you name without a changed decision is decoration. Leave it out.

## Verification

**Prove it works.** Apply when any output is about to be called done. Check the real artifact: run the feature path, read the actual value, and inspect the diff or runtime behavior, not a delegate's summary. If verification fails, suspect the way you observed it before you suspect the system. Prefer a rerunnable script over a one-time look. _Test:_ could a reviewer rerun your proof without trusting your words?

**Fix root causes.** Apply when something is broken. Reproduce, then ask "why" until the first wrong decision appears. A guard is a fix only when the guarded state is legitimate. Fix the pattern, not only this instance. After a restart failure, suspect persisted state (config, caches, locks) before code.

**Attack the premise.** Apply after two fixes that share one assumption have failed the same check. Write that assumption as one sentence. Test it with an observation that would differ if it were false, before you try a third fix.

**Explain the number.** Apply to every measured result. Name the limiter ("why not double?") from a profile or counters, not from reading code. Rule out errors, skipped work, cached work and an untuned side. Keep the run count, spread and limiter with the number. The full procedure is in [measurement.md](measurement.md).

**Sequence verifiable units.** Apply to sweeps, migrations and multi-step changes. Each unit starts from a known-good state, makes one change, and ends in a check that passes before the next unit starts. Order commits so they read as an argument: failing test, then fix; baseline, then treatment.

**Test behavior, not implementation.** Apply when writing or reviewing a test. Imagine two edits. First, break the behavior: the test must fail. Second, restructure the internals without changing what users observe: the test must still pass. Derive the expected value from the requirement, never from a run of the code under test.

## Design

**Subtract before you add.** Apply before building on an existing system. Remove dead paths, speculative validators and stubs first, then build on the simpler base. Prefer the smallest diff. Build for observed usage, not imagined edge cases. If a human maintainer would find the result tiring to keep alive, it is too much.

**Minimize reader load.** Apply when adding a layer or a piece of state. Count the layers a reader must trace and the state they must hold. Inline single-caller wrappers. Narrow state scope: returns over mutation, locals over fields, derived over synced. _Test:_ can a new reader answer "where does X come from, and what can change it?" in 30 seconds?

**Model the domain.** Apply before writing logic that branches on the domain. Choose the structure first: a state machine, a typed model, a registry or lookup, a reducer, or a discriminated union. Do not grow an if/else chain or sync a second boolean. Do not force an abstraction that removes no branches, duplicated rules or invalid states.

**Type-system discipline.** Apply in typed code. Make illegal states unrepresentable. Brand primitives that mean different things. Parse untyped input once at the boundary. Avoid casts. Keep matches exhaustive. Derive types from authoritative schemas instead of duplicating them.

**Boundary discipline.** Apply when deciding where validation goes. Validate and handle errors at system edges such as CLI args, config, network and external APIs. Inside the system, trust the types. Keep business logic in pure functions behind a thin shell.

**Make operations idempotent.** Apply to anything that mutates state and can be retried or restarted. Ask what happens if it runs twice, and if the previous run crashed at any point. Converge from the current state, and make leftovers recognizable as stale.

**Migrate callers, then delete the old API.** Apply when a new API replaces an old one and no external user needs compatibility. In the same wave, inventory the callers, migrate them and delete the old path. A compatibility adapter is a time-boxed exception, not architecture.

**Separate before serializing shared state.** Apply when concurrent actors (agents, workers, processes) touch the same mutable target. First give each actor its own file, key, branch or directory, and merge only when reading. Serialize structurally (lock, single writer, sequential phase) only when one shared target is a real invariant. Instructions are not concurrency control.

## Leverage

**Build the lever.** Apply when the same edit, check or setup would repeat more than a few times. Do the first few by hand to learn the recipe, then write the codemod, script or check. Commit the lever when the work outlives the session. Never build one for a one-off.

**Encode lessons in structure.** Apply when an instruction or correction comes up a second time. Turn it into a lint rule, type, runtime check, test or script whose error names the fix. Then delete the prose instruction. If it truly needs judgment, keep the instruction and add an example of the failure.

## Attribution

Adapted and condensed from the `principle-*` skills in [pstack](https://github.com/backnotprop/pstack) (mirror of `cursor/plugins/pstack`). Copyright (c) 2026 Lauren Tan, MIT License. The MIT permission notice applies to the adapted portions.
