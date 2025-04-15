# Testing in za-dashboard-ui

This project uses Vitest and React Testing Library for testing React components and hooks.

## Test Setup

The testing environment is configured in:

- `vite.config.ts` - contains Vitest configuration
- `src/test/setup.ts` - global test setup and cleanup
- `src/test/test-utils.tsx` - custom render utilities for component testing

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage report
yarn test:coverage
```

## Test Structure

Tests are organized in `__tests__` directories next to the components or hooks being tested. For example:

```
src/
  hooks/
    __tests__/
      useInitialPatients.test.tsx
      useEchoWebSocket.test.tsx
    useInitialPatients.tsx
    useMockWebSocket.tsx
  modules/
    MasterView/
      __tests__/
        MasterView.test.tsx
      index.tsx
```

## Test Guidelines

1. **Component tests** - Focus on testing user interactions and rendered output
2. **Hook tests** - Test the behavior and output of custom hooks
3. **Mocking** - Use `vi.mock()` to mock dependencies like API calls
4. **Testing async code** - Use `vi.waitFor()` for asynchronous tests
5. **Test isolation** - Reset mocks between tests with `beforeEach`/`afterEach`

## Adding New Tests

When adding new components or hooks, follow these guidelines:

1. Create a corresponding `__tests__` directory if it doesn't exist
2. Create a test file named `ComponentName.test.tsx` or `hookName.test.tsx`
3. Use the appropriate testing patterns for components or hooks
4. Mock external dependencies to ensure tests are reliable and fast

For more information on testing React components, see:

- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
