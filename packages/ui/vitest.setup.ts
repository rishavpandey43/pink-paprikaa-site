import "@testing-library/jest-dom/vitest";
import axeCore, { type RunOptions } from "axe-core";
import { expect } from "vitest";

/**
 * The accessibility assertion every component test ends with (handbook 08 §1 step 2).
 *
 * `axe-core` is driven directly rather than through a wrapper package: Storybook's a11y addon
 * already pins `axe-core`, so tests and stories run one engine and one rule set.
 *
 * This is a plain async assertion rather than a custom `toHaveNoViolations()` matcher because
 * Vitest declares `interface Matchers<T = any>`, so augmenting it would force an `any` into the
 * type surface to satisfy TS2428 (identical type parameters). A helper keeps the whole package
 * `any`-free, and folds the axe run and the assertion into one call.
 *
 * `color-contrast` is disabled: jsdom computes no layout and resolves no stylesheet, so every
 * element reports transparent-on-transparent and the rule yields noise, not findings. Contrast is
 * checked for real in Storybook, where the a11y addon runs the same engine against rendered CSS.
 */
export async function expectNoA11yViolations(
  container: Element,
  options: RunOptions = {}
): Promise<void> {
  const { violations } = await axeCore.run(container, {
    ...options,
    rules: { "color-contrast": { enabled: false }, ...options.rules },
  });

  const detail = violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => `      ${node.html}`).join("\n");
      return `  [${violation.id}] ${violation.help}\n    ${violation.helpUrl}\n${nodes}`;
    })
    .join("\n\n");

  expect(violations, `accessibility violations:\n\n${detail}`).toHaveLength(0);
}
