# Code review merge gate

<!-- source-of-truth: strict code-quality attestation for a current branch or pull-request snapshot. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Use only for a branch or pull request when the user asks whether it passes code review for merge. This is a code-quality gate, not merge permission.

## Bind before review

Record internally:

- repository and remote base ref;
- full base-tip, merge-base, and reviewed-head commit IDs;
- declared paths and lenses;
- applicable input, state, transport, and lifecycle classes;
- authoritative contract sources and a stable version or fingerprint for mutable sources.

Review immutable commit content. If local files supply evidence, require local `HEAD` to equal the reviewed remote head and require the reviewed paths to have no staged, unstaged, or untracked changes. Otherwise use commit-object content or return `INCOMPLETE`.

## Contract and coverage gates

- Intent-sensitive findings and exclusions need a current authoritative contract.
- Conflicting or missing intent is a `contract hold` and makes the result `INCOMPLETE`.
- Contract-independent crashes, corruption, and security flaws remain findings.
- Full coverage includes every in-scope hunk and file, relevant callers and contracts, every requested lens, and every applicable behavior class.
- Consolidate the same root cause across lenses. Preserve each distinct trigger.

## Recheck before the verdict

Resolve the remote base and head again immediately before synthesis. Recheck mutable contract sources. A changed base, head, contract basis, or requested scope makes the review `STALE`. A pushed fix changes the head and requires a new merge gate.

Use this precedence:

```text
STALE > INCOMPLETE > BLOCKED > PASSED
```

| State        | Meaning                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `STALE`      | Bound identity, contract basis, or scope changed                                                 |
| `INCOMPLETE` | Coverage, evidence, or expected behavior remains unresolved                                      |
| `BLOCKED`    | One or more proved code-quality merge blockers remain                                            |
| `PASSED`     | Identity is current, coverage is full, contract basis is current, and no blocker or hold remains |

Preserve proved findings when the result is incomplete, but do not issue a complete blocking or passing attestation until the hold is resolved.

## User-facing attestation

Show enough identity to audit freshness:

```text
Merge gate · <base-ref>...<short reviewed head> · current head: match | changed
Contract: current | unresolved
Coverage: full | partial · Lenses: <covered lenses>
State: PASSED | BLOCKED | INCOMPLETE | STALE
```

For `PASSED`, emit exactly:

```text
No merge-blockers in scope.
```

Never emit that signal when identity changed, coverage is partial, contract intent is unresolved, a blocker remains, or review work is pending.

The signal covers code quality for the displayed snapshot, scope, contract, and lenses. It does not cover CI, approvals, conflicts, branch protection, deployment health, merge authorization, or the merge action.

Do not create a ledger, mutate a prior review, carry a historical pass forward, or coordinate repairs inside this review.
