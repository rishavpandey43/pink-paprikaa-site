import "@testing-library/jest-dom/vitest";
import axeCore, { type RunOptions } from "axe-core";
import { expect } from "vitest";

/**
 * The accessibility assertion every component test ends with (handbook 08 §1).
 *
 * `color-contrast` is disabled: jsdom resolves no stylesheet, and contrast is owned by the token
 * contrast policy (`packages/design-tokens/contrast-pairs.json`, spec §5.4), which measures every
 * pair the components use. Every other axe rule fails the test.
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

/*
 * Browser APIs jsdom lacks. Tests that need to drive them replace these per test. Each is installed
 * only where missing — guarded with `typeof … === "undefined"` rather than `??=`, which the DOM
 * typings (never nullish) make an "unnecessary condition" to lint.
 */
class InertObserver {
  observe = (): void => undefined;
  unobserve = (): void => undefined;
  disconnect = (): void => undefined;
  takeRecords = (): [] => [];
}
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = InertObserver as unknown as typeof IntersectionObserver;
}
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = InertObserver;
}
if (typeof window.matchMedia === "undefined") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
