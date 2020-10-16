module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended'
  ],
  overrides: [
    {
      files: ['**/*.js', 'bin/cli'],
      extends: [
        'plugin:node/recommended'
      ]
    },
    {
      files: ['**/*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended'
      ],
      plugins: [
        '@typescript-eslint'
      ],
      rules: {
        "@typescript-eslint/no-empty-function": ["off"]
      }
    }
  ]
}