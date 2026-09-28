import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, spyOn, within } from "storybook/test";

import {
  cssValue,
  formatValue,
  rgbOf,
  stepUtilities,
  token,
  tokensWithPrefix,
  typographyOf,
  utilitiesOf,
} from "./catalogue";
import { spyOnClipboard } from "./clipboard";
import { ContrastMatrix, VERDICT_LABEL } from "./contrast-matrix";
import { CopyChips } from "./copy";
import { requireElement } from "./dom";
import { MotionDemo } from "./motion-demo";
import { RadiusScale } from "./radius-scale";
import { ShadowLadder } from "./shadow-ladder";
import { SpacingScale } from "./spacing-scale";
import { Swatch } from "./swatch";
import { TokenTable } from "./token-table";
import { TypeSpecimen } from "./type-specimen";

/** Contract tests for the docs-only helpers. Hidden from the sidebar; run by storybook:test. */
const meta = {
  title: "Introduction/Docs kit",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissingTokenFailsLoudly: Story = {
  render: () => <span className="font-mono text-mono">Token lookups throw on unknown names.</span>,
  play: async () => {
    await expect(() => token("color-does-not-exist")).toThrow(/no token "color-does-not-exist"/);
    await expect(() => tokensWithPrefix("color-nope-")).toThrow(
      /no base token starts with "color-nope-"/
    );
    await expect(() => typographyOf("color-pink-500")).toThrow(/not a typography token/);
    await expect(() => utilitiesOf("radius-nope")).toThrow(/no token "radius-nope"/);
  },
};

export const NumericStepsSortByNumber: Story = {
  render: () => <span className="font-mono text-mono">Numeric steps list in numeric order.</span>,
  play: async () => {
    const ink = tokensWithPrefix("color-ink-", "primitive")
      .filter((entry) => entry.path.length === 3 && entry.path[1] === "ink")
      .map((entry) => entry.name);
    await expect(ink.at(0)).toBe("color-ink-000");
    await expect(ink.at(-1)).toBe("color-ink-900");
    const pink = tokensWithPrefix("color-pink-", "primitive").map((entry) => entry.name);
    await expect(pink.indexOf("color-pink-50")).toBeLessThan(pink.indexOf("color-pink-100"));
  },
};

/**
 * R56: each token's utility classes come from its Tailwind namespace. These class strings are
 * written out literally on purpose — Tailwind scans this file, so each one is generated, and the
 * play proves the derived class really paints its token's value (a wrong mapping would name a
 * class that does nothing).
 */
const DERIVED = [
  {
    name: "color-pink-500",
    paints: [
      ["bg-pink-500", "backgroundColor"],
      ["text-pink-500", "color"],
      ["border-pink-500", "borderTopColor"],
      // R65: the library also writes the brand pink as a form accent and an SVG fill.
      ["accent-pink-500", "accentColor"],
      ["fill-pink-500", "fill"],
    ],
    expected: () => rgbOf("color-pink-500"),
  },
  // R62: every other colour's chips follow its role, read from its name.
  {
    name: "color-text-body",
    paints: [["text-text-body", "color"]],
    expected: () => rgbOf("color-text-body"),
  },
  {
    name: "color-surface-card",
    paints: [["bg-surface-card", "backgroundColor"]],
    expected: () => rgbOf("color-surface-card"),
  },
  {
    name: "color-border-subtle",
    // R65: the role default plus the library's own use as a hairline fill (`bg-border-subtle`).
    paints: [
      ["border-border-subtle", "borderTopColor"],
      ["bg-border-subtle", "backgroundColor"],
    ],
    expected: () => rgbOf("color-border-subtle"),
  },
  {
    name: "color-mint-strong",
    paints: [["text-mint-strong", "color"]],
    expected: () => rgbOf("color-mint-strong"),
  },
  // R65: plus the classes the library really writes — the status glyphs paint `text-status-*`.
  {
    name: "color-status-success",
    paints: [
      ["bg-status-success", "backgroundColor"],
      ["border-status-success", "borderTopColor"],
      ["text-status-success", "color"],
    ],
    expected: () => rgbOf("color-status-success"),
  },
  {
    name: "color-turmeric",
    paints: [
      ["bg-turmeric", "backgroundColor"],
      ["border-turmeric", "borderTopColor"],
    ],
    expected: () => rgbOf("color-turmeric"),
  },
  {
    name: "radius-lg",
    paints: [["rounded-lg", "borderTopLeftRadius"]],
    expected: () => cssValue("radius-lg"),
  },
  {
    name: "border-width-strong",
    paints: [
      ["border-strong", "borderTopWidth"],
      ["border-2", "borderTopWidth"],
    ],
    expected: () => cssValue("border-width-strong"),
  },
  {
    name: "border-width-default",
    paints: [
      ["border-default", "borderTopWidth"],
      ["border", "borderTopWidth"],
    ],
    expected: () => cssValue("border-width-default"),
  },
  {
    name: "text-h1",
    paints: [["text-h1", "fontSize"]],
    expected: () => typographyOf("text-h1").fontSize,
  },
  {
    name: "font-weight-bold",
    paints: [["font-bold", "fontWeight"]],
    expected: () => cssValue("font-weight-bold"),
  },
  {
    name: "container-article",
    paints: [["max-w-article", "maxWidth"]],
    expected: () => cssValue("container-article"),
  },
  {
    name: "ease-out",
    paints: [["ease-out", "transitionTimingFunction"]],
    expected: () => cssValue("ease-out"),
  },
  {
    name: "duration-fast",
    paints: [["duration-fast", "transitionDuration"]],
    expected: () => `${String(Number.parseFloat(cssValue("duration-fast")) / 1000)}s`,
  },
  {
    name: "z-header",
    paints: [["z-header", "zIndex"]],
    expected: () => cssValue("z-header"),
  },
  {
    // R63: a primitive sizing token is marked by its documented use — the touch-target minimum
    // height (the plans only ever write `min-h-hit`).
    name: "spacing-hit",
    paints: [["min-h-hit", "minHeight"]],
    expected: () => cssValue("spacing-hit"),
  },
  {
    name: "spacing-header",
    paints: [["h-header", "height"]],
    expected: () => cssValue("spacing-header"),
  },
  {
    // A spacing token with no marker is padding, margin or a gap.
    name: "spacing-gutter-mobile",
    paints: [
      ["p-gutter-mobile", "paddingTop"],
      ["m-gutter-mobile", "marginBottom"],
      ["mt-gutter-mobile", "marginTop"],
      ["gap-gutter-mobile", "rowGap"],
    ],
    expected: () => cssValue("spacing-gutter-mobile"),
  },
  {
    // R61: a sizing token's marker names the utility the library uses it as.
    name: "spacing-icon-sm",
    paints: [["size-icon-sm", "width"]],
    expected: () => cssValue("spacing-icon-sm"),
  },
  {
    name: "spacing-button-h-md",
    paints: [
      ["h-button-h-md", "height"],
      ["min-w-button-h-md", "minWidth"],
    ],
    expected: () => cssValue("spacing-button-h-md"),
  },
] as const;

export const UtilitiesDeriveFromTheCatalogue: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {DERIVED.flatMap(({ paints }) =>
        paints.map(([utility]) => (
          <span
            key={utility}
            aria-hidden
            data-utility={utility}
            className={`relative block border-solid ${utility}`}
          />
        ))
      )}
      <span
        aria-hidden
        data-utility="max-w-text-measure-prose"
        className="max-w-text-measure-prose"
      />
      <span
        aria-hidden
        data-measure-reference
        style={{ maxWidth: `var(${token("spacing-text-measure-prose").cssVar})` }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const { name, paints, expected } of DERIVED) {
      await expect(utilitiesOf(name)).toEqual(paints.map(([utility]) => utility));
      for (const [utility, property] of paints) {
        const probe = requireElement(canvasElement, `[data-utility="${utility}"]`);
        await expect(getComputedStyle(probe)[property], `${utility} paints ${name}`).toBe(
          expected()
        );
      }
    }
    // The 4px scale: step N gives the stock spacing utilities at N.
    await expect(stepUtilities(3)).toEqual(["p-3", "m-3", "mt-3", "gap-3"]);
    // R59: a measure (a `ch` spacing token) is a width — `max-w-*` only, never padding or a gap.
    const measures = tokensWithPrefix("spacing-").filter((entry) =>
      formatValue(entry.value).endsWith("ch")
    );
    await expect(measures.map((entry) => entry.name)).toContain("spacing-text-measure-prose");
    for (const entry of measures) {
      await expect(utilitiesOf(entry.name)).toEqual([
        `max-w-${entry.name.slice("spacing-".length)}`,
      ]);
    }
    await expect(
      getComputedStyle(requireElement(canvasElement, '[data-utility="max-w-text-measure-prose"]'))
        .maxWidth
    ).toBe(getComputedStyle(requireElement(canvasElement, "[data-measure-reference]")).maxWidth);
    // R60: the prose containers are reached through their measure aliases — never Tailwind's static
    // `max-w-prose` (65ch), which shadows `--container-prose`.
    await expect(utilitiesOf("container-prose")).toEqual(["max-w-text-measure-prose"]);
    await expect(utilitiesOf("container-prose-narrow")).toEqual(["max-w-text-measure-narrow"]);
    // A token no utility reads (an artboard size) has no classes rather than an invented one.
    await expect(utilitiesOf("canvas-post-w")).toEqual([]);
  },
};

