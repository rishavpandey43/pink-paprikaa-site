import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

/**
 * Live checks for the global base-layer chrome (scrollbars, selection). Hidden from the sidebar;
 * run by storybook:test.
 */
const meta = {
  title: "Foundations/Interactions",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const GlobalBase: Story = {
  render: () => (
    <div
      data-testid="scroll-box"
      role="region"
      aria-label="Scrollable sample"
      // Specimen must be keyboard-reachable for axe scrollable-region-focusable.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard scroll specimen
      tabIndex={0}
      className="h-32 w-80 overflow-auto rounded-md border border-border-default p-4"
    >
      <p>
        Scroll this box. The page uses the design system&apos;s thin pink scrollbar and pink-100
        selection — never the browser&apos;s chrome.
      </p>
      <p>Second paragraph so the box overflows.</p>
      <p>Third paragraph for height.</p>
    </div>
  ),
  play: async ({ canvas }) => {
    const box = canvas.getByTestId("scroll-box");
    const style = getComputedStyle(box);
    await expect(style.scrollbarWidth).toBe("thin");
    await expect(style.scrollbarColor.length).toBeGreaterThan(0);

    function* rulesOf(list: CSSRuleList): Generator<CSSStyleRule> {
      for (const rule of list) {
        if (rule instanceof CSSStyleRule) yield rule;
        if ("cssRules" in rule) yield* rulesOf((rule as CSSGroupingRule).cssRules);
      }
    }

    const sheets = [...document.styleSheets, ...document.adoptedStyleSheets];
    let hasSelection = false;
    for (const sheet of sheets) {
      try {
        for (const rule of rulesOf(sheet.cssRules)) {
          if (
            rule.selectorText.includes("::selection") &&
            (rule.cssText.includes("--color-pink-100") || rule.cssText.includes("pink-100"))
          ) {
            hasSelection = true;
            break;
          }
        }
      } catch {
        // Cross-origin stylesheets throw; ignore.
      }
      if (hasSelection) break;
    }
    await expect(hasSelection).toBe(true);
  },
};
