module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    // Rewrite ESM .js imports → no extension so ts-jest resolves the .ts source
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coverageDirectory: '../../coverage/apps/api',
};
