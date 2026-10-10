import { defineConfig } from 'vitest/config'

// Unit tests run on plain Vite, without the TanStack Start and Nitro plugins: they cover
// functions in src/lib, not pages.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
