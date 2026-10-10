import { expect } from "storybook/test";

/**
 * Every design must survive the 360px floor (readme §3.10): the story really ran at `width`, and
 * nothing on the page scrolls sideways.
 */
export async function expectNoHorizontalOverflow(
  canvasElement: HTMLElement,
  width: number
): Promise<void> {
  const page = canvasElement.ownerDocument.documentElement;
  await expect(canvasElement.ownerDocument.defaultView?.innerWidth).toBe(width);
  await expect(
    page.scrollWidth,
    `the page is ${String(page.scrollWidth)}px wide at a ${String(page.clientWidth)}px viewport`
  ).toBeLessThanOrEqual(page.clientWidth);
}
