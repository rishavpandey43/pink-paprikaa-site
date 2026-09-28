import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, spyOn, within } from "storybook/test";

import { brand } from "@pink-paprikaa-web/content";
import { Card } from "@pink-paprikaa-web/ui";

import { rgbOf, utilitiesOf } from "../../docs-kit/catalogue";
import { ContrastMatrix, contrastResults, VERDICT_LABEL } from "../../docs-kit/contrast-matrix";
import { SpecimenTile } from "../../docs-kit/specimen";
import { Swatches } from "../../docs-kit/swatch";
import { TokenTable } from "../../docs-kit/token-table";
import { OUTLET } from "../../kits/fixtures";

/** Live visuals for the Colors pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Colors/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const PINK_RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800].map(
  (step) => `color-pink-${String(step)}`
);
const INK_RAMP = ["900", "800", "700", "600", "500", "400", "300", "200", "100", "000"].map(
  (step) => `color-ink-${step}`
);
const ACCENTS = [
  "color-turmeric",
  "color-turmeric-soft",
  "color-tandoor",
  "color-tandoor-soft",
  "color-mint",
  "color-mint-soft",
  "color-kesar",
  "color-kesar-soft",
];
const TEXT_COMPANIONS = [
  "color-turmeric-strong",
  "color-mint-strong",
  "color-kesar-strong",
  "color-veg",
];
const HEAT = ["color-heat-1", "color-heat-2", "color-heat-3", "color-heat-4"];
const STATUS = ["success", "warning", "danger", "info"].flatMap((status) => [
  `color-status-${status}`,
  `color-status-${status}-soft`,
]);

/** The same markup on every ground — only the ground's surface changes. */
function SurfaceSample() {
  return (
    <>
      <h2>Find a Paprikaa</h2>
      <p>{`${OUTLET.name}, ${OUTLET.city}. Open ${brand.hours.display}.`}</p>
      <a href="#directions">Get directions</a>
    </>
  );
}

export const PinkRamp: Story = {
  render: () => <Swatches selection={{ names: PINK_RAMP }} />,
  // R56: every swatch's class chips copy the utility, not just its name and value.
  play: async ({ canvas, userEvent }) => {
    const write = spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    for (const utility of utilitiesOf("color-pink-500")) {
      await userEvent.click(canvas.getByRole("button", { name: utility }));
      await expect(write).toHaveBeenLastCalledWith(utility);
    }
    write.mockRestore();
  },
};

export const InkRamp: Story = { render: () => <Swatches selection={{ names: INK_RAMP }} /> };

export const Accents: Story = { render: () => <Swatches selection={{ names: ACCENTS }} /> };

export const TextCompanions: Story = {
  render: () => <Swatches selection={{ names: TEXT_COMPANIONS }} />,
};

// Deferred (fold list item 3): the SpiceLevel row above the swatches — Plan 2b T12.
export const HeatScale: Story = { render: () => <Swatches selection={{ names: HEAT }} /> };

export const SemanticPanels: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-4">
      <div className="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-page p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-page</span>
        <span className="font-display text-h4 text-text-heading">Heading</span>
        <span className="text-body-sm text-text-body">--color-text-body</span>
        <span className="text-body-sm text-text-muted">--color-text-muted</span>
      </div>
      <div className="flex flex-col gap-1 rounded-md bg-surface-page-alt p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-page-alt</span>
        <span className="font-display text-h4 text-text-brand">--color-text-brand</span>
        <span className="text-body-sm text-text-body">Tinted section</span>
      </div>
      <div data-surface="brand" className="flex flex-col gap-1 rounded-md bg-surface-brand p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-brand</span>
        <span className="font-display text-h4 text-text-heading">--color-text-on-brand</span>
        <span className="text-body-sm text-text-muted">Flooded pink panel</span>
      </div>
      <div data-surface="ink" className="flex flex-col gap-1 rounded-md bg-surface-inverse p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-inverse</span>
        <span className="font-display text-h4 text-text-heading">--color-text-on-inverse</span>
        <span className="text-body-sm text-text-muted">Footer / ink panel</span>
      </div>
    </div>
  ),
};

