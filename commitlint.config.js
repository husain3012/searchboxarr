export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // new feature → minor version bump
        "fix", // bug fix → patch version bump
        "docs", // documentation only
        "style", // formatting, no logic change
        "refactor", // neither fix nor feature
        "perf", // performance improvement → patch bump
        "test", // adding/fixing tests
        "build", // build system or dependencies
        "ci", // CI/CD changes
        "chore", // maintenance tasks
        "revert", // reverts a previous commit
      ],
    ],
    "subject-min-length": [2, "always", 3],
    "subject-case": [0], // don't enforce case
  },
};
