import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

// Node.js globals - more focused for a Node.js library
const nodeGlobals = {
	console: 'readonly',
	process: 'readonly',
	Buffer: 'readonly',
	__dirname: 'readonly',
	__filename: 'readonly',
	global: 'readonly',
	module: 'readonly',
	require: 'readonly',
	exports: 'readonly',
	setTimeout: 'readonly',
	setInterval: 'readonly',
	clearTimeout: 'readonly',
	clearInterval: 'readonly',
	setImmediate: 'readonly',
	clearImmediate: 'readonly',
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
	vi: 'readonly',
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
				project: './tsconfig.json', // Enable type-aware linting
			},
			globals: nodeGlobals,
		},
		plugins: {
			'@typescript-eslint': typescript,
			'import': importPlugin,
			'unused-imports': unusedImports,
		},
		rules: {
			...typescript.configs.recommended.rules,

			// TypeScript rules
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-inferrable-types': 'off',
			'prefer-const': 'error',
			'@typescript-eslint/no-var-requires': 'error',
			'@typescript-eslint/consistent-type-imports': ['error', {
				prefer: 'type-imports',
				disallowTypeAnnotations: false,
			}],

			'max-len': ['error', {
				code: 120,
				tabWidth: 2,
				ignoreUrls: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreComments: true,
			}],
			'indent': ['error', 2],
			'quotes': ['error', 'single', { avoidEscape: true }],
			'semi': ['error', 'always'],

			// Import rules
			'import/no-unused-modules': 'error',
			'import/no-duplicates': 'error',
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

			// General code quality
			'eol-last': ['error', 'always'],
			'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
			'no-trailing-spaces': 'error',
			'object-curly-spacing': ['error', 'always'],
			'array-bracket-spacing': ['error', 'never'],
			'comma-dangle': ['error', 'always-multiline'],
		},
	},
	{
		files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
		languageOptions: {
			globals: {
				...nodeGlobals,
				...testGlobals,
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'max-len': 'off',
		},
	},
	{
		ignores: ['dist/', 'node_modules/', '*.js', 'coverage/', 'build/'],
	},
];