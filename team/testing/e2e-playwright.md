# E2E Testing with Playwright

Patterns and best practices for browser-based end-to-end testing.

## First-Time Setup

**Commands SSOT:** [`docs/developer/testing.md`](../../../docs/developer/testing.md) § E2E.

E2E runs via `scripts/run-e2e.ts`, which installs Chromium, Firefox, and WebKit if missing (no manual browser install step required).

### Parallel Execution

Tests run in parallel with multiple workers for faster execution:

- **Local**: Uses all CPU cores automatically
- **CI**: Uses 4 workers

## Running Tests

**IMPORTANT: Use `bun run` scripts or `scripts/run-e2e.ts`; the script ensures browsers are installed.**

```bash
cd apps/client

# All E2E (script installs browsers if needed)
bun run test:e2e

# Specific file/pattern (use -- so args reach the script)
bun run test:e2e -- history-navigation
bun run test:e2e -- navigation-bugs.spec.ts

# By test name or browser
bun run test:e2e -- --grep "sidebar button"
bun run test:e2e -- --project chromium

# With browser visible / UI / debug
bun run test:e2e:headed
bun run test:e2e:ui
bun run test:e2e:debug
bun run test:e2e:headed -- history-navigation

# All options
bun scripts/run-e2e.ts --help
```

## Fixture Pattern

Use fixtures for common setup (avoid repetitive login code):

```typescript
// fixtures.ts
import { test as base, type Page } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login once per test
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/\/workbench/);

    await use(page);
  }
});
```

**Usage:**

```typescript
import { test } from './fixtures';

test('my test', async ({ authenticatedPage }) => {
  // Already logged in
  await authenticatedPage.goto('/workbench');
});
```

### PostPrint fixture conventions

- Fixtures live in `e2e/fixtures.ts` — import from there, not from `@playwright/test` directly.
- Use `routeAuthAndHealth()` inside fixtures to stub auth and health-check API calls; this prevents real network calls in tests.

## Selectors

### Prefer Accessible Selectors

```typescript
// ✅ Good - semantic, accessible, resilient
page.getByRole('button', { name: /home/i })
page.getByRole('button', { name: /sign in/i })
page.getByLabel('Email')
page.getByText('Welcome back')
page.getByPlaceholder('Search...')

// ❌ Avoid - brittle, non-semantic
page.locator('.home-btn')
page.locator('#email')
page.locator('button').nth(2)
```

### Complex Selectors

```typescript
// Filter by has
const tab = page.locator('.pane').filter({
  has: page.locator('text=/home/i')
});

// Chaining
const closeBtn = page
  .getByRole('button', { name: /home/i })
  .locator('..')
  .locator('button[aria-label*="Close"]');

// Or operator
const splitBtn = page
  .locator('button[title*="Split" i]')
  .or(page.getByRole('button', { name: /split/i }));
```

## Wait Strategies

### Navigation Waits

```typescript
// Wait for URL change
await page.waitForURL(/\/workbench/);

// Wait for network idle
await page.goto('/workbench', { waitUntil: 'networkidle' });

// Wait for DOM ready
await page.waitForLoadState('domcontentloaded');
```

### Element Waits

```typescript
// Wait for visibility
await expect(element).toBeVisible({ timeout: 5000 });

// Wait for element to be attached
await element.waitFor({ state: 'attached' });

// Wait for custom condition
await page.waitForFunction(() => window.appReady === true);
```

### State Settling

After interactions, allow state to settle:

```typescript
await homeButton.click();
await page.waitForTimeout(500); // State updates

// Better: Wait for specific condition
await expect(homeButton).toHaveAttribute('aria-pressed', 'true');
```

## Common Test Patterns

### Testing Navigation

```typescript
test('sidebar button opens correct pane', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/workbench');

  // Click navigation button
  const homeBtn = authenticatedPage.getByRole('button', { name: /home/i });
  await homeBtn.click();
  await authenticatedPage.waitForTimeout(500);

  // Verify button shows active state
  await expect(homeBtn).toHaveAttribute('aria-pressed', 'true');

  // Verify content visible
  const homeContent = authenticatedPage.locator('.pane').filter({
    has: authenticatedPage.locator('text=/home/i')
  });
  await expect(homeContent.first()).toBeVisible();
});
```

### Testing Split Tabs

```typescript
test('split creates second container', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/workbench');

  // Open initial tab
  await authenticatedPage.getByRole('button', { name: /home/i }).click();
  await authenticatedPage.waitForTimeout(500);

  // Count containers before
  const initialCount = await authenticatedPage.locator('.tabset').count();

  // Click split button
  const splitBtn = authenticatedPage.locator('button[title*="Split" i]').first();
  await splitBtn.click();
  await authenticatedPage.waitForTimeout(800);

  // Verify new container created
  const finalCount = await authenticatedPage.locator('.tabset').count();
  expect(finalCount).toBe(initialCount + 1);

  // Verify both have visible width
  const containers = authenticatedPage.locator('.tabset');
  for (let i = 0; i < finalCount; i++) {
    const box = await containers.nth(i).boundingBox();
    expect(box?.width).toBeGreaterThan(200);
  }
});
```

### Testing Tab Close

```typescript
test('closing tab removes it from DOM', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/workbench');

  // Open tab
  await authenticatedPage.getByRole('button', { name: /home/i }).click();
  await authenticatedPage.waitForTimeout(500);

  // Find close button on the tab
  const homeTab = authenticatedPage.getByRole('button', { name: /home/i }).first();
  const closeBtn = homeTab.locator('..').locator('button[aria-label*="Close" i]');

  await closeBtn.click();
  await authenticatedPage.waitForTimeout(500);

  // Verify tab no longer visible
  await expect(homeTab).not.toBeVisible();
});
```

