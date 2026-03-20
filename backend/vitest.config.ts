import { defineConfig } from 'vitest/config';



export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    fileParallelism: false,
    reporters: ['default', ['json', { outputFile: './reports/vitest-results.json' }]],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary'],
      reportsDirectory: './coverage'
    },
    setupFiles: ['./src/test/setup.ts']
  }
});