export const CopyChipsCopyAClass: Story = {
  render: () => <CopyChips values={utilitiesOf("radius-lg")} />,
  play: async ({ canvas, userEvent }) => {
    const [utility] = utilitiesOf("radius-lg");
    if (utility === undefined) throw new Error("radius-lg has no utility class");
    await spyOnClipboard(async (write) => {
      await expect(canvas.getByRole("status")).toHaveTextContent("");
      await userEvent.click(canvas.getByRole("button", { name: utility }));
      await expect(write).toHaveBeenLastCalledWith(utility);
      await expect(canvas.getByRole("status")).toHaveTextContent(`Copied ${utility}`);
    });
  },
};

export const CopyWithoutAClipboard: Story = {
  render: () => <CopyChips values={utilitiesOf("radius-lg")} />,
  play: async ({ canvas, userEvent }) => {
    // Outside a secure context (a plain-http preview) `navigator.clipboard` is undefined: a click
    // copies nothing and throws nothing.
    const absent = spyOn(navigator, "clipboard", "get").mockReturnValue(
      undefined as unknown as Clipboard
    );
    try {
      const [utility] = utilitiesOf("radius-lg");
      if (utility === undefined) throw new Error("radius-lg has no utility class");
      await userEvent.click(canvas.getByRole("button", { name: utility }));
      await expect(canvas.getByRole("status")).toHaveTextContent("");
    } finally {
      absent.mockRestore();
    }
  },
};

