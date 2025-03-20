import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import _import from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sort from 'eslint-plugin-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import { fixupPluginRules } from '@eslint/compat';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/dist/*']),
  {
    extends: compat.extends(
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ),

    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: fixupPluginRules(_import),
      'simple-import-sort': simpleImportSort,
      sort,
      'unused-imports': unusedImports,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
        },
      ],

      'default-case-last': 'error',
      'default-param-last': 'error',
      'dot-notation': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'no-shadow': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
      'unused-imports/no-unused-imports': 'error',
    },
  },
  {
    files: ['examples/**/*.ts'],

    rules: {
      'unicorn/prefer-top-level-await': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]);
