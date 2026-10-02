import jsxA11y from "eslint-plugin-jsx-a11y";
import { Linter } from "eslint";
import assert from "node:assert/strict";
import { test } from "node:test";

import react from "./react.js";

const linter = new Linter();

/** The preset's own setting for `rule`: the last block that sets it wins, as in ESLint. */
function setting(rule) {
  return react.findLast((block) => block.rules?.[rule] !== undefined)?.rules[rule];
}

/** How many `jsx-a11y/no-redundant-roles` errors `jsx` raises under the preset's setting. */
function redundantRoles(jsx) {
  const messages = linter.verify(
    `const probe = ${jsx};`,
    [
      {
        files: ["**/*.jsx"],
        plugins: { "jsx-a11y": jsxA11y },
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        rules: { "jsx-a11y/no-redundant-roles": setting("jsx-a11y/no-redundant-roles") },
      },
    ],
    "probe.jsx"
  );
  assert.deepEqual(
    messages.filter((message) => message.ruleId !== "jsx-a11y/no-redundant-roles"),
    []
  );
  return messages.length;
}

test("allows role=list on a list, which Safari needs once list-style is none", () => {
  assert.equal(redundantRoles('<ol role="list"><li>One</li></ol>'), 0);
  assert.equal(redundantRoles('<ul role="list"><li>One</li></ul>'), 0);
  assert.equal(redundantRoles('<nav role="navigation" aria-label="Main" />'), 0);
});

test("still flags every other redundant role", () => {
  assert.equal(redundantRoles('<button role="button">Go</button>'), 1);
  assert.equal(redundantRoles('<li role="listitem">One</li>'), 1);
});