export const SwatchPaintsItsToken: Story = {
  render: () => (
    <div className="grid max-w-150 grid-cols-2 gap-4">
      <Swatch name="color-pink-500" />
      <Swatch name="color-text-body" />
    </div>
  ),
  play: async ({ canvas }) => {
    const chip = canvas.getByRole("img", { name: token("color-pink-500").cssVar });
    await expect(getComputedStyle(chip).backgroundColor).toBe(rgbOf("color-pink-500"));
    await expect(
      canvas.getByText(`→ ${token("color-text-body").reference ?? "no reference"}`)
    ).toBeVisible();
  },
};

export const SwatchCopiesNameAndValue: Story = {
  render: () => <Swatch name="color-pink-500" />,
  play: async ({ canvas, userEvent }) => {
    const entry = token("color-pink-500");
    const value = formatValue(entry.value);
    await spyOnClipboard(async (write) => {
      await userEvent.click(canvas.getByRole("button", { name: entry.cssVar }));
      await expect(write).toHaveBeenLastCalledWith(entry.cssVar);
      await expect(canvas.getByRole("status")).toHaveTextContent(`Copied ${entry.cssVar}`);
      await userEvent.click(canvas.getByRole("button", { name: value }));
      await expect(write).toHaveBeenLastCalledWith(value);
      await expect(canvas.getByRole("status")).toHaveTextContent(`Copied ${value}`);
      for (const utility of utilitiesOf(entry.name)) {
        await userEvent.click(canvas.getByRole("button", { name: utility }));
        await expect(write).toHaveBeenLastCalledWith(utility);
      }
    });
  },
};

