# Program ownership and records

<!-- source-of-truth: durable coordinator contract -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-30 -->

Each brief names objective, writable/forbidden scope, source revision/dirty fingerprint, current upstream inputs, settled constraints, acceptance criteria, verification recipe and expected report. Missing required inputs block dispatch. One writer owns a mutable checkout/runtime; isolate authorized work or serialize.

Store runs under git-common-dir/toolbox/runs/<id>, or workspace/.toolbox/runs/<id>. Override explicitly. Run identity includes canonical repository, schema, coordinator epoch and state revision. Unit input fingerprint includes source, requirements and upstream artifacts. Helper mutations require expected revision and epoch; use its documented JSON operation interface.

Only coordinator acceptance advances canonical state. Worker completion awaits verification. Proof binds current inputs; integration is separately recorded and does not mean merged. Input changes invalidate transitive dependent readiness. Reports from superseded attempts never overwrite current attempts; duplicate identical reports are idempotent.

Cancellation intent is separate from observed termination. Retain the writer lease until host receipt proves terminal. Unknown ownership blocks reuse. Timeouts of observers never justify restarting a worker. Before takeover prove the previous owner terminal or obtain explicit handoff. Reconcile side effects before replacement/retry. Allow one diagnosed transient idempotent retry; deterministic repetition blocks or changes the plan.

Corruption/schema mismatch is explicit. Recovery uses a verified previous snapshot, never silent reset. Capture receipts for actual host stops and integration. Program completion includes all required outcomes and terminal attempts; evidence never confers merge or publication authority.
