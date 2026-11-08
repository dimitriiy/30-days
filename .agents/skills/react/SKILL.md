---
name: react
description: Guidelines for building and refactoring React components with logic separated into hooks or pure functions and presentation kept in focused view components.
---

# React: separate behavior from presentation

Use this skill when creating, editing, or reviewing React components and hooks.

## Keep components focused on rendering

- Prefer components that receive data and callbacks through props, then render the view. Keep business rules, data transformation, orchestration, and side effects outside the JSX component where practical.
- Put stateful or lifecycle-related behavior in a focused custom hook. Give the hook a domain-specific name such as `useUserProfile` and return only the state and actions the view needs.
- Put deterministic calculations and transformations in small pure functions. Pass inputs explicitly; return outputs without mutating inputs or relying on globals.
- Keep event handlers in the component when they are simple UI wiring. Extract them to a hook or pure function when they contain reusable, non-trivial, or domain-specific logic.
- Keep effects small and tied to one synchronization concern. Prefer existing data-fetching and service abstractions over direct API, storage, or global access in view components.

## Choose the right boundary

- Do not extract every line mechanically. A small component with straightforward UI state can remain self-contained when extraction would obscure the flow.
- Keep hooks responsible for behavior and coordination, not JSX. Keep pure functions independent of React.
- Keep reusable presentational components unaware of repositories, API clients, storage, and application singletons. Inject dependencies through props, context, or existing project hooks at an appropriate container or page boundary.
- Avoid mirroring derived values in state; calculate them from the current inputs, using memoization only when useful.
- Follow the project's existing architecture, naming, styling, and testing conventions. Make the smallest change that creates a clear responsibility boundary.

## During implementation

1. Inspect nearby components, hooks, services, and project guidance before choosing where logic belongs.
2. Identify view output, stateful behavior, and deterministic computation; separate them only where it improves clarity, reuse, or testability.
3. Preserve public component and hook APIs unless the task requires changing them.
4. Add or update focused tests for extracted behavior when the project has an established test pattern.
