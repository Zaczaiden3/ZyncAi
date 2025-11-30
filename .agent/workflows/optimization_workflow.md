---
description: Workflow for optimizing application performance and debugging framework issues.
---

# Optimization and Debugging Workflow

This workflow outlines the steps to identify performance bottlenecks, debug framework issues, and optimize the Zync AI application.

## 1. Static Analysis & Linting

First, ensure the codebase is free of static errors.

// turbo

1. Run linting check:

   ```bash
   npm run lint
   ```

## 2. Bundle Size Analysis

Check the production build size to identify large dependencies.

// turbo

1. Build the application:

   ```bash
   npm run build
   ```

2. Check the `dist` folder size (manual step or via script if available).

## 3. Runtime Performance Profiling (Manual)

1. Open the application in Chrome.
2. Open DevTools -> Performance tab.
3. Record a session where you interact with the AI (send a message).
4. Look for:
   - Long tasks (red bars).
   - Excessive re-renders (enable "Highlight updates" in React DevTools).
   - Large memory usage.

## 4. Framework Flow Check

Review the core data flow in `App.tsx` and services.

1. **State Management**: Check if `useState` or `useReducer` is causing unnecessary re-renders at the root level.

   - _Current Known Issue_: `systemStats` in `App.tsx` triggers re-renders every 100ms.
   - _Fix_: Move high-frequency state to isolated components or use `React.memo`.

2. **Service Optimization**:
   - **VectorStore**: Ensure `search` is not blocking the main thread. (Optimized in `services/vectorDb.ts`).
   - **Gemini Service**: Ensure streams are handled efficiently and errors are caught.

## 5. Component Optimization

1. **Memoization**: Wrap list items (like `MessageItem`) in `React.memo`.
2. **Lazy Loading**: Ensure heavy components (like `SystemVisualizer`) are lazy loaded.

## 6. Continuous Improvement

- Regularly run this workflow before major releases.
- Monitor `systemStats` for anomalies in latency or memory usage.
