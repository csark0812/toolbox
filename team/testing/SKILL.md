---
name: testing
description: Write, fix, and run tests across all layers — E2E (Playwright), integration (Vitest), unit (Vitest/pytest). Use when a test fails, CI fails, test output needs fixing, or tests must be added or run for a feature. Not for unknown bug layer or NDJSON instrumentation (debug), read-only hunch verdicts (investigate), or passive coverage review in council (code-review → correctness agent).
---

# Testing

Write, run, and fix tests across E2E, integration, and unit layers.

## When to Use

- Failing test, CI failure, Playwright Inspector (`test:e2e:debug`)
- Add or run tests for a feature
- Post-fix verification after code changes

Not for: unknown layer or NDJSON instrumentation ([`debug`](../debug/SKILL.md)), read-only hunches ([`investigate`](../investigate/SKILL.md)), passive coverage review in council ([`code-review`](../code-review/SKILL.md)).

## Skill boundaries

See [agent-routing.md](../references/agent-routing.md) § Quality & ops.

## Core Discipline

**Address failures as they come. Never accumulate.**

- Failing test appears → stop, diagnose, fix before continuing
- Do not batch failures hoping they share a root cause
- Use the iterative fix loop when a failure needs more than one pass (see [iterative fix loop](#iterative-fix-loop))

## TDD Discipline

For new features: red-green-refactor, interface-first, one test at a time.

- **Red-green-refactor** — Write failing test → implement minimal pass → refactor.
- **Interface-first** — Confirm interface changes before implementation; design for testability.
- **One test at a time** — Each test drives one behavior; don't batch.
- **Deep modules** — Thin interfaces, rich internals (see coding philosophy).

Targeted re-runs drive iteration; TDD drives *what* to test first. See [tdd-discipline.md](tdd-discipline.md) for full workflow.

## Run Strategy by Scenario

**Different scenarios call for different scopes and limits.** See [running-strategy.md](running-strategy.md) for full details.

| Scenario | Scope | Workers | Max Failures | Retries |
|---|---|---|---|---|
| Adding new tests | Targeted file/pattern only | 4 | 1 | 0 |
| Debugging failing suite | Targeted suite | 4 | 1 | 1 |
| Post-fix verification | Targeted suite | 4 | 2 | 1 |
| Full suite / CI | Full suite | 4 | 3 | 2 |

**Adding new tests**: run only the file being added. Once targeted tests pass, expand to the full project suite with `--workers 4`.

**Debugging failures**: max 1 failure before stopping, 1 retry to distinguish flaky from deterministic. Never use `--max-failures 3` for targeted/debug runs — that batches failures and defeats "address failures as they come."

## Iterative fix loop

When iterating on failing tests across multiple turns, use a tracked loop:

1. Identify the failing test(s) and generate a task ID (e.g. `fix-sources-e2e`)
2. Initialize `_agent/{task-id}/tests.json` with the failing test(s) as criteria
3. Each iteration: run targeted tests → read output → fix → update `tests.json`
4. When all tests in scope pass, expand scope and run broader suite

Use this any time you expect 2+ fix iterations so pass/fail state stays explicit between turns.

**`tests.json` schema:**

```json
{
  "task": "fix-sources-e2e",
  "criteria": [
    {
      "file": "apps/client/src/hooks/data/auth/__tests__/requiresEmailVerification.test.ts",
      "description": "sources list invalidates after mutation",
      "status": "failing"
    }
  ]
}
```

`status` per entry: `"failing"` | `"passing"` | `"skipped"`. Update each entry after each run. Use unique task IDs across sessions to avoid collision — prefix with a timestamp if needed (`1714000000-fix-sources-e2e`). Add `_agent/` to `.gitignore` if not already present.

## After review findings

When fixing council review findings on a large branch, use the [review fix-loop](../../../docs/developer/review-fix-loop.md): read prior chat synthesis, fix theme-complete batches, run the verify ladder before re-review — see [review-fix-loop.md § Verify ladder](../../../docs/developer/review-fix-loop.md#verify-ladder). For test iteration on the same branch, `_agent/{task-id}/tests.json` ([§ Iterative fix loop](#iterative-fix-loop)) is separate from review memory.

## Flaky Tests

**When debugging flakiness**: use `--max-failures 1 --retries 1`. Do not use `--max-failures 3` — it batches failures and obscures which test flaked.

**Interpreting output**: Playwright reports "flaky" when a test failed on first attempt but passed on retry. Use that to distinguish timing/race issues from deterministic bugs.

**Mark known flaky tests** so future runs surface them:

```typescript
// In spec file — test-level (known flaky, fix in progress)
test('foo', { retries: 2 }, async ({ page }) => { ... });

// Or describe-level for a whole block
test.describe.configure({ retries: 1 });
```

Add a brief comment when using `retries` so it's clear the test is flaky and should be fixed, not hidden.

## Commands

Canonical Nx / pytest / Playwright commands, Playwright setup, and test-layer taxonomy: [`docs/developer/testing.md`](../../../docs/developer/testing.md). Apply [Run Strategy](#run-strategy-by-scenario) when choosing scope, workers, and `--max-failures`.

## Quick Examples

### E2E

```typescript
import { test } from './fixtures';

test('user can navigate home', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/workbench');
  const home = authenticatedPage.getByRole('button', { name: /home/i });
  await home.click();
  await expect(home).toHaveAttribute('aria-pressed', 'true');
});
```

### Integration

```typescript
import { renderHook, act } from '@testing-library/react';

test('hook opens pane', () => {
  const { result } = renderHook(() => useWorkbench(), { wrapper });
  act(() => { result.current.open('editor', { fileId: 'main.ts' }); });
  expect(result.current.state.layout.childNodes).toHaveLength(1);
});
```

### Unit

```typescript
test('reducer creates pane', () => {
  const { layout } = openReducer(initial, intent, env);
  expect(layout.childNodes).toHaveLength(1);
});
```

## Reference

- **[TDD Discipline](tdd-discipline.md)** - Red-green-refactor, interface-first, deep modules
- **[Running Strategy](running-strategy.md)** - Scope, worker, and failure limit decisions
- **[E2E Testing (Playwright)](e2e-playwright.md)** - Patterns, fixtures, selectors, wait strategies
- **[Test-Driven Debugging](test-driven-debugging.md)** - Full workflow for fixing broken features
- **[Workbench Testing](workbench-testing.md)** - Testing workbench-core and workbench-react
- **[Best Practices](best-practices.md)** - Guidelines for all test types

## Output format

Follow [references/output-schema.md](../references/output-schema.md). Preflight: Docker required for backend integration tests — scope to unit/file lint if unavailable.
