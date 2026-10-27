---
name: tdd
description: Load first, before reading code, whenever the user asks to add or change behaviour (a function, parser, CLI option or API field with rules, limits, formats or exit codes), even when tests are never mentioned. Pins each rule at the public interface before code, then runs the real command. Not bug reports, renames, refactors, styling or several separate jobs.
when_to_use: Requests such as "add parseX(text) and a --since flag", "accept 3-7, exit 2 otherwise", "support this new format", "build it test-first".
---

# Test-Driven Development

<!-- source-of-truth: test-first implementation at public seams. -->
<!-- doc-meta: owner=eng -->

**Process skill** — red → green microcycle. Tests at public interfaces only. Shared vocabulary → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/process-skill-composition.md).

References: [anti-patterns.md](references/anti-patterns.md) · [output.md](references/output.md) · [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/codebase-design.md) · [engineering-principles.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/engineering-principles.md) (test behavior, not implementation; sequence verifiable units).

Read [research-basis.md](references/research-basis.md) only when you calibrate seam claims.

## Entry gate

- **Seam** — the public interface under test. One the user names is agreed. Otherwise propose one (`Seam:` header) and get agreement.
- **Slice** in scope — path glob or module id shared with other active atoms when layered.
- **Decide, don't stall.** Pick a reasonable, reversible answer and name it in your reply; ask first only for irreversible or product decisions. Never end a requested change with no change made.
- If no seam is named or agreed, stop and ask. Do not write production code or tests at private helpers only.

## Non-negotiables

1. **Red before green** — one vertical slice per cycle.
2. **Independent expected values** — not tautological to production logic. Cover each optional argument left out and repeats beyond the first (the tenth collision). Assert observed results, such as across time and week boundaries, never source text. Test hostile input: wrong types, a trailing newline, `NaN`, `Infinity`, numeric strings. Check values passed to platform APIs against their limits, such as `setTimeout` above 2^31−1 ms. Test both sides of every boundary: the last valid value (top of a range, latest real calendar date) is accepted, the first invalid one rejected. Read each returned field as its name tells a caller; name your reading when ambiguous.
3. **Test every entry the request names.** Keep the logic in an exported function in the module owning similar logic; the command only parses arguments and prints. A command gets its own tests that spawn the script's entry file with `node` (`process.execPath`), not npm, on the repository's real data. Assert stdout and stderr by exact equality (regex only for machine-varying text) and the exit code, without the new option (unchanged output) and for each bad value the request names. Never change the environment in a test to silence warnings. Put output exactly where the request says (stream, line, format). Change only what the request asks; leave existing functions, options, exit codes, messages and storage alone. Hostile input the rules cover, or that would crash or mis-compute, is in scope: test and fix it. Where options are documented, document each new one with its input notation and any formula the user stated, not just the usage line.
4. **Refactor out of scope** — defer cleanup of existing structure unless the user asks.
5. **Bugs in the slice are in scope.** A bug in code the slice calls or changes that makes the requested behavior wrong gets its own failing test and fix. Report a bug outside the slice with its location, without fixing it.
6. **Independent review before done.** When the user asks for review, give a fresh subagent the request and the final diff (or, without one, review it yourself from the request). It runs the command as the user does, tries hostile input and breaks each rule in a scratch copy to find untested rules. Each real finding gets a failing test, then a fix; rerun the tests and the command after the last fix. If anything changed after the review, have a reviewer check the final diff before you reply. Report what each pass found.
7. **Reject only what the request rejects.** A qualifier the request states ("in either case", "any spacing") applies to every token it attaches to. Each rejection branch cites the request sentence that requires it (an "anything else" clause counts); a branch with no citation becomes an offer in the reply, not a throw. Before calling an input invalid, grep the repository's real data for it; if real data would be rejected, re-read the request and pick the reading that accepts it. For each case the request truly leaves open (repeated options, rounding, the exit code after a skipped item), pick an answer, test it and list it in one line. End with verbatim sample output for the user's example.

**Work lean.** Read files together, batch independent commands, keep output short (`| tail -20`). Write each test or source file whole, in one go, not via sed or python patch chains. After your last edit, run the final check (tests and the user's command) as one short call of its own, and quote a few output lines in the reply. Stop once the result and its scope check are verified.

## Workflow

1. Make sure that **Seam** and **Slice** are agreed.
2. Failing test → red → minimal green → stop.
3. Report per [output.md](references/output.md), in clear English.

## Exit artifact

Per [output.md](references/output.md) — seam, cycle summary, test path citations.

**Reply check.** Every result you state names a command that appears in your actions and ran after your last edit: say `node --test` if that is what ran, not `npm test`. Claim a clean tree only after `git status`, and claim a test failed first only when that failing run is shown.

## Consumer bindings

Project-specific context can arrive when the skill loads. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/output-schema.md). Details → [references/output.md](references/output.md).