export const SemanticTokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption="Surfaces" selection={{ prefix: "color-surface-", tier: "semantic" }} />
      <TokenTable caption="Text" selection={{ prefix: "color-text-", tier: "semantic" }} />
      <TokenTable caption="Borders" selection={{ prefix: "color-border-", tier: "semantic" }} />
      <TokenTable
        caption="Interaction"
        selection={{
          names: [
            "color-brand-hover",
            "color-brand-active",
            "color-focus",
            "shadow-focus-ring",
            "shadow-focus-ring-inverse",
          ],
        }}
      />
    </div>
  ),
};

export const FourGrounds: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SpecimenTile
        caption="page · no attribute"
        className="min-h-38 flex-col items-start border border-border-subtle bg-surface-page p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
      <SpecimenTile
        caption='data-surface="soft"'
        surface="soft"
        className="min-h-38 flex-col items-start bg-surface-brand-soft p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
      <SpecimenTile
        caption='data-surface="brand"'
        surface="brand"
        className="min-h-38 flex-col items-start bg-surface-brand p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
      <SpecimenTile
        caption='data-surface="ink"'
        surface="ink"
        className="min-h-38 flex-col items-start bg-surface-inverse p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
    </div>
  ),
};

export const LightIsland: Story = {
  render: () => (
    <div data-surface="ink" className="flex flex-col gap-4 rounded-xl bg-surface-inverse p-6">
      <span className="font-mono text-mono text-text-muted">data-surface=&quot;ink&quot;</span>
      <div data-surface="brand" className="flex flex-col gap-4 rounded-lg bg-surface-brand p-5">
        <span className="font-mono text-mono text-text-muted">data-surface=&quot;brand&quot;</span>
        <Card>
          <h2>Light island</h2>
          <p>A white card inside pink inside ink reads dark again: Card sets its own surface.</p>
          <a href="#light-island">A link on the island</a>
        </Card>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const heading = canvas.getByRole("heading", { name: "Light island" });
    await expect(getComputedStyle(heading).color).toBe(rgbOf("color-ink-900"));
  },
};

export const SurfaceOverrides: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption='data-surface="brand"' selection={{ surface: "brand" }} />
      <TokenTable caption='data-surface="ink"' selection={{ surface: "ink" }} />
      <TokenTable caption='data-surface="soft"' selection={{ surface: "soft" }} />
      <TokenTable
        caption='data-surface="light" — the light island'
        selection={{ surface: "light" }}
      />
    </div>
  ),
};

// Deferred (fold list item 3): StatusAlerts, the four Alert tones — Plan 3a T7.
export const StatusSwatches: Story = { render: () => <Swatches selection={{ names: STATUS }} /> };

export const Contrast: Story = {
  render: () => <ContrastMatrix />,
  play: async ({ canvas }) => {
    const results = contrastResults();
    await expect(results.filter((result) => result.verdict === "fail")).toEqual([]);

    const onBrand = results.find(
      (result) =>
        result.foreground === "color-text-on-brand" && result.background === "color-surface-brand"
    );
    if (onBrand === undefined)
      throw new Error("the policy no longer declares white on the brand pink");
    await expect(onBrand.verdict).toBe("exception");
    await expect(onBrand.ratio).toBeCloseTo(4.04, 2); // spec §5.2, measured

    const exceptionRows = canvas
      .getAllByRole("row")
      .filter((row) => row.getAttribute("data-verdict") === "exception");
    await expect(exceptionRows).toHaveLength(
      results.filter((result) => result.verdict === "exception").length
    );
    const row = exceptionRows.find(
      (candidate) =>
        within(candidate).queryByText("color-text-on-brand") !== null &&
        within(candidate).queryByText("color-surface-brand") !== null
    );
    if (row === undefined)
      throw new Error("white on the brand pink is not rendered as an exception");
    await expect(within(row).getByText(VERDICT_LABEL.exception)).toBeVisible();
    await expect(within(row).getByText(`${onBrand.ratio.toFixed(2)}:1`)).toBeVisible();
    await expect(within(row).queryByText(VERDICT_LABEL.pass)).toBeNull();
  },
};
