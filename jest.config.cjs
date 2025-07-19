module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.test.ts'],
	collectCoverage: true,
	coveragePathIgnorePatterns: ['<rootDir>/src/demo.ts'],
	coverageReporters: ['text', 'lcov', 'html'],
	verbose: true,
};