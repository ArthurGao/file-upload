// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom', // or 'node', depending on your needs
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
        '^.+\\.jsx?$': 'babel-jest'
    },
    // If necessary, allow transforming ESM code from specific node_modules (like axios)
    transformIgnorePatterns: [
        'node_modules/(?!(axios)/)'
    ],
    // Tell Jest to treat .ts files as ES Modules
    extensionsToTreatAsEsm: ['.ts', '.tsx']
};