export const TokenTableListsEveryMatch: Story = {
  render: () => <TokenTable caption="Durations" selection={{ prefix: "duration-" }} />,
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: "Durations" });
    await expect(within(table).getAllByRole("row")).toHaveLength(
      tokensWithPrefix("duration-").length + 1
    );
    await expect(within(table).getByText(token("duration-fast").cssVar)).toBeVisible();
    for (const utility of utilitiesOf("duration-fast")) {
      await expect(within(table).getByRole("button", { name: utility })).toBeVisible();
    }
  },
};

export const TypeSpecimenUsesTheStep: Story = {
  render: () => (
    <TypeSpecimen step="h1" family="display">
      Our Menu
    </TypeSpecimen>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText("Our Menu")).fontSize).toBe(
      typographyOf("text-h1").fontSize
    );
    const h1 = token("text-h1");
    await expect(
      canvas.getByText(`${h1.cssVar} · ${formatValue(h1.value)} · ${token("font-display").cssVar}`)
    ).toBeVisible();
    for (const name of ["text-h1", "font-display", "font-weight-bold"]) {
      for (const utility of utilitiesOf(name)) {
        await expect(canvas.getByRole("button", { name: utility })).toBeVisible();
      }
    }
  },
};

export const ContrastMatrixRatesEachPair: Story = {
  render: () => <ContrastMatrix groups={["on-brand-fill", "on-inverse"]} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(VERDICT_LABEL.exception)).toBeVisible();
    await expect(canvas.getByText(VERDICT_LABEL.pass)).toBeVisible();
    await expect(canvas.queryByText(VERDICT_LABEL.fail)).toBeNull();
  },
};

export const SpacingScaleMultipliesTheUnit: Story = {
  render: () => <SpacingScale steps={[1, 6, 10]} />,
  play: async ({ canvas, canvasElement }) => {
    const unit = Number.parseFloat(cssValue("spacing"));
    for (const step of [1, 6, 10]) {
      const bar = requireElement(canvasElement, `[data-step="${String(step)}"]`);
      await expect(bar.getBoundingClientRect().width).toBe(step * unit);
      for (const utility of stepUtilities(step)) {
        await expect(canvas.getByRole("button", { name: utility })).toBeVisible();
      }
    }
  },
};

export const RadiusScaleShowsEveryRadius: Story = {
  render: () => <RadiusScale />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(
      tokensWithPrefix("radius-", "primitive").length
    );
    const card = requireElement(canvasElement, '[data-token="radius-lg"]');
    await expect(getComputedStyle(card).borderTopLeftRadius).toBe(cssValue("radius-lg"));
    await expect(canvas.getByRole("button", { name: token("radius-lg").cssVar })).toBeVisible();
    for (const utility of utilitiesOf("radius-lg")) {
      await expect(canvas.getByRole("button", { name: utility })).toBeVisible();
    }
  },
};

export const ShadowLadderPaintsEachStep: Story = {
  render: () => <ShadowLadder names={["shadow-1", "shadow-3", "shadow-brand"]} />,
  play: async ({ canvas, canvasElement }) => {
    const raised = requireElement(canvasElement, '[data-token="shadow-3"]');
    await expect(getComputedStyle(raised).boxShadow).not.toBe("none");
    await expect(canvas.getByText(token("shadow-brand").description)).toBeVisible();
    for (const utility of utilitiesOf("shadow-3")) {
      await expect(canvas.getByRole("button", { name: utility })).toBeVisible();
    }
  },
};

export const MotionDemoRunsOnTheTokens: Story = {
  render: () => <MotionDemo ease="out" duration="base" use="state changes" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const play = canvas.getByRole("button", {
      name: `Play ${token("ease-out").cssVar} over ${token("duration-base").cssVar}`,
    });
    await userEvent.click(play);
    await expect(play).toHaveAttribute("aria-pressed", "true");
    const dot = getComputedStyle(requireElement(canvasElement, '[data-token="ease-out"]'));
    await expect(dot.transitionTimingFunction).toBe(cssValue("ease-out"));
    await expect(Number.parseFloat(dot.transitionDuration) * 1000).toBe(
      Number.parseFloat(cssValue("duration-base"))
    );
    for (const utility of [...utilitiesOf("duration-base"), ...utilitiesOf("ease-out")]) {
      await expect(canvas.getByRole("button", { name: utility })).toBeVisible();
    }
  },
};
