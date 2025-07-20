module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // 👈 matches jsconfig.json
  },
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
