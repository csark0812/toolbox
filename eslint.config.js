import js from '@eslint/js'
import markdown from '@eslint/markdown'
import globals from 'globals'

export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '.agents/**',
      '.claude/**',
      '.cursor/**',
      'dist/**',
      // Skill-local references/ (not ambient GitHub SSOT)
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
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
]
