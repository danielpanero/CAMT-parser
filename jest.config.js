export default {
  verbose: true,
  collectCoverage: false,
  resetModules: true,
  restoreMocks: true,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transform: {
    '.*\\.(xml|txt)$': 'jest-raw-loader'
  },
  coveragePathIgnorePatterns: ['<rootDir>/dist/', '/node_modules/'],
}
