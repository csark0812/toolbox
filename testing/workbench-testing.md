# Workbench Testing

Test patterns for workbench-core and workbench-react libraries.

## Architecture

```text
workbench-react (Integration Tests)
  ↓ uses
workbench-core (Unit Tests)
```

**workbench-core**: Pure reducer functions (open, close, move, update, history)  
**workbench-react**: React integration, hooks, components

## workbench-core Testing (Unit Tests)

Location: `tspackages/workbench-core/src/**/*.test.ts`

### Testing Reducers

Test pure functions with inputs and expected outputs:

```typescript
import { openReducer } from '@postprint/workbench-core';

test('openReducer creates new pane', () => {
  const initialLayout = wb.layout('tabs', {}, []);
  const initialHistories = {};
  
  const intent = { 
    name: 'editor', 
    params: { fileId: 'main.ts' } 
  };
  
  const env = {
    generateId: () => 'test-id',
    registry: { panes: { editor: {} }, layouts: {} },
    index: buildIndex(initialLayout, registry)
  };
  
  const { layout, histories, result } = openReducer(
    initialLayout,
    initialHistories,
    intent,
    env
  );
  
  expect(result.ok).toBe(true);
  expect(result.kind).toBe('created');
  expect(layout.childNodes).toHaveLength(1);
  expect(layout.childNodes[0].name).toBe('editor');
});
```

### Testing Close Reducer

```typescript
import { closeReducer } from '@postprint/workbench-core';

test('closeReducer removes pane by id', () => {
  const layout = wb.layout('tabs', {}, [
    wb.pane('editor', { fileId: 'main.ts' })
  ]);
  
  const nodeId = layout.childNodes[0].id;
  
  const { layout: newLayout, result } = closeReducer(
    layout,
    {},
    { nodeId },
    env
  );
  
  expect(result.ok).toBe(true);
  expect(newLayout.childNodes).toHaveLength(0);
});
```

### Testing Move Reducer

```typescript
import { moveReducer } from '@postprint/workbench-core';

test('moveReducer reorders panes', () => {
  const layout = wb.layout('tabs', {}, [
    wb.pane('editor', { fileId: 'a.ts' }),
    wb.pane('editor', { fileId: 'b.ts' }),
    wb.pane('editor', { fileId: 'c.ts' })
  ]);
  
  const nodeId = layout.childNodes[0].id;
  const targetId = layout.id;
  const targetIndex = 2;
  
  const { layout: newLayout } = moveReducer(
    layout,
    {},
    { nodeId, targetId, targetIndex },
    env
  );
  
  // First pane moved to index 2
  expect(newLayout.childNodes[2].options.fileId).toBe('a.ts');
});
```

### Testing History Reducer

```typescript
import { historyBackReducer } from '@postprint/workbench-core';

test('historyBackReducer navigates to previous pane', () => {
  const layout = wb.layout('history', { currentIndex: 1 }, [
    wb.pane('editor', { fileId: 'a.ts' }),
    wb.pane('editor', { fileId: 'b.ts' })
  ]);
  
  const scopeId = layout.id;
  const histories = {
    [scopeId]: {
      currentIndex: 1,
      stack: [
        layout.childNodes[0].id,
        layout.childNodes[1].id
      ]
    }
  };
  
  const { layout: newLayout, histories: newHistories } = historyBackReducer(
    layout,
    histories,
    { scopeId },
    env
  );
  
  expect(newLayout.options.currentIndex).toBe(0);
  expect(newHistories[scopeId].currentIndex).toBe(0);
});
```

### Testing Index System

```typescript
import { buildIndex } from '@postprint/workbench-core';

test('buildIndex creates ID and key mappings', () => {
  const layout = wb.layout('tabs', {}, [
    wb.pane('editor', { fileId: 'main.ts' })
  ]);
  
  const registry = {
    panes: {
      editor: {
        getKey: (opts) => `editor:${opts.fileId}`,
        keyParams: ['fileId']
      }
    },
    layouts: {}
  };
  
  const index = buildIndex(layout, registry);
  
  // ID mapping
  const nodeId = layout.childNodes[0].id;
  expect(index.idToPath[nodeId]).toEqual(['childNodes', '0']);
  
  // Key mapping
  expect(index.keyToIds['editor']['editor:main.ts']).toEqual([nodeId]);
});
```

### Testing Reconciliation

```typescript
import { reconcileState } from '@postprint/workbench-core';

test('reconcileState prunes closed panes from history', () => {
  const layout = wb.layout('tabs', {}, [
    wb.pane('editor', { fileId: 'a.ts' })
  ]);
  
  const nodeAId = layout.childNodes[0].id;
  const nodeBId = 'non-existent-id';
  
  const histories = {
    'scope-1': {
      currentIndex: 1,
      stack: [nodeAId, nodeBId] // nodeBId doesn't exist!
    }
  };
  
  const { histories: newHistories, warnings } = reconcileState(
    layout,
    histories,
    registry
  );
  
  // Pruned invalid ID
  expect(newHistories['scope-1'].stack).toEqual([nodeAId]);
  expect(newHistories['scope-1'].currentIndex).toBe(0); // Clamped
  expect(warnings).toHaveLength(1);
  expect(warnings[0]).toContain('Pruned closed pane');
});
```

