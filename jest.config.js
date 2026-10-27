const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: __dirname });

module.exports = createJestConfig({
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.[jt]s?(x)'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  clearMocks: true,
  restoreMocks: true,
  maxWorkers: 2,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/auth/**/*.{ts,tsx}',
    'src/lib/authenticatedFetch.ts',
    'src/lib/server/**/*.ts',
    'src/pages/api/**/*.ts',
    'src/pages/login.tsx',
    '!src/auth/SidebarContext.tsx',
    '!src/auth/useAuth.tsx',
    '!src/pages/api/github-stars.ts',
  ],
});
