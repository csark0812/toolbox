# Run helper interface

<!-- source-of-truth: executable coordination operation inputs -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-30 -->

Run `node <skill>/scripts/run.mjs <command> --store <run-directory> --input <JSON-file>`. Status/export need no input. Every mutation after init supplies expectedRevision and epoch from the last status result. IDs use letters, digits, underscore or hyphen. Source/requirements/upstream identity is represented by inputFingerprint supplied from actual evidence. Receipts are verified externally by the coordinator, not magically authenticated by the store.

| Command/action     | Required fields beyond expectedRevision/epoch                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| init               | id, repository, objective, coordinator                                                                                                           |
| unit/add           | id, dependencies (IDs), scope (absolute writable paths), inputFingerprint, criteria (nonempty strings)                                           |
| unit/invalidate    | id, new inputFingerprint; invalidates descendants and retains active writer scope                                                                |
| unit/block or fail | id, reason                                                                                                                                       |
| unit/cancel        | id; records intent, never terminates the host                                                                                                    |
| unit/queue         | id; blocker resolved, host terminal first; failed retry also needs transient, idempotent, reason and unused single retry                         |
| attempt/start      | unit, id, worker; ready graph and exclusive canonical scope required                                                                             |
| attempt/report     | unit, id, outcome completed/failed, outputs; duplicate identical report is safe                                                                  |
| attempt/terminal   | unit, id, status completed/failed/cancelled, receipt from observed host                                                                          |
| evidence           | id, unit, requirement, inputFingerprint, artifact, observation, environment, passed                                                              |
| decision           | id, scope, decision, rationale, reopening                                                                                                        |
| reconcile/verify   | unit, integration receipt; all declared criteria current/pass and host terminal                                                                  |
| reconcile/takeover | coordinator, receipt, priorOwnerTerminal or explicitHandoff                                                                                      |
| recover            | receipt, priorOwnerTerminal or explicitHandoff, expectedPreviousRevision; verify previous snapshot and explicitly reconcile abandoned lock first |

Read failures and rejected writes have stable code/message JSON. Unknown schema, corrupt state, stale revision/epoch, cycle, unavailable prerequisites and live writer ownership are distinct failures. Single-writer locks do not expire on timestamps. A crashed writer can leave a lock; remove it only after verified terminal-owner evidence or explicit handoff, then use recovery. Maintain that proof in the recovery receipt.
