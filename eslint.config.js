import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import erasableSyntaxOnly from "eslint-plugin-erasable-syntax-only";
import { globalIgnores } from 'eslint/config'

export default tseslint.config(
   eslint.configs.recommended,
    tseslint.configs.recommended,
    erasableSyntaxOnly.configs.recommended,
  [
  globalIgnores(['dist']),
  {
    
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      //eslint.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
     // erasableSyntaxOnly.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
