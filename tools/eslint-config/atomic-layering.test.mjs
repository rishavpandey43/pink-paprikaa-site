import { Linter } from "eslint";
import assert from "node:assert/strict";
import { test } from "node:test";

import atomicLayering from "./atomic-layering.js";

const linter = new Linter();
const TIERS = ["atoms", "molecules", "organisms", "layouts"];

/** How many errors `import "<source>"` raises in a component file of `tier`. */
function errors(tier, source) {
  return linter.verify(`import "${source}";`, atomicLayering, `src/${tier}/probe/probe.js`).length;
}

test("no tier imports the package barrel, by any spelling", () => {
  for (const tier of TIERS) {
    for (const barrel of [
      "..",
      "../..",
      "../../",
      "../../index",
      "../../index.ts",
      "../../../src",
      "../../../src/index",
      "../../../src/index.ts",
      "@pink-paprikaa-web/ui",
      "@pink-paprikaa-web/ui/styles.css",
    ]) {
      assert.equal(errors(tier, barrel), 1, `${tier} importing "${barrel}"`);
    }
  }
});

const ALLOWED = [
  "../../lib/component-variants",
  "../../assets/brand/logo-pink.svg",
  "../../styles.css",
  "../../../vitest.setup",
  "react",
  "@pink-paprikaa-web/utils",
  "@pink-paprikaa-web/design-tokens/tokens.json",
];

test("every tier may import lib, assets, the stylesheet, the test setup and packages", () => {
  for (const tier of TIERS) {
    for (const source of ALLOWED) {
      assert.equal(errors(tier, source), 0, `${tier} importing "${source}"`);
    }
  }
});

test("a layer never imports one above it, and may import any below", () => {
  assert.equal(errors("atoms", "../../molecules/field/field"), 1);
  assert.equal(errors("molecules", "../../organisms/site-header/site-header"), 1);
  assert.equal(errors("organisms", "../../layouts/stack/stack"), 1);
  assert.equal(errors("molecules", "../../atoms/text/text"), 0);
  assert.equal(errors("layouts", "../../organisms/site-header/site-header"), 0);
});

test("an atom imports no other atom but Icon", () => {
  assert.equal(errors("atoms", "../text/text"), 1);
  assert.equal(errors("atoms", "../../atoms/text/text"), 1);
  assert.equal(errors("atoms", "../icon/icon"), 0);
  assert.equal(errors("atoms", "../../atoms/icon/icon"), 0);
});
