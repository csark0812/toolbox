# TDD Discipline

Test-Driven Development for new features. Red-green-refactor with interface-first design.

## Red-Green-Refactor Loop

1. **Red** — Write a failing test that documents the desired behavior.
2. **Green** — Implement minimal code to make the test pass.
3. **Refactor** — Clean up without changing behavior. Run tests again.

Repeat for each behavior. One test at a time.

## Interface-First

Before implementing:

- Confirm what interface changes are needed (new exports, function signatures, types).
- Design for testability — thin interfaces over rich internals (deep modules).
- If the codebase has many tiny, undifferentiated modules, consider restructuring before adding more.

## One Test at a Time

- Don't batch: write one test, implement, refactor, then the next.
- Each test drives one behavior.
- Prevents speculative implementation and keeps focus narrow.

## Deep Modules

Prefer modules with:

- **Thin interface** — Few public functions, clear contracts.
- **Rich internals** — Logic lives inside; tests target the interface.

Shallow modules (many small files, each doing little) make test boundaries unclear. Deepening improves both testability and agent navigation.

## When to Use TDD

- Adding new features with clear acceptance criteria.
- Fixing broken features (see [test-driven-debugging.md](test-driven-debugging.md)).
- Refactoring — tests protect behavior.

## Integration with iterative fixing

- **Targeted re-runs** (and optional `_agent/.../tests.json` criteria) drive the loop until all tests pass.
- **TDD** drives *what* to test first — write the failing test before implementation.
- Combine: write failing test → record criteria if using a multi-turn loop → implement → verify → next test.
