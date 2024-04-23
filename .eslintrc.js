module.exports = {
    env: {
        browser: true,
        es2022: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
        tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/no-extraneous-class': 'off',
        '@typescript-eslint/require-await': 'off',
        quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
        semi: ['error', 'always'],
        'no-multi-spaces': ['error'],
        // "camelcase": ['error', { "properties": "always" }],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'default',
                format: ['camelCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid',
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid',
            },
            {
                selector: 'enumMember',
                format: ['PascalCase'],
            },
            {
                selector: 'classProperty',
                modifiers: ['private'],
                format: ['camelCase'],
                leadingUnderscore: 'allow',
                trailingUnderscore: 'forbid',
            },
            {
                selector: 'classProperty',
                modifiers: ['protected'],
                format: ['camelCase'],
                leadingUnderscore: 'allow',
                trailingUnderscore: 'forbid',
            },
            {
                selector: 'classProperty',
                modifiers: ['static', 'readonly'],
                format: ['PascalCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid',
            },
            {
                selector: 'typeProperty', // interface, etc
                format: ['camelCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid',
            },
            {
                selector: 'method',
                format: ['camelCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid',
            },
            {
                selector: 'interface', // 禁止interface以I开头
                format: ['PascalCase'],
                custom: {
                    regex: '^I[A-Z]',
                    match: false,
                },
            },
        ],
    },
    overrides: [
        {
            files: ['tests/**/*'],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/stylistic',
            ],
            env: {
                jest: true,
            },
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-floating-promises': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
            },
        },
    ],
    ignorePatterns: ['*.d.ts', '*.js', '*.mjs', '/dist/', '/node_modules/'],
};
