# TDD anti-patterns

Consult before and during each red-green cycle.

## Implementation-coupled

Mocks internal collaborators, tests private methods, or asserts through a side channel. Example: querying the database instead of using the interface.

**Tell:** the test breaks when you refactor but behavior has not changed.

**Fix:** test at the public seam. Use fakes only at boundaries you agreed with the user.

## Tautological

The assertion recomputes the expected value the way the code does. Examples: `expect(add(a, b)).toBe(a + b)`, a hand-derived snapshot, a constant asserted equal to itself.

**Tell:** the test passes by construction and can never disagree with the code.

**Fix:** expected values from an independent source of truth — spec, worked example, known-good literal.

## Horizontal slicing

Writing all tests first, then all implementation. Bulk tests assert _imagined_ behavior. You test shape before understanding. Tests go insensitive to real changes. You commit to structure too early.

**Fix:** **vertical slices** — one test → one implementation → repeat. Each test is a tracer bullet that responds to what the last cycle taught you.

## Mocking guidelines

- Mock at **agreed seams** only — not every dependency by default.
- Prefer real collaborators when fast and deterministic.
- If a mock encodes production logic, the test is likely tautological or implementation-coupled.