### Testing History Navigation

```typescript
test('back button returns to previous tab', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/workbench');

  // Navigate through multiple tabs
  await authenticatedPage.getByRole('button', { name: /home/i }).click();
  await authenticatedPage.waitForTimeout(500);

  await authenticatedPage.getByRole('button', { name: /search/i }).click();
  await authenticatedPage.waitForTimeout(500);

  // Click back
  const backBtn = authenticatedPage.getByRole('button', { name: /back/i });
  await backBtn.click();
  await authenticatedPage.waitForTimeout(500);

  // Verify we're back at home
  const homeBtn = authenticatedPage.getByRole('button', { name: /home/i });
  await expect(homeBtn).toHaveAttribute('aria-pressed', 'true');
});
```

### Testing Forms

```typescript
test('form submission works', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/settings');

  // Fill form
  await authenticatedPage.getByLabel('Name').fill('John Doe');
  await authenticatedPage.getByLabel('Email').fill('john@example.com');

  // Submit
  await authenticatedPage.getByRole('button', { name: /save/i }).click();

  // Verify success
  await expect(authenticatedPage.getByText('Saved successfully')).toBeVisible();
});
```

## Shared Utilities

Create `apps/client/e2e/utils.ts` for common operations:

```typescript
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function waitForNavigation(page: Page, ms = 500) {
  await page.waitForTimeout(ms);
  await page.waitForLoadState('domcontentloaded');
}

export async function assertTabVisible(page: Page, name: string) {
  const tab = page.getByRole('button', { name: new RegExp(name, 'i') });
  await expect(tab).toBeVisible();
  await expect(tab).toHaveAttribute('aria-pressed', 'true');
}

export async function splitTabs(page: Page) {
  const splitBtn = page.locator('button[title*="Split" i]').first();
  await splitBtn.click();
  await page.waitForTimeout(800);
}

export async function closeTab(page: Page, name: string) {
  const tab = page.getByRole('button', { name: new RegExp(name, 'i') });
  const closeBtn = tab.locator('..').locator('button[aria-label*="Close" i]');
  await closeBtn.click();
  await page.waitForTimeout(500);
}

export async function assertNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // At test end
  expect(errors).toHaveLength(0);
}
```

## Best Practices

### General

1. **Use fixtures** - Avoid repetitive setup
2. **Accessible selectors** - Prefer role-based selectors
3. **Explicit waits** - Don't use arbitrary timeouts
4. **Test user flows** - Complete workflows, not isolated clicks
5. **Verify state** - Check active states, visibility, content
6. **Parallel execution** - Tests run in parallel automatically; adjust `workers` in config if needed

### Timeouts

1. **Short waits (300-500ms)** - After clicks for state updates
2. **Medium waits (800-1000ms)** - After split operations
3. **Long waits (2000-5000ms)** - Network requests, navigation
4. **Avoid arbitrary waits** - Use `expect().toBeVisible()` instead

### Debugging

**Use `bun run` for all test commands:**

```bash
# Run with browser visible
bun run test:e2e:headed navigation.spec.ts

# Run in debug mode (Playwright Inspector)
bun run test:e2e:debug

# Run specific test by grep pattern
bun run test:e2e -g "sidebar button"

# Generate and view HTML report
bun run test:e2e -- --reporter=html
bun playwright show-report
```

#### Instrumentation Logging

When debugging complex interactions (state updates, event handlers, async flows), add temporary console logs to trace execution:

**Frontend code pattern:**

```typescript
// In React components, hooks, or event handlers
console.log('[DEBUG ComponentName:lineNumber]', 'message', { data });

// Example:
console.log('[DEBUG useWorkbench:73]', 'Opening pane', { paneName, targetId });
console.log('[DEBUG SidebarPane:45]', 'Button clicked', { action: 'home' });
```

**Capture in test:**

```typescript
test('clicking button triggers action', async ({ authenticatedPage }) => {
  // Capture browser console logs
  authenticatedPage.on('console', msg => {
    if (msg.text().includes('[DEBUG')) {
      console.log('BROWSER:', msg.text());
    }
  });

  // Add test-side logging for correlation
  console.log('TEST: About to click button');
  await authenticatedPage.getByRole('button', { name: /home/i }).click();
  console.log('TEST: Clicked button');

  // Your assertions...
});
```

**Output example:**

```text
TEST: About to click button
BROWSER: [DEBUG SidebarPane:45] Button clicked {action: home}
BROWSER: [DEBUG useWorkbench:73] Opening pane {paneName: home, targetId: tabs-123}
TEST: Clicked button
```

**Key points:**

- Use `[DEBUG filename:line]` prefix for easy filtering
- Include structured data objects (not just strings)
- Add test-side `console.log('TEST: ...')` to correlate timing
- Only log messages containing `[DEBUG` to avoid noise
- Remember to remove instrumentation logs after debugging (covered by `debug-logs.mdc` rule)

### Handling Flakiness

1. **Increase timeouts** if tests occasionally fail
2. **Add retries** in playwright.config.ts
3. **Use explicit waits** over `waitForTimeout`
4. **Check for race conditions** in the app code
5. **Verify element is stable** before clicking

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true, // Enable parallel execution
  workers: process.env.CI ? 4 : undefined, // 4 workers in CI, all CPUs locally
  retries: process.env.CI ? 2 : 0, // Retry on CI
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  }
});
```
