module.exports = {
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.spec.ts"],
      plugins: ["vitest"],
      extends: ["plugin:vitest/recommended"],
    },
  ],
};
