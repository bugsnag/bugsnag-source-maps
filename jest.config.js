module.exports = {
  testPathIgnorePatterns: ['dist/*'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.*',
    '!**/*/fixtures/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFiles: [ '<rootDir>/.jest/setup.js' ]
}