// packages/ui/src/lib/sx.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { sxClass } from "./sx";

const meta = { title: "Foundations/Sx/Proof", tags: ["!autodocs"] } satisfies Meta;
export default meta;

/** Proves the safelist ships CSS: these classes are built at runtime, never written in source. */
export const ResponsiveClassesHaveCss: StoryObj = {
  render: () => (
    <div>
      <div data-testid="m" className={sxClass({ mt: { base: 6 } })} />
      <div data-testid="d" className={sxClass({ display: { base: "none", xl: "block" } })} />
      <div data-testid="g" className={`grid ${sxClass({ gapX: { base: 3 } })}`} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(getComputedStyle(c.getByTestId("m")).marginTop).toBe("24px");
    await expect(getComputedStyle(c.getByTestId("d")).display).toBe("none");
    await expect(getComputedStyle(c.getByTestId("g")).columnGap).toBe("12px");
  },
};
