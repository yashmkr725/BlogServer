import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import arrowFunctionsPlugin from 'eslint-plugin-arrow-functions';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    // TypeScript config
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    // Plugins & rules
    {
        files: ['**/*.ts'],
        plugins: {
            prettier: prettierPlugin,
            'arrow-functions': arrowFunctionsPlugin,
        },
        rules: {
            'prettier/prettier': 'error',
            'semi': ['error', 'always'],
            'arrow-functions/prefer-arrow-functions': ['error', {
                allowNamedFunctions: false,
                allowedNames: [],
                allowObjectProperties: false,
                classPropertiesAllowed: false,
                disallowPrototype: false,
                returnStyle: 'unchanged',
                singleReturnOnly: false,
            }],
        },
    },

    // Ignore built files
    {
        ignores: [
            'dist',
            '**/*.js',
            'eslint.config.mjs' // ← ignore ESLint config itself
        ],

    }
);
