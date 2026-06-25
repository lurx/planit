import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      // Exclude declarative files (types, constants) and barrels; hold logic to 100%.
      exclude: ['src/**/__tests__/**', '**/*.types.ts', '**/*.constants.ts', '**/index.ts'],
      // The keystone package is pure logic — hold it to 100% as code lands (T5.1).
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
