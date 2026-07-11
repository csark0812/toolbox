# Debug techniques

## git bisect

When something worked before and doesn't now:

```bash
git bisect start
git bisect bad
git bisect good <last-good-commit>
# repeat good|bad until isolated
git bisect reset
```

## Isolation

Reproduce in the smallest context:

- API bug → `curl` the endpoint with a valid token (removes client)
- React bug → render the component with hardcoded props
- Query bug → unit test the mutation — [`testing` skill](../../testing/SKILL.md)

## Delta debugging

"Works with X, fails with Y." Binary-search the diff until the smallest change that triggers failure is identified.

## Diagnostic tracer bullet

When wiring is uncertain across layers, build the **thinnest repro path** that touches every suspect layer — a diagnostic slice, not a feature:

1. One user action → one API call → one DB write → one WS event → one UI update
2. Instrument only that path — [cross-cutting.md](cross-cutting.md)
3. Expand only after the slice proves which layer breaks

For **building new features** as vertical slices, use tracer bullets in [issues-format.md](planning/issues-format.md) — not this skill.

## When it's a design problem

Stop patching and rethink when:

- You've fixed the same bug (or a close variant) before
- The fix touches more than 2–3 files without a clear root cause
- You can't state the root cause in one sentence after investigation
- The bug only appears under load or specific timing
- You're adding defensive checks rather than fixing a mechanism
- No good **seam** exists to test or observe the failure — see [`docs/developer/codebase-design.md`](../../../../docs/developer/codebase-design.md) (depth, seam, leverage, deletion test) for shared vocabulary when handing off to architecture review
