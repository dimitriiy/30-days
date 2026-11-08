---
title: Memoization Requires Both Memo and Memoized Props
impact: MEDIUM
impactDescription: useCallback without memo is useless
tags: rerender, memo, useCallback, useEffect, optimization
---

## Memoization Requires Both Memo and Memoized Props

Memoization only works when both conditions are met: the component is wrapped in `memo()` AND its function props are memoized with `useCallback` or `useMemo`. Missing either part breaks the optimization.

**Incorrect: useCallback without memo - useless memoization:**

```tsx
function Parent({ value }: { value: string }) {
  const handleClick = useCallback(() => {
    console.log(value)
  }, [value])
  
  // PanelCard re-renders on every Parent render
  // useCallback provides no benefit
  return <PanelCard onCopy={handleClick} />
}

function PanelCard({ onCopy }: { onCopy?: () => void }) {
  return <button onClick={onCopy}>Copy</button>
}
```

**Correct: both memo and memoized props:**

```tsx
function Parent({ value }: { value: string }) {
  const handleClick = useCallback(() => {
    console.log(value)
  }, [value])
  
  // PanelCard only re-renders when handleClick changes
  return <PanelCard onCopy={handleClick} />
}

const PanelCard = memo(function PanelCard({ onCopy }: { onCopy?: () => void }) {
  return <button onClick={onCopy}>Copy</button>
})
```

**Common pitfalls:**

1. **useCallback without memo:** Parent creates new callbacks, child still re-renders

2. **memo without useCallback:** Child skips no renders because parent always creates new callback functions

3. **Both missing:** No memoization happens at all

**When to use this pattern:**

- Component renders frequently
- Child component is expensive to render
- Parent passes memoizable props (functions, objects, arrays)
- Child component has stable non-prop dependencies

**When NOT to use:**

- Simple components that render quickly
- Props change frequently anyway
- Component tree needs full re-renders for data consistency
- React Compiler is enabled (handles this automatically)

**Example: memo unnecessary for simple button component:**

```tsx
// ❌ Over-engineered: memo adds overhead without benefit
const MyButton = memo(function MyButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
})

// ✅ Better: simple component renders quickly, no need for memo
function MyButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}
```

Simple components like buttons, labels, icons render so fast that memo's comparison cost often exceeds the re-render savings. Use memo only when component is expensive to render or when re-renders happen frequently with the same props.

**Note:** If your project has [React Compiler](https://react.dev/learn/react-compiler) enabled, manual memoization with `memo()` and `useCallback()` is not necessary. The compiler automatically optimizes re-renders.