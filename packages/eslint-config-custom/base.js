module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:eslint-comments/recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:unicorn/recommended",
  ],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  ignorePatterns: ["dist"],
  rules: {
    "eslint-comments/no-unused-disable": "error",
    "import/no-default-export": "error",
    "import/order": "error",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { allowExpressions: true },
    ],
    "prefer-template": "error",
    "no-console": "error",
    "unicorn/prevent-abbreviations": [
      "error",
      {
        replacements: {
          db: false,
          env: false,
          params: false,
          props: false,
          src: false,
          err: false,
        },
      },
    ],
    "unicorn/no-null": "off",
    "unicorn/no-useless-undefined": "off",
  },
};
