module.exports = {
  collectCoverageFrom: ['packages/*.{js,ts,tsx}'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  // coverageThreshold: {
  //   global: {
  //     branches: 90,
  //     functions: 95,
  //     lines: 95,
  //     statements: 95,
  //   },
  // },
  testPathIgnorePatterns: ['/dist/'], // 忽略文件夹
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testEnvironment: 'jsdom',
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};
