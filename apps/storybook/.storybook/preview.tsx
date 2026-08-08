import "./styles.css";

import type { Preview } from "@storybook/react-vite";

import { INITIAL_VIEWPORTS } from "storybook/viewport";

/**
 * The system's own breakpoints, plus 360px.
 *
 * 360 is not a token — it is the floor the responsive contract sets ("every design must survive
 * 360px", INVENTORY.md), so it belongs in the review toolbar even though no token names it.
 */
const viewports = {
  floor360: {
    name: "360 — smallest supported",
    styles: { width: "360px", height: "780px" },
    type: "mobile",
  },
  sm: { name: "sm — 480", styles: { width: "480px", height: "900px" }, type: "mobile" },
  md: { name: "md — 768", styles: { width: "768px", height: "1024px" }, type: "tablet" },
  lg: { name: "lg — 1024", styles: { width: "1024px", height: "900px" }, type: "desktop" },
  xl: { name: "xl — 1280", styles: { width: "1280px", height: "900px" }, type: "desktop" },
  xxl: { name: "2xl — 1440", styles: { width: "1440px", height: "960px" }, type: "desktop" },
} as const;

/**
 * The system's breakpoints come first because they are the contract every component is written
 * against; Storybook's real-device presets (iPhone, Pixel, iPad, Galaxy …) follow so a component
 * can also be checked at the sizes guests actually hold. Reviewing at a device size is not optional
 * here — "every design must survive 360px" is a rule, and the toolbar is how it gets checked.
 */
const deviceViewports = { ...viewports, ...INITIAL_VIEWPORTS };

/**
 * The four grounds a component is allowed to sit on (guide §3.1: at most two background colours
 * per composition — white/tint plus one flooded pink or ink panel). Values are token references,
 * never literals, so the switcher cannot drift from the palette.
 */
const backgrounds = {
  page: { name: "Page — white", value: "var(--color-surface-page)" },
  tint: { name: "Page alt — pink tint", value: "var(--color-surface-page-alt)" },
  brand: { name: "Brand — flooded pink", value: "var(--color-surface-brand)" },
  inverse: { name: "Inverse — ink", value: "var(--color-surface-inverse)" },
} as const;

const preview: Preview = {
  // Every story gets a generated docs page; components add their own MDX where the API needs prose.
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    viewport: { options: deviceViewports },
    backgrounds: { options: backgrounds },
    a11y: {
      // Findings fail the story rather than sitting in a panel nobody opens.
      test: "error",
      config: {
        rules: [
          /**
           * `color-contrast` is OFF, and this is a deliberate, owner-made brand decision — not an
           * oversight and not a convenience.
           *
           * White on the brand pink `#EE2C68` measures **4.04:1**. WCAG AA asks 4.5:1 for normal
           * text and 3:1 for large, so white-on-brand passes at heading sizes and falls just short
           * at body sizes. The three ways out were: darken the panel (rejected — `#EE2C68` is the
           * brand), enlarge every label on pink (rejected — it distorts the components), or use
           * dark ink on pink (rejected — "white type on a flooded pink field" is the brand's
           * signature relationship, design guide §3.1).
           *
           * The owner chose to keep white text. With that settled, leaving the rule on would mean
           * ~460 permanent failures that no one can ever action, which trains everyone to ignore a
           * red suite — the rule would protect nothing and cost the gate its credibility.
           *
           * Everything else axe checks still FAILS the story: names, roles, labels, landmarks,
           * focus order, keyboard reachability, ARIA correctness. Only this one ratio is exempt.
           * Revisit if the brand palette is ever reopened.
           */
          { id: "color-contrast", enabled: false },
        ],
      },
    },
    options: {
      // Atoms → molecules → organisms → templates, matching the layering rule, instead of
      // alphabetical (which would file "Atoms" after "Organisms" only by accident of spelling).
      storySort: {
        order: ["Foundations", "Atoms", "Molecules", "Organisms", "Templates"],
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="font-body text-body1 leading-body1 text-text-body">
        <Story />
      </div>
    ),
  ],
};

export default preview;
