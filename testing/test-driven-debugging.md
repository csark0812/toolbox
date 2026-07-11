# Test-Driven Debugging

Fix completely broken features using tests to guide debugging.

## When to Use

- Feature doesn't work at all (e.g., navigation buttons do nothing)
- After major migrations or refactors
- Multiple related bugs (systematic issue)
- Need to ensure fix covers all edge cases

## The 7-Step Process

### Step 1: Write Failing Test

Document the expected behavior with a test:

```typescript
import { test } from './fixtures';
import { expect } from '@playwright/test';

test('clicking Home button opens home tab', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/workbench');

  // Click Home button
  const homeBtn = authenticatedPage.getByRole('button', { name: /home/i });
  await homeBtn.click();
  await authenticatedPage.waitForTimeout(500);

  // This will FAIL - that's the point!
  await expect(homeBtn).toHaveAttribute('aria-pressed', 'true');
});
```

**Why write it first?**

- Documents what "working" looks like
- Prevents fixing the wrong thing
- Ensures fix actually works
- Catches regressions

### Step 2: Run Test & Observe Failure

Run with browser visible to see what's happening:

```bash
bun run test:e2e:headed navigation.spec.ts
```

**Watch for:**

- Does button click even trigger?
- Any console errors?
- State updates happening?
- What's the actual vs expected state?

**Example failure output:**

```text
Expected: aria-pressed="true"
Received: aria-pressed="false"

Button clicked but state didn't update
```

### Step 3: Debug with Browser DevTools

Open DevTools while test runs:

**Check console:**

- Errors or warnings?
- Successful API calls?
- State management logs?

**Inspect elements:**

- Are event handlers attached?
- Does button have correct attributes?
- Is component even rendering?

**React DevTools:**

- Check component state
- Verify props are passed correctly
- Look for missing context providers

**Common findings:**

```javascript
// Console shows:
"Cannot find tabs container to insert layout"
"Cannot dedupe 'search': no getKey registered"

// This tells us exactly what's broken!
```

**Escalation:** If DevTools/test output does not reveal which layer owns the bug, or you need Cursor NDJSON session logs or compose mount verification → [`debug`](../debug/SKILL.md) before guessing fixes.

### Step 4: Fix the Bug

Make minimal changes to fix the root cause:

**Example - Missing getKey functions:**

```typescript
// apps/client/src/workbench/definition.tsx

// Before (broken):
search: {
  component: OpenAlexSearchPane,
  // Missing getKey!
}

// After (fixed):
search: {
  component: OpenAlexSearchPane,
  getKey: () => "search", // ← Added this
}
```

**Example - Silent failure in openTab:**

```typescript
// Before (broken):
const openTab = (builder) => {
  const paneInfo = extractPaneInfo(builder.node);
  if (!paneInfo) {
    console.warn("Not supported");
    return; // ← Silent failure!
  }
  workbench.openDedupe(paneInfo.name, paneInfo.params);
};

// After (fixed):
const openTab = (builder) => {
  const paneInfo = extractPaneInfo(builder.node);

  // Case 1: Simple pane
  if (paneInfo) {
    workbench.openDedupe(paneInfo.name, paneInfo.params);
    return;
  }

  // Case 2: Complex layout (NEW!)
  const activeTabs = findActiveTabsContainer(query.active().path);
  if (!activeTabs) {
    console.error("No tabs container found");
    return;
  }

  // Insert layout structure
  const updatedLayout = addNode(layout, activeTabs.id, builder.node);
  setLayout(updatedLayout);
};
```

### Step 5: Run Test Again

Verify the fix works:

```bash
bun run test:e2e:headed navigation.spec.ts
```

**Green pass?**

- ✅ Button click works
- ✅ State updates correctly
- ✅ No console errors
- ✅ Assertion passes

**Still failing?**

- Review your fix
- Check for other issues
- Read error message carefully
- Repeat Step 3 (debug more)

### Step 6: Add Edge Case Tests

Prevent regressions with additional tests:

```typescript
test('clicking Home twice does not create duplicate tabs', async ({ page }) => {
  await page.goto('/workbench');

  const homeBtn = page.getByRole('button', { name: /home/i });

  // Click twice
  await homeBtn.click();
  await page.waitForTimeout(500);
  await homeBtn.click();
  await page.waitForTimeout(500);

  // Should still be only one home tab
  const homeTabs = page.locator('.pane').filter({
    has: page.locator('text=/home/i')
  });
  await expect(homeTabs).toHaveCount(1);
});

test('Home button works from split view', async ({ page }) => {
  await page.goto('/workbench');

  // Create split
  await page.locator('button[title*="Split" i]').first().click();
  await page.waitForTimeout(800);

  // Click Home in second container
  const homeBtn = page.getByRole('button', { name: /home/i });
  await homeBtn.click();
  await page.waitForTimeout(500);

  // Should work correctly
  await expect(homeBtn).toHaveAttribute('aria-pressed', 'true');
});

test('Home button highlights when home tab active', async ({ page }) => {
  await page.goto('/workbench');

  // Open home
  const homeBtn = page.getByRole('button', { name: /home/i });
  await homeBtn.click();
  await page.waitForTimeout(500);

  // Open search (switches away)
  await page.getByRole('button', { name: /search/i }).click();
  await page.waitForTimeout(500);

  // Home should no longer be pressed
  await expect(homeBtn).not.toHaveAttribute('aria-pressed', 'true');

  // Click home tab directly
  const homeTab = page.getByRole('button', { name: /^home$/i });
  await homeTab.click();
  await page.waitForTimeout(500);

  // Sidebar button should highlight again
  await expect(homeBtn).toHaveAttribute('aria-pressed', 'true');
});
```

### Step 7: Iterate Until Suite Passes

Run all tests in the file:

```bash
bun run test:e2e navigation.spec.ts
```

**Keep going until:**

- All tests pass (green)
- No console errors
- Behavior matches expectations

**If tests still fail:**

- More edge cases to fix
- Related bugs discovered
- Repeat process for each issue

## Real-World Example

**Problem:** After workbench migration, navigation buttons don't work.

**Step 1 - Write test:**

```typescript
test('sidebar buttons navigate', async ({ page }) => {
  const homeBtn = page.getByRole('button', { name: /home/i });
  await homeBtn.click();
  await expect(homeBtn).toHaveAttribute('aria-pressed', 'true');
});
```

**Step 2 - Run test:**

```text
Expected: aria-pressed="true"
Received: aria-pressed="false"
```

**Step 3 - Debug:**
Console shows:

```text
Cannot dedupe 'search': no getKey registered
Could not find tabs container to insert layout
```

**Step 4 - Fix:**

1. Added missing `getKey` functions for all singleton panes
2. Updated `openTab` to handle layouts (not just panes)

**Step 5 - Test passes:**

```text
✓ sidebar buttons navigate (1.2s)
```

**Step 6 - Add edge cases:**

```typescript
test('sidebar works in split view', ...)
test('no duplicate tabs', ...)
test('button highlights match active tab', ...)
```

**Step 7 - All pass:**

```text
✓ sidebar buttons navigate
✓ sidebar works in split view
✓ no duplicate tabs
✓ button highlights match active tab
```

## Tips

**Start simple:**

- One test for core behavior
- Add edge cases after core works

**Use browser mode:**

- Visual feedback is invaluable
- DevTools > blind debugging

**Fix root causes:**

- Don't just update assertions
- Understand WHY it's failing

**Keep tests focused:**

- One behavior per test
- Clear test names

**Commit after each passing test:**

- Safe checkpoint if you break things
- Shows incremental progress
