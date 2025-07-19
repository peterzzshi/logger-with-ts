module.exports = {
	root: true,
	env: {
		node: true,
		es2022: true,
		browser: true,
		jest: true,
	},
	extends: [
		'eslint:recommended',
		'@typescript-eslint/recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2023,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		'prettier/prettier': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/explicit-function-return-type': 'warn',
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-inferrable-types': 'off',
	},
	ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};