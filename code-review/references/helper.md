# Review artifact helper

<!-- source-of-truth: review artifact and publication operation inputs -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-01 -->

Run `node <skill>/scripts/review.mjs <command> --store <run-directory> --input <JSON-file>`. Status and adapter are read-only. Mutations after init use expectedRevision. Default storage is resolved by run ID under git-common-dir/toolbox/reviews or workspace/.toolbox/reviews.

| Command                            | Input                                                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| init                               | id, target, source, requirements, mode focused/standard/closure/merge-gate, lenses                                                                                 |
| freeze                             | report, context (supplied inputs), exposure, isolation fresh/exposed, checks                                                                                       |
| reconcile                          | report, receipt for historical inspection, unresolved material finding IDs                                                                                         |
| assess                             | assessment, report, currentSource, currentRequirements                                                                                                             |
| prepare                            | id, authorityReceipt, currentSource, currentRequirements, payload event COMMENT + commit_id + body containing the run marker; comments need verified anchorReceipt |
| adapter                            | id; returns the prepared operation's immutable GitHub MCP arguments (no expectedRevision required)                                                                 |
| delivery/dispatch                  | id, currentSource, currentRequirements; record before actual host publication                                                                                      |
| delivery/unknown                   | id, reason for ambiguous post-dispatch result                                                                                                                      |
| delivery/published                 | id, providerId, url, receipt proving review and inline-comment read-back, currentSource/currentRequirements                                                        |
| delivery/failed-before-publication | id, definitive non-delivery receipt                                                                                                                                |
| delivery/retry                     | same id after definitive failure only                                                                                                                              |
| local                              | reason; final report becomes explicit local fallback                                                                                                               |

Initial report and payload files are immutable. Record only one primary publication per run; another ID cannot bypass an unknown outcome. An authorized stale notice uses kind stale-notice and a separate operation after a published review was observed stale. Formal review states use separately authorized host tools and do not pass through this COMMENT-only helper.

The helper records verified adapter observations; it does not publish or manufacture receipt/anchor evidence. Unknown remote delivery remains unknown even with a local report. Capture actual tool evidence. Source identity must incorporate current base/head/scope or the dirty snapshot; GitHub payload commit_id must be the reviewed head. For composite source identity use reviewedCommit on init. GitHub anchorReceipt and publication receipt use the structured observations in [github-delivery.md](github-delivery.md); string anchor assertions are insufficient. Existing frozen operations remain reconcilable under their original receipt contract.
