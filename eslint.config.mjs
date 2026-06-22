import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'tests/e2e/**',
      'src/payload-types.ts',
      'src/app/(payload)/admin/importMap.js',
      'release.config.cjs',
      'commitlint.config.cjs',
      'eslint.config.mjs',
      'vitest.config.ts',
      'playwright.config.ts',
      'next.config.ts',
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
]
