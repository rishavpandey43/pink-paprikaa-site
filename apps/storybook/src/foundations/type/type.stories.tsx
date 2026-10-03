import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { brand } from "@pink-paprikaa-web/content";
import { formatRupees } from "@pink-paprikaa-web/utils";

import { typographyOf, utilitiesOf } from "../../docs-kit/catalogue";
import { spyOnClipboard } from "../../docs-kit/clipboard";
import { TokenTable } from "../../docs-kit/token-table";
import { TypeSpecimen } from "../../docs-kit/type-specimen";
import { OUTLET } from "../../kits/fixtures";

/** Live visuals for the Type pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Type/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const FLUID_TOKENS = ["display-1", "display-2", "h1", "h2", "h3", "h4", "body"].map(
  (step) => `text-${step}-fluid`
);

export const DisplaySteps: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TypeSpecimen step="display-1" family="display">
        {brand.statement}
      </TypeSpecimen>
      <TypeSpecimen step="display-2" family="display">
        {brand.statement}
      </TypeSpecimen>
    </div>
  ),
};

export const FamiliesAndWeights: Story = {
  render: () => <TokenTable caption="Families and weights" selection={{ prefix: "font-" }} />,
};

export const HeadingSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="h1" family="display">
        Our Menu
      </TypeSpecimen>
      <TypeSpecimen step="h2" family="display">
        Chai &amp; Coffee
      </TypeSpecimen>
      <TypeSpecimen step="h3" family="display">
        Small Plates
      </TypeSpecimen>
      <TypeSpecimen step="h4" family="display">
        Add-ons
      </TypeSpecimen>
    </div>
  ),
  // R56: each specimen's chips copy the classes that set it — size, family and weight.
  play: async ({ canvas, userEvent }) => {
    const [size] = utilitiesOf("text-h1");
    const [family] = utilitiesOf("font-display");
    if (size === undefined || family === undefined) throw new Error("h1 has no utility classes");
    await spyOnClipboard(async (write) => {
      await userEvent.click(canvas.getByRole("button", { name: size }));
      await expect(write).toHaveBeenLastCalledWith(size);
      // Every heading step is Poppins, so each specimen offers the family chip; copy the first.
      const [familyChip] = canvas.getAllByRole("button", { name: family });
      if (familyChip === undefined) throw new Error(`no ${family} chip`);
      await userEvent.click(familyChip);
      await expect(write).toHaveBeenLastCalledWith(family);
    });
  },
};

export const BodySteps: Story = {
  render: () => (
    <div className="flex max-w-text-measure-prose flex-col gap-4">
      <TypeSpecimen step="body-lg" family="body" color="body">
        We roast our own masala every morning, then build the rest of the day around it.
      </TypeSpecimen>
      <TypeSpecimen step="body" family="body" color="body">
        Amritsari paneer, burnt chilli mayo, potato brioche. Served with masala fries.
      </TypeSpecimen>
      <TypeSpecimen step="body-sm" family="body" color="muted">
        Contains dairy and gluten. Ask us about swaps.
      </TypeSpecimen>
      <TypeSpecimen step="caption" family="body" color="subtle">
        {brand.billing.taxNote}
      </TypeSpecimen>
    </div>
  ),
};

export const OverlineAndMono: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="overline" family="display" color="brand" isUppercase>
        {brand.tagline}
      </TypeSpecimen>
      <TypeSpecimen step="overline" family="display" color="muted" isUppercase>
        {`Now Serving · ${OUTLET.name}, ${OUTLET.city}`}
      </TypeSpecimen>
      <TypeSpecimen step="mono" family="mono">
        {`ORDER #${brand.billing.invoicePrefix}-4821 · 26 JUL 2026 · ${formatRupees(1240)}`}
      </TypeSpecimen>
    </div>
  ),
};

export const Devanagari: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="h1" family="devanagari" color="brand">
        {brand.nameDevanagari}
      </TypeSpecimen>
      <div className="flex flex-wrap items-baseline gap-7">
        <TypeSpecimen step="h2" family="devanagari">
          छोले
        </TypeSpecimen>
        <TypeSpecimen step="h2" family="devanagari">
          कुल्फी
        </TypeSpecimen>
        <TypeSpecimen step="h2" family="devanagari">
          मसाला चाय
        </TypeSpecimen>
      </div>
    </div>
  ),
};

export const FluidSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="display-2-fluid" family="display">
        Desi at heart.
      </TypeSpecimen>
      <TypeSpecimen step="h1-fluid" family="display">
        Most ordered this week
      </TypeSpecimen>
      <TypeSpecimen step="h3-fluid" family="display">
        Small Plates
      </TypeSpecimen>
    </div>
  ),
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas }) => {
    // At the 360px floor a fluid step sits at its clamp() minimum and still fits the screen.
    const sample = canvas.getByText("Most ordered this week");
    const minimum = /clamp\((?<min>[\d.]+)px/.exec(typographyOf("text-h1-fluid").fontSize)?.groups
      ?.min;
    if (minimum === undefined) throw new Error("text-h1-fluid is not a clamp() with a px minimum");
    await expect(getComputedStyle(sample).fontSize).toBe(`${minimum}px`);
    await expect(sample.scrollWidth).toBeLessThanOrEqual(sample.clientWidth);
  },
};

export const FluidTokens: Story = {
  render: () => <TokenTable caption="Fluid steps" selection={{ names: FLUID_TOKENS }} />,
};