## workbench-react Testing (Integration Tests)

Location: `tspackages/workbench-react/src/**/*.test.tsx`

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { createWorkbench } from '@postprint/workbench-react';

test('useWorkbench opens pane', () => {
  const { WorkbenchProvider, useWorkbench } = createWorkbench({
    panes: {
      editor: {
        component: () => <div>Editor</div>,
        getKey: (opts) => `editor:${opts.fileId}`,
        keyParams: ['fileId']
      }
    },
    layouts: {
      tabs: {
        component: TabsLayout,
        getActiveChildIndex: (opts) => opts.activeIndex
      }
    }
  });
  
  const initialLayout = wb.layout('tabs', {}, []);
  
  const wrapper = ({ children }) => (
    <WorkbenchProvider initialLayout={initialLayout}>
      {children}
    </WorkbenchProvider>
  );
  
  const { result } = renderHook(() => useWorkbench(), { wrapper });
  
  act(() => {
    result.current.open('editor', { fileId: 'main.ts' });
  });
  
  expect(result.current.state.layout.childNodes).toHaveLength(1);
  expect(result.current.state.layout.childNodes[0].name).toBe('editor');
});
```

### Testing Deduplication

```typescript
test('openDedupe focuses existing pane', () => {
  const { result } = renderHook(() => useWorkbench(), { wrapper });
  
  // Open first time - creates
  act(() => {
    result.current.openDedupe('editor', { fileId: 'main.ts' });
  });
  
  const firstId = result.current.state.layout.childNodes[0].id;
  
  // Open again - should focus existing
  act(() => {
    result.current.openDedupe('editor', { fileId: 'main.ts' });
  });
  
  // Still only one pane
  expect(result.current.state.layout.childNodes).toHaveLength(1);
  // Same ID (not recreated)
  expect(result.current.state.layout.childNodes[0].id).toBe(firstId);
});
```

### Testing History Navigation

```typescript
test('back() navigates to previous pane', () => {
  const { result } = renderHook(() => useWorkbench(), { wrapper });
  
  // Open two panes in history layout
  act(() => {
    result.current.open('editor', { fileId: 'a.ts' });
  });
  
  act(() => {
    result.current.open('editor', { fileId: 'b.ts' });
  });
  
  // Currently at b.ts
  expect(result.current.state.layout.options.currentIndex).toBe(1);
  
  // Go back
  act(() => {
    result.current.back();
  });
  
  // Now at a.ts
  expect(result.current.state.layout.options.currentIndex).toBe(0);
});
```

### Testing Query Hook

```typescript
import { useWorkbenchQuery } from '@postprint/workbench-react';

test('useWorkbenchQuery finds pane by ID', () => {
  const { result: wbResult } = renderHook(() => useWorkbench(), { wrapper });
  
  act(() => {
    wbResult.current.open('editor', { fileId: 'main.ts' });
  });
  
  const nodeId = wbResult.current.state.layout.childNodes[0].id;
  
  const { result: queryResult } = renderHook(
    () => useWorkbenchQuery(wbResult.current.state, wbResult.current.registry),
    { wrapper }
  );
  
  const found = queryResult.current.find({ id: nodeId });
  
  expect(found).toHaveLength(1);
  expect(found[0].id).toBe(nodeId);
});
```

### Testing Component Rendering

```typescript
import { render, screen } from '@testing-library/react';

test('workbench renders pane component', () => {
  const { WorkbenchProvider } = createWorkbench({
    panes: {
      editor: {
        component: () => <div>Editor Content</div>
      }
    },
    layouts: {
      tabs: {
        component: TabsLayout
      }
    }
  });
  
  const layout = wb.layout('tabs', {}, [
    wb.pane('editor', { fileId: 'main.ts' })
  ]);
  
  render(
    <WorkbenchProvider initialLayout={layout}>
      <Workbench />
    </WorkbenchProvider>
  );
  
  expect(screen.getByText('Editor Content')).toBeInTheDocument();
});
```

## Best Practices

### workbench-core

1. **Test pure functions** - No side effects, just input → output
2. **Use wb helpers** - `wb.layout()`, `wb.pane()` for test data
3. **Test edge cases** - Empty layouts, invalid IDs, etc.
4. **Test invariants** - Validate state after operations
5. **Fast tests** - No async, < 10ms each

### workbench-react

1. **Use renderHook** - Test hooks in isolation
2. **Wrap with provider** - All hooks need WorkbenchProvider
3. **Use act()** - Wrap state updates
4. **Test React integration** - Not just the reducer logic
5. **Test re-renders** - Verify updates trigger correctly
