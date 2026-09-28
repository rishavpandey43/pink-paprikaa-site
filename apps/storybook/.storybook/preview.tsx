import "./fonts";
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
  soft: { name: "Soft — light pink", value: "var(--color-surface-brand-soft)" },
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
           * `color-contrast` is owned by the token contrast policy (spec §5.4): every text/background
           * pair the components use is measured in `packages/design-tokens` on every build, with white
           * on the brand pink as the single declared exception at the AA-large floor. axe cannot scope
           * an exception to one pair, so here it is off; every other axe rule fails the story.
           */
          { id: "color-contrast", enabled: false },
        ],
      },
    },
    options: {
      // Introduction, then the design system's thirteen tab groups in its own order (foundations,
      // then the atomic layers, then the reference kits), instead of alphabetical. Foundation pages
      // follow the design system's card order; component stories inside a layer stay alphabetical.
      storySort: {
        order: [
          "Introduction",
          "Brand",
          ["Logo", "Pattern", "Company details", "Voice & content", "Iconography"],
          "Colors",
          ["Primary", "Ink", "Accents", "Heat", "Semantic", "Surfaces", "Status", "Contrast"],
          "Type",
          ["Display", "Headings", "Body", "Overline & mono", "Devanagari", "Fluid"],
          "Spacing",
          ["Scale", "Layout rhythm"],
          "Layout",
          [
            "Breakpoints",
            "AutoGrid",
            "Radii",
            "Borders",
            "Elevation",
            "Card anatomy",
            "Utility classes",
          ],
          "Motion",
          ["Motion", "States", "Form states", "Section reveal"],
          "Marketing",
          ["Canvas formats", "Canvas type", "Kit", ["Feed", "Ads"]],
          "Atoms",
          "Molecules",
          "Organisms",
          "Layouts",
          "Website",
          "App",
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="font-body text-body text-text-body">
        <Story />
      </div>
    ),
  ],
};

export default preview;
