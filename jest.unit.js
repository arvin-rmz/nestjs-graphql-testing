const sharedConfig = require('./jest.config');

module.exports = {
  ...sharedConfig,
  watch: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '\\.spec\\.ts$',
  // testRegex: '.*.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};

// const sharedConfig = require('./jest.config');

// module.exports = {
//   ...sharedConfig,
//   watch: true,
//   watchPathIgnorePatterns: ['/node_modules/'],
//   coverageDirectory: 'coverage',
//   coverageReporters: ['text', 'lcov', 'cobertura'],
//   collectCoverageFrom: [
//     'src/**/*.ts',
//     '!*/node_modules/**',
//     '!<rootDir>/src/main.ts',
//     '!<rootDir>/src/modules/database/database.service.ts',
//   ],
//   reporters: [
//     'default',
//     'jest-sonar',
//     [
//       'jest-junit',
//       {
//         outputDirectory: 'junit',
//         outputName: 'test-results.xml',
//       },
//     ],
//     [
//       '@jest-performance-reporter/core',
//       {
//         errorAfterMs: 1000,
//         warnAfterMs: 500,
//         logLevel: 'warn',
//         maxItems: 5,
//         jsonReportPath: 'performance-report.json',
//         csvReportPath: 'performance-report.csv',
//       },
//     ],
//   ],
//   coverageThreshold: {
//     global: {
//       branches: 10,
//       functions: 10,
//       lines: 10,
//       statements: 10,
//     },
//   },
// };
