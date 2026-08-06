# How to review

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Review procedure for primary agents and subagents. Acquire the diff first ([sources.md](sources.md)); file per [merge-blockers.md](merge-blockers.md); shape output per [output.md](output.md).

## Steps

1. **Scope** — confirm what the diff covers (adapter id, paths, base branch). Ask if ambiguous.
2. **Read** — diff hunks plus enough surrounding code to judge behavior (callers, types, tests when they exist).
3. **Trace** — for each change, follow: happy path, error path, null/empty input, auth boundary, persistence, concurrency/async.
4. **Evidence** — every Action finding needs `path:line`, how a real user or caller hits it, and what breaks.
5. **Synthesize** — merge duplicate symptoms into one finding; route polish and test gaps to Deferred unless improvements mode is on.

## What to look for

| Area            | Questions                                                                        |
| --------------- | -------------------------------------------------------------------------------- |
| **Correctness** | Wrong branch, off-by-one, stale state, missing reset on navigation/lifecycle     |
| **Contracts**   | API shape drift, broken invariants, unchecked assumptions across module boundary |
| **Errors**      | Swallowed errors, wrong status codes, partial failure leaving bad state          |
| **Security**    | Authz bypass, injection, secret leakage, trust boundary crossed                  |
| **Data**        | Loss, corruption, race, idempotency break                                        |
| **UX reach**    | User-visible wrong behavior on a path the diff affects                           |

Skip drive-by refactors and style unless the user opted into improvements mode.

## Evidence bar

- **Introduced-only** — default: defects the diff introduced or newly exposed. Pre-existing bugs → **Noted** tail with `pre-existing` unless they block the changed path.
- **Reachability** — name the trigger (user action, API call, config). Append `· Needs confirmation` when reachability is unproven.
- **No speculation** — if you cannot name trigger + impact, do not file Action.
- **Tests** — missing tests alone ≠ Action unless tied to a reachable untested bug on a changed path.

## Filing

Default **merge-blockers only** — [merge-blockers.md](merge-blockers.md).

## Output

Always [output.md](output.md). Review status lines (`No merge-blockers in scope.`, counts) only when the user asked merge-readiness or ship.
