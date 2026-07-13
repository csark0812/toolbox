import js from '@eslint/js'
import markdown from '@eslint/markdown'

export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '.agents/**',
      '.claude/**',
      '.cursor/**',
      'dist/**',
      // Generated skill materializations of .skeleton/references/
      '*/references/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
  },
  ...markdown.configs.recommended,
  {
    files: ['**/*.md'],
    language: 'markdown/commonmark',
    rules: {
      'markdown/no-html': 'off',
      'markdown/no-missing-label-refs': 'off',
      'markdown/fenced-code-language': 'off',
    },
  },
  {
    files: ['tests/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
      },
    },
  },
]
