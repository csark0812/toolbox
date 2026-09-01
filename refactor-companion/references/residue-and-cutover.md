# Refactor residue and cutover

<!-- source-of-truth: final-path and residue rules for refactor companion. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Use this reference after a path or concept is replaced.

Trace the old design through:

- callers, exports, routes, and entry points;
- public contracts, types, messages, schemas, and adapters;
- names, comments, docs, telemetry, and error text;
- tests, fixtures, mocks, and snapshots;
- helpers, callbacks, retries, fallbacks, and compatibility layers.

Retain an abstraction only when it owns a live consumer, contract, policy, boundary, behavior, or extension reason. Name that reason in the report.

Remove, inline, merge, or rename confirmed in-scope residue. Search again for removed symbols and concepts. Do not expand into unrelated cleanup merely because nearby code looks stale.

Stop when external consumers are unknown and the proposed deletion changes a public contract. Ask for the smallest compatibility decision after exhausting repository evidence.
