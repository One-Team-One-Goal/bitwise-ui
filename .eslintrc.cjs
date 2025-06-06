module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  plugins: ["react", "jsx-a11y", "react-hooks"],
  settings: {
    react: {
      version: "detect",
    },
  },
};
