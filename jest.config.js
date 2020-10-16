module.exports = {
  testPathIgnorePatterns: ['dist/*'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    "!src/**/*.test.*"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}