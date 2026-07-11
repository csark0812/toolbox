# Testing Best Practices

Guidelines for writing effective tests across all layers.

## General Principles

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad - tests implementation details
test('uses useState to track count', () => {
  const { result } = renderHook(() => useCounter());
  expect(result.current.count).toBe(0); // Testing internal state
});

// ✅ Good - tests observable behavior
test('increments count when button clicked', async () => {
  render(<Counter />);
  const btn = screen.getByRole('button', { name: /increment/i });
  
  await userEvent.click(btn);
  
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 2. Write Descriptive Test Names

```typescript
// ❌ Bad - vague
test('it works', () => {});
test('test button', () => {});

// ✅ Good - specific and descriptive
test('clicking Home button opens home tab', () => {});
test('split tabs creates second container with equal width', () => {});
test('closing middle tab redistributes space to adjacent tabs', () => {});
```

### 3. Follow AAA Pattern

**Arrange → Act → Assert**

```typescript
test('form submission saves data', async () => {
  // Arrange
  render(<UserForm onSave={mockSave} />);
  const nameInput = screen.getByLabel('Name');
  const submitBtn = screen.getByRole('button', { name: /save/i });
  
  // Act
  await userEvent.type(nameInput, 'John Doe');
  await userEvent.click(submitBtn);
  
  // Assert
  expect(mockSave).toHaveBeenCalledWith({ name: 'John Doe' });
});
```

### 4. Keep Tests Isolated

Each test should be independent:

```typescript
// ❌ Bad - tests depend on each other
let counter = 0;

test('increments counter', () => {
  counter++;
  expect(counter).toBe(1);
});

test('increments again', () => {
  counter++;
  expect(counter).toBe(2); // Breaks if first test doesn't run!
});

// ✅ Good - each test is independent
test('increments counter', () => {
  const counter = createCounter();
  counter.increment();
  expect(counter.value).toBe(1);
});

test('increments again', () => {
  const counter = createCounter();
  counter.increment();
  counter.increment();
  expect(counter.value).toBe(2);
});
```

### 5. Test Edge Cases

Don't just test happy paths:

```typescript
describe('calculateTotal', () => {
  test('calculates sum of positive numbers', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });
  
  test('handles empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
  
  test('handles negative numbers', () => {
    expect(calculateTotal([-1, 2, -3])).toBe(-2);
  });
  
  test('handles decimals', () => {
    expect(calculateTotal([1.5, 2.3])).toBeCloseTo(3.8);
  });
  
  test('handles very large arrays', () => {
    const large = Array(10000).fill(1);
    expect(calculateTotal(large)).toBe(10000);
  });
});
```

## E2E Test Best Practices

### 1. Use Accessible Selectors

```typescript
// ✅ Good
page.getByRole('button', { name: /submit/i })
page.getByLabel('Email')
page.getByText('Welcome')

// ❌ Bad
page.locator('.submit-btn')
page.locator('#email')
```

### 2. Explicit Waits Over Arbitrary Timeouts

```typescript
// ❌ Bad - arbitrary timeout
await button.click();
await page.waitForTimeout(2000);

// ✅ Good - wait for specific condition
await button.click();
await expect(successMessage).toBeVisible();
```

### 3. Test Complete User Flows

```typescript
// ❌ Bad - isolated action
test('clicks button', async ({ page }) => {
  await page.getByRole('button').click();
});

// ✅ Good - complete workflow
test('user can create and save project', async ({ page }) => {
  // Navigate
  await page.goto('/projects');
  await page.getByRole('button', { name: /new project/i }).click();
  
  // Fill form
  await page.getByLabel('Name').fill('My Project');
  await page.getByLabel('Description').fill('Test project');
  
  // Submit
  await page.getByRole('button', { name: /save/i }).click();
  
  // Verify
  await expect(page).toHaveURL(/\/projects\/\d+/);
  await expect(page.getByText('My Project')).toBeVisible();
});
```

### 4. Use Fixtures for Common Setup

```typescript
// fixtures.ts
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Common setup
    await login(page);
    await use(page);
  }
});

// test file
test('protected route', async ({ authenticatedPage }) => {
  // Already logged in!
  await authenticatedPage.goto('/dashboard');
});
```

### 5. Check for Console Errors

```typescript
test('no console errors during navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.goto('/workbench');
  await page.getByRole('button', { name: /home/i }).click();
  
  expect(errors).toHaveLength(0);
});
```

## Integration Test Best Practices

### 1. Mock External Dependencies

```typescript
import { vi } from 'vitest';

test('fetches user data', async () => {
  // Mock API call
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ name: 'John' })
    })
  );
  
  render(<UserProfile userId="123" />);
  
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

### 2. Test Hook Interactions

```typescript
test('hooks work together', () => {
  const { result } = renderHook(() => {
    const workbench = useWorkbench();
    const query = useWorkbenchQuery();
    return { workbench, query };
  }, { wrapper });
  
  act(() => {
    result.current.workbench.open('editor', { fileId: 'main.ts' });
  });
  
  // Query should find the opened pane
  const found = result.current.query.find({ pane: 'editor' });
  expect(found).toHaveLength(1);
});
```

### 3. Test State Updates

```typescript
test('state update triggers re-render', () => {
  const { rerender } = render(<Counter initialCount={0} />);
  
  const btn = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(btn);
  
  // Component should show updated count
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

## Unit Test Best Practices

### 1. Test Pure Functions

```typescript
// ✅ Good - pure function, easy to test
function add(a: number, b: number): number {
  return a + b;
}

test('add returns sum', () => {
  expect(add(2, 3)).toBe(5);
});

// ❌ Harder to test - impure function
let total = 0;
function addToTotal(n: number): void {
  total += n;
}
```

### 2. Fast Tests

Unit tests should be < 10ms each:

```typescript
// ✅ Good - fast, synchronous
test('parses string to number', () => {
  expect(parseNumber('42')).toBe(42);
});

// ❌ Bad - slow, unnecessary async
test('parses string to number', async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(parseNumber('42')).toBe(42);
});
```

### 3. Test All Code Paths

```typescript
function divide(a: number, b: number): number | null {
  if (b === 0) return null;
  return a / b;
}

describe('divide', () => {
  test('divides numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
  
  test('returns null for division by zero', () => {
    expect(divide(10, 0)).toBeNull();
  });
  
  test('handles negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });
});
```

## Performance

### Run Affected Tests First

```bash
# Fast feedback - only changed files
bun run test:affected

# Full suite - before commit
bun run test
```

### Parallelize When Possible

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 1 : undefined, // Parallel locally
  fullyParallel: true
});
```

### Skip Slow Tests in Watch Mode

```typescript
// Slow test - skip in watch mode
test.skipIf(process.env.VITEST_WATCH)('slow integration test', async () => {
  // ...
});
```

## Debugging

### Visual Debugging (E2E)

```bash
# Run with browser visible
bun run test:e2e:headed

# Run with Playwright Inspector
bun run test:e2e:debug
```

### Test Reports

```bash
# Generate coverage report (Vitest)
bun run test:coverage

# Generate Playwright HTML report
bun run test:e2e -- --reporter=html

# View Playwright report
bun playwright show-report
```

### Debugging Individual Tests

```typescript
// Use test.only to focus on one test
test.only('debug this test', () => {
  // ...
});

// Use console.log (removed before commit)
test('something', () => {
  console.log('Debug:', someValue);
  expect(something).toBe(expected);
});
```

## Common Mistakes

### 1. Testing Implementation Details

```typescript
// ❌ Don't test internal state
expect(component.state.count).toBe(1);

// ✅ Test observable behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 2. Not Waiting for Async Updates

```typescript
// ❌ Missing await
test('async test', () => {
  button.click(); // Missing await
  expect(result).toBe(expected); // Might fail due to timing
});

// ✅ Proper async handling
test('async test', async () => {
  await button.click();
  await waitFor(() => {
    expect(result).toBe(expected);
  });
});
```

### 3. Brittle Selectors

```typescript
// ❌ Brittle - breaks if CSS changes
page.locator('.btn-primary.large')

// ✅ Stable - based on accessibility
page.getByRole('button', { name: /submit/i })
```

### 4. Not Cleaning Up

```typescript
// ❌ Leaking state between tests
let globalVar = null;

test('test 1', () => {
  globalVar = 'value';
});

test('test 2', () => {
  expect(globalVar).toBeNull(); // Fails!
});

// ✅ Clean setup per test
test('test 1', () => {
  const localVar = 'value';
  expect(localVar).toBe('value');
});
```

### 5. Too Many Assertions Per Test

```typescript
// ❌ Testing too much in one test
test('everything', () => {
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
  expect(d).toBe(4);
  // Hard to debug when it fails
});

// ✅ One concept per test
test('a equals 1', () => {
  expect(a).toBe(1);
});

test('b equals 2', () => {
  expect(b).toBe(2);
});
```
