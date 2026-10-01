# Independent assessment and durable delivery

<!-- source-of-truth: fresh review context, artifact and publication authority -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-30 -->

Dispatch a new reviewer context using the host's fresh/no-history option when available. Supply current source/base/head or dirty snapshot fingerprint, scope/lens, authoritative requirements with provenance, dependencies and tests. Withhold pass counts, previous conclusions, author assurances and repair narratives. Capture supplied context and exposure. Host inability to isolate is labeled exposed and never counted as fresh qualification. Do not hide legitimate source comments or requirements.

Freeze initial report before reading previous artifacts. Then confirm persistence, verify reported fixes, disprove or leave unresolved old material findings. A clean first pass cannot override an unresolved blocker; prior consensus cannot suppress new evidence. Review never repairs source. A new full review always gets a new run ID. Closure checks deliberately know the finding, are narrow and never become full-pass attestation.

An explicitly invoked review of a named PR includes COMMENT delivery unless restricted by user/host authority. Internal automatic checks without publication authority save local reports. APPROVE, REQUEST_CHANGES, resolution, dismissal and merge remain separately authorized.

Use GitHub MCP for PR reads/publication when available. Declare adapter capabilities: snapshot, anchor validation, publish, receipt discovery, freshness. GitHub COMMENT binds commit_id; validate inline coordinates against the current diff or put source links in the body. Other surfaces disclose reduced guarantees; unsupported targets use verified local reports. Do not simulate missing capabilities.

Before dispatch freeze payload, marker, target, reviewed source, anchors and digest. Persist prepared → dispatching → published/failed/unknown. A timeout/crash after dispatch is unknown. Reconcile by provider ID or exact run marker and payload. Eventually consistent absence cannot prove non-delivery; only proven pre-publication failure permits automatic retry. One publisher owns a run. Even clean reviews publish a concise result. Reconcile existing threads after the fresh pass to avoid duplicate root causes; never auto-resolve them.

Recheck source/requirements before and after dispatch. If changed, retain snapshot-bound result and record an authorized stale notice as a separate operation. A clean review says no actionable findings in examined scope. Return verified remote receipt or local fallback, with unknown native delivery stated. Artifact storage defaults to git-common-dir/toolbox/reviews/<run-id> or workspace/.toolbox/reviews/<run-id>; helper --store supports override.
