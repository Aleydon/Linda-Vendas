export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/.jest/jest.setup.js'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};
