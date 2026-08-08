export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "web",
        "blog",
        "storybook",
        "ui",
        "tokens",
        "content",
        "seo",
        "utils",
        "tools",
        "ci",
        "deps",
      ],
    ],
  },
};
