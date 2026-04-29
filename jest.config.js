/** @type {import('ts-jest').JestConfigWithTsJest} */
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'super-secret-test-key';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/controllers/**/*.ts',
    'src/utils/adapters/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
