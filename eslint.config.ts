/* eslint-disable simple-import-sort/imports */
import js from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import testingLibrary from 'eslint-plugin-testing-library';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  },
  {
    ignores: [
      'supabase/functions/**/*' // Ignora tudo dentro das Edge Functions de forma recursiva
    ]
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

  eslintPluginPrettierRecommended,

  {
    files: [
      'src/**/__tests__/**/*.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'src/**/*.test.{ts,tsx}'
    ],
    plugins: {
      'testing-library': testingLibrary
    },
    rules: {
      ...testingLibrary.configs.react.rules,
      'testing-library/prefer-screen-queries': 'off',
      'testing-library/render-result-naming-convention': 'off'
    }
  },

  {
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error'
    }
  },

  {
    rules: {
      'prettier/prettier': ['error', { singleQuote: true }],
      'react/react-in-jsx-scope': 0,
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      'testing-library/prefer-screen-queries': 'off',
      'testing-library/render-result-naming-convention': 'off',
      'react/no-children-prop': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
]);
