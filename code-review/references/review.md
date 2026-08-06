# How to review

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Review procedure for primary agents and subagents. Acquire materials first ([sources.md](sources.md)); file per [merge-blockers.md](merge-blockers.md); shape output per [output.md](output.md).

Works for **any surface** — git diff, whole module, path list, paste, multi-repo path, or user-described scope — and **any lens** the user names (table rows are examples, not limits).

## Steps

1. **Scope** — confirm surface adapter, paths, and lens. Ask if ambiguous.
2. **Read** — change hunks **or** full in-scope files plus callers, types, tests when they exist.
3. **Trace** — happy path, error path, null/empty input, auth boundary, persistence, concurrency/async.
4. **Evidence** — every Action finding needs `path:line`, trigger, and impact.
5. **Synthesize** — merge duplicates; route polish to Deferred unless improvements/cleanliness lens is on.

## What to look for (by lens)

| Lens                  | Emphasize (extend when user names another focus)                                              |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **general** (default) | Correctness, contracts, errors, data, UX on paths the surface touches                         |
| **security**          | Authz, injection, secret handling, trust boundaries, unsafe defaults                          |
| **cleanliness**       | Naming, structure, duplication, readability — file as improvements / Deferred per filing mode |
| **merge-readiness**   | Same as general + explicit ship/no-ship status                                                |
| **user-named**        | Prioritize what the user asked; keep base checklist as background scan                        |

Base checklist (all lenses):

| Area            | Questions                                                                   |
| --------------- | --------------------------------------------------------------------------- |
| **Correctness** | Wrong branch, off-by-one, stale state, missing lifecycle reset              |
| **Contracts**   | API drift, broken invariants, unchecked assumptions                         |
| **Errors**      | Swallowed errors, wrong codes, partial failure state                        |
| **Security**    | Authz bypass, injection, leakage (always scan lightly even on general lens) |
| **Data**        | Loss, corruption, race, idempotency                                         |
| **UX reach**    | User-visible wrong behavior on reachable paths                              |

## Evidence bar

| Surface shape                     | Default bar                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Change-shaped** (diff adapters) | **Introduced-only** — defects the change introduced or newly exposed                                     |
| **Snapshot / paths**              | **In-scope** — issues in named material; mark `pre-existing` in Noted when outside user's implied intent |

Shared rules:

- **Reachability** — name the trigger. Append `· Needs confirmation` when unproven.
- **No speculation** — no trigger + impact → no Action.
- **Tests** — missing tests alone ≠ Action unless tied to reachable untested risk on a changed path.

## Filing

Default **merge-blockers only** — [merge-blockers.md](merge-blockers.md). Cleanliness / style / nits require improvements lens or explicit user opt-in.

## Output

Always [output.md](output.md). Review status lines only when lens or user ask is merge-readiness.
