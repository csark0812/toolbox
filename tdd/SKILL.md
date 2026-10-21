---
name: tdd
description: Use whenever the user asks for a new function, parser, command option or feature and mentions tests, test-first, TDD or a review before done. Red-green slices at the public interface, command tests on real data, independent review. Not hard-bug repro or spikes.
when_to_use: Requests such as "add a function that ... and a flag to the CLI, test-first", "implement this feature with tests", "write this with TDD", "build it and get it reviewed before you finish".
---

# Test-Driven Development

<!-- source-of-truth: test-first implementation at public seams. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

**Process skill** — red → green microcycle. Tests at public interfaces only. Shared vocabulary → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/process-skill-composition.md).

References: [anti-patterns.md](references/anti-patterns.md) · [output.md](references/output.md) · [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/codebase-design.md) · [engineering-principles.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/engineering-principles.md) (test behavior, not implementation; sequence verifiable units).

Read [research-basis.md](references/research-basis.md) only when you calibrate seam claims.

## Entry gate

- **Seam** — the public interface under test. An interface the user names in the request is agreed. Otherwise propose one (`Seam:` header) and get agreement.
- **Slice** in scope — path glob or module id shared with other active atoms when layered.
- **Decide, don't stall.** When an edge case has a reasonable, reversible answer, pick it, implement it, and name the choice in your reply. Ask before acting only for irreversible or product decisions. Never end a requested change with no change made.
- If no seam is named or agreed, stop and ask. Do not write production code or tests at private helpers only.

## Non-negotiables

1. **Red before green** — one vertical slice per cycle.
2. **Independent expected values** — not tautological to production logic. Cover the interface the way callers will use it: each optional argument left out, and repeated cases beyond the first, such as the tenth collision as well as the second. Test behavior, not text: assert what callers and users observe, such as computed results across time and week boundaries, never the source text. Test hostile input: wrong types, a trailing newline, `NaN`, `Infinity` and numeric strings. Check every value passed to a platform API against that API's limits, such as `setTimeout` above 2^31−1 ms or integer overflow. Put output exactly where and how the request says, such as which stream, which line and which format. Read each returned field the way its name tells a caller, and say which reading you chose when it is ambiguous.
3. **Test every entry the request names.** Keep the logic in an exported function under `src/`, so the command only parses arguments and prints. A command gets its own tests that spawn it on the repository's real data and check stdout, stderr and the exit code exactly, including the unchanged output without the new option and each bad value the request names. Change only what the request asks for: leave existing options, exit codes and messages as they are.
4. **Refactor out of scope** — defer cleanup of existing structure unless the user asks.
5. **Bugs in the slice are in scope.** A bug found in code the slice calls or changes, which would make the requested behavior wrong, gets its own failing test and fix. Never leave a known correctness bug in the slice. Report a bug outside the slice with its location, without fixing it.
6. **Independent review before done.** When the user asks for review, give a fresh subagent the request and the final diff, or, without one, review it yourself from the request alone. The review runs hostile input against the code and breaks each rule in a scratch copy to find rules no test catches. Give each real finding a failing test, then fix it. After the last fix, rerun the tests and the command, and report what the review found.
7. **Name every open decision.** For each case the request leaves open, such as spacing, repeated options, rounding or the exit code after a skipped item, pick a reasonable answer, test it and list it in the reply as one line. End with verbatim sample output for the example the user gave.

**Work lean.** Read each file once, batch independent commands in one call, and keep command output short, for example with a summary reporter or `| tail -20`.

## Workflow

1. Make sure that **Seam** and **Slice** are agreed.
2. Failing test → red → minimal green → stop.
3. Report per [output.md](references/output.md). User-facing report uses clear English.

## Exit artifact

Per [output.md](references/output.md) — seam, cycle summary, test path citations.

**Reply check.** Every result you state names a command that appears in your actions and ran after your last edit: say `node --test` if that is what ran, not `npm test`. Claim a clean tree only after `git status`, and claim a test failed first only when that failing run is shown.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/output-schema.md). Details → [references/output.md](references/output.md).
