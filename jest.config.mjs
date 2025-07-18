/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    extensionsToTreatAsEsm: ['.ts', '.mts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.mjs$': '$1',
    },
    collectCoverage: true,
    testPathIgnorePatterns: ['./dist', './node_modules'],
    moduleFileExtensions: ['js', 'mjs', 'ts', 'mts'],
    transform: {
        // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
        '^.+\\.m?[tj]sx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: './tsconfig.jest.json',
            },
        ],
    },
};
