export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/tests/setup/setup.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/app.js",
    "!src/swagger.js",
    "!src/config/**/*.js"
  ],
  coverageDirectory: "coverage",
  clearMocks: true,
  restoreMocks: true,
};
