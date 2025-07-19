import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

// Common globals used across all TypeScript files
const commonGlobals = {
	console: 'readonly',
	process: 'readonly',
	Buffer: 'readonly',
	__dirname: 'readonly',
	__filename: 'readonly',
	global: 'readonly',
	module: 'readonly',
	require: 'readonly',
	exports: 'readonly',
	// DOM globals
	document: 'readonly',
	window: 'readonly',
	HTMLElement: 'readonly',
	HTMLButtonElement: 'readonly',
	HTMLInputElement: 'readonly',
	Element: 'readonly',
	NodeListOf: 'readonly',
	Event: 'readonly',
	MouseEvent: 'readonly',
	KeyboardEvent: 'readonly',
	FocusEvent: 'readonly',
	SubmitEvent: 'readonly',
	HTMLElementEventMap: 'readonly',
};

// Test-specific globals
const testGlobals = {
	describe: 'readonly',
	it: 'readonly',
	test: 'readonly',
	expect: 'readonly',
	beforeEach: 'readonly',
	afterEach: 'readonly',
	beforeAll: 'readonly',
	afterAll: 'readonly',
	jest: 'readonly',
};

export default [
	js.configs.recommended,
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
			},
			globals: commonGlobals,
		},
		plugins: {
			'@typescript-eslint': typescript,
			'import': importPlugin,
			'unused-imports': unusedImports,
		},
		rules: {
			...typescript.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-inferrable-types': 'off',

			// Line length limit
			'max-len': ['error', {
				code: 100,
				tabWidth: 2,
				ignoreUrls: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
			}],

			// Import rules - ensure imports are used and sorted
			'import/no-unused-modules': 'error',
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
			'unused-imports/no-unused-imports': 'error',

			// Ensure newline at end of file
			'eol-last': ['error', 'always'],

			// Maximum 1 blank line between code blocks
			'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
		},
	},
	{
		files: ['**/__tests__/**/*', '**/*.test.*'],
		languageOptions: {
			globals: {
				...commonGlobals,
				...testGlobals,
			},
		},
	},
	{
		ignores: ['dist/', 'node_modules/', '*.js', 'coverage/'],
	},
];
