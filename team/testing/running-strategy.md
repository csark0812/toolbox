# Running Strategy

**Commands SSOT:** [`docs/developer/testing.md`](../../../docs/developer/testing.md) — use hub commands; this file covers scope, limits, and iteration policy only.

Scope and limits vary by scenario. The goal is fast feedback and immediate failure resolution — not running more tests than needed.

## Scenario Decision Tree

```text
Is this a new test being added?
  → YES → Targeted run (see "Adding New Tests")
  → NO  → Is a specific test/suite already failing?
              → YES → Debugging mode (see "Debugging Failures")
              → NO  → Post-fix verification or full suite (see below)
```

---

## Adding New Tests

**Goal**: verify the new tests pass before touching anything else.

1. Run only the file being added — see [testing.md § E2E](../../../docs/developer/testing.md) and Vitest/pytest sections for project-specific commands.
2. Iterate with targeted re-runs until all new tests pass.
3. **Only after new tests pass**, run the project suite (same doc — full project target).
4. Do not run the full monorepo suite unless the change is cross-cutting.

**Vitest:** `bunx nx run <project>:test` with `--testPathPattern` for a single file.

---

## Debugging Failures

**Goal**: reproduce and fix one failure at a time.

**Limits**: 1 failure, 1 retry.

Use targeted commands from [testing.md](../../../docs/developer/testing.md) with:

- E2E: `--max-failures 1 --retries 1`
- Vitest: `--bail=1`
- pytest: `-x --tb=short`

**Workflow**:

1. Run targeted command above
2. Read first failure output fully
3. Fix the root cause (do not skip, do not retry blindly)
4. Re-run targeted command
5. Repeat until targeted runs are clean
6. Expand to full suite only after the targeted suite is green

**Do not**:

- Increase `--max-failures` to see more failures before fixing
- Add retries beyond 1 to hide flakiness
- Run the full suite while isolated failures remain

---

## Post-Fix Verification

After a fix, validate scope widens incrementally:

1. **Targeted** — same limits as debugging (should pass)
2. **Project suite** — moderate `--max-failures` / `--retries` per [testing.md](../../../docs/developer/testing.md)
3. **Full suite** — only if step 2 is clean; root scripts in [commands.md](../../../docs/developer/commands.md)

---

## Full Suite / CI

For broad validation (pre-merge, post-migration): [testing.md](../../../docs/developer/testing.md) § Full suite and [commands.md](../../../docs/developer/commands.md).

If failures appear, switch to **Debugging Failures** mode immediately.

---

## Multi-turn fixes

Any time a fix requires more than one iteration, track criteria explicitly:

```text
Task ID: fix-<suite-name>   (e.g. fix-sources-e2e, fix-auth-unit)
tests.json criteria: one entry per failing test
```

This keeps pass/fail state across turns until all criteria pass. After all pass, run the post-fix verification ladder above.
