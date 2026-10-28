//  @ts-check

import { readdirSync } from 'node:fs'

import { tanstackConfig } from '@tanstack/eslint-config'

// A feature is one kind of data (purchases, contracts, EU projects...): its components,
// API calls, queries, address and texts. Shared code (src/components, src/lib) never
// imports a feature, and a feature reaches another only through its index.ts.
const FEATURES = readdirSync(new URL('./src/features', import.meta.url))

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    files: ['src/components/**', 'src/lib/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^#/features(/|$)',
              message: 'Shared code never imports a feature.',
            },
          ],
        },
      ],
    },
  },
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/**`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // A path inside another feature's folder.
              regex: `^#/features/(?!${feature}/)[^/]+/`,
              message:
                'Another feature is reached through its index.ts: #/features/<name>.',
            },
          ],
        },
      ],
    },
  })),
  {
    // Build output is not ours to lint.
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      '.output/**',
      'src/lib/api-schema.gen.ts',
    ],
  },
]
