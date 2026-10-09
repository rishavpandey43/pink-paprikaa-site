import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AutoGrid, Badge, Card, ImageSlot } from "@pink-paprikaa-web/ui";

import { formatValue, token, tokensWithPrefix, utilitiesOf } from "../../docs-kit/catalogue";
import { spyOnClipboard } from "../../docs-kit/clipboard";
import { RadiusScale } from "../../docs-kit/radius-scale";
import { ShadowLadder } from "../../docs-kit/shadow-ladder";
import { SpecimenRow } from "../../docs-kit/specimen";
import { TokenTable } from "../../docs-kit/token-table";

/** Live visuals for the Layout pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Layout/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Column counts per breakpoint — a design-system rule (readme §3.10), not a token. */
const COLUMNS: Readonly<Record<string, string>> = {
  "breakpoint-sm": "1 col",
  "breakpoint-md": "2 col",
  "breakpoint-lg": "3 col",
  "breakpoint-xl": "4 col",
  "breakpoint-2xl": "4 col · capped by the content container",
};
const BAR_FILL = ["bg-pink-300", "bg-pink-400", "bg-pink-500", "bg-pink-600", "bg-pink-700"];

/** The primitive shadows — the ladder and its two specials — read from the catalogue, never retyped. */
const DEPTH_LADDER = tokensWithPrefix("shadow-", "primitive").map((entry) => entry.name);

/** R56: a chip copies exactly its class, and says so in the scope's status line. */
async function expectChipCopies(
  canvas: { getByRole: (role: "button", options: { name: string }) => HTMLElement },
  click: (element: HTMLElement) => Promise<void>,
  utility: string
) {
  await spyOnClipboard(async (write) => {
    await click(canvas.getByRole("button", { name: utility }));
    await expect(write).toHaveBeenLastCalledWith(utility);
  });
}

function Cell({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-pink-200 bg-pink-50 p-3.5">
      <div className="h-8.5 rounded-md bg-pink-100" />
      <span className="mt-2.5 block font-mono text-mono text-text-muted">{label}</span>
    </div>
  );
}

export const Breakpoints: Story = {
  render: () => (
    <ol role="list" aria-label="Breakpoints" className="flex items-end gap-2.5">
      {tokensWithPrefix("breakpoint-").map((entry, index) => (
        <li
          key={entry.name}
          className="flex min-w-0 flex-col gap-1"
          style={{ width: `calc(var(${token("spacing").cssVar}) * ${String(12 + index * 6)})` }}
        >
          <span
            aria-hidden
            className={`rounded-t-sm ${BAR_FILL[index] ?? "bg-pink-700"}`}
            style={{ height: `calc(var(${token("spacing").cssVar}) * ${String(11 + index * 4)})` }}
          />
          <span className="font-mono text-mono text-text-heading">{entry.cssVar}</span>
          <span className="font-mono text-mono text-text-muted">{formatValue(entry.value)}</span>
          <span className="font-mono text-mono text-text-brand">{COLUMNS[entry.name] ?? ""}</span>
        </li>
      ))}
    </ol>
  ),
};

export const AutoGridCards: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label='AutoGrid — min="md" (the default)'>
        <AutoGrid className="w-full">
          {["card 1", "card 2", "card 3", "card 4"].map((label) => (
            <Cell key={label} label={label} />
          ))}
        </AutoGrid>
      </SpecimenRow>
      <SpecimenRow label='AutoGrid — min="xs"'>
        <AutoGrid min="xs" className="w-full">
          {["card 1", "card 2", "card 3", "card 4", "card 5", "card 6"].map((label) => (
            <Cell key={label} label={label} />
          ))}
        </AutoGrid>
      </SpecimenRow>
    </div>
  ),
};

export const AutoGridTokens: Story = {
  render: () => (
    <TokenTable
      caption="Grid tokens"
      selection={{ names: ["spacing-card-min", "spacing-card-min-wide", "spacing-grid-gap"] }}
    />
  ),
};

export const Radii: Story = { render: () => <RadiusScale /> };

export const Borders: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3.5">
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-subtle font-mono text-mono text-text-muted"
        style={{ borderWidth: `var(${token("border-width-default").cssVar})` }}
      >
        border-subtle
      </span>
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-default font-mono text-mono text-text-muted"
        style={{ borderWidth: `var(${token("border-width-default").cssVar})` }}
      >
        border-default
      </span>
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-brand font-mono text-mono text-text-muted shadow-focus-ring"
        style={{ borderWidth: `var(${token("border-width-strong").cssVar})` }}
      >
        focus · strong + ring
      </span>
      <span
        className="flex h-12 w-38 items-center justify-center rounded-md border-solid border-border-strong font-mono text-mono text-text-muted"
        style={{ borderWidth: `var(${token("border-width-strong").cssVar})` }}
      >
        border-strong
      </span>
    </div>
  ),
};

export const BorderTokens: Story = {
  render: () => (
    <TokenTable
      caption="Border widths, colours and focus"
      selection={{
        names: [
          "border-width-default",
          "border-width-strong",
          "color-border-subtle",
          "color-border-default",
          "color-border-strong",
          "color-border-brand",
          "color-focus",
          "shadow-focus-ring",
        ],
      }}
    />
  ),
};

export const BorderWidths: Story = {
  render: () => <TokenTable caption="Border widths" selection={{ prefix: "border-width-" }} />,
  // R56: the strong width's numeric chip copies `border-2`.
  play: async ({ canvas, userEvent }) => {
    const numeric = utilitiesOf("border-width-strong").at(-1);
    if (numeric === undefined) throw new Error("border-width-strong has no utility");
    await expect(numeric).toBe("border-2");
    await expectChipCopies(canvas, (element) => userEvent.click(element), numeric);
  },
};

export const DepthLadder: Story = { render: () => <ShadowLadder names={DEPTH_LADDER} /> };

export const Stacking: Story = {
  render: () => <TokenTable caption="Stacking order" selection={{ prefix: "z-" }} />,
};

export const CardAnatomy: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">default</span>
        <span className="font-mono text-mono text-text-muted">
          surface-card · radius-lg · border-subtle · shadow-1
        </span>
      </Card>
      <Card variant="feature" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">feature</span>
        <span className="font-mono text-mono text-text-muted">
          brand-soft · radius-xl · no border · no shadow
        </span>
      </Card>
      <Card variant="quiet" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">quiet</span>
        <span className="font-mono text-mono text-text-muted">
          sunken · radius-lg · no border · no shadow
        </span>
      </Card>
      <Card isInteractive className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">isInteractive</span>
        <span className="font-mono text-mono text-text-muted">hover: lift-y → shadow-3</span>
      </Card>
      <Card surface="brand" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">brand</span>
        <span className="font-mono text-mono text-text-muted">
          surface-brand · sets data-surface
        </span>
      </Card>
      <Card surface="ink" className="flex flex-col gap-2">
        <span className="font-display text-h4 text-text-heading">ink</span>
        <span className="font-mono text-mono text-text-muted">
          surface-inverse · sets data-surface
        </span>
      </Card>
    </div>
  ),
};

export const UtilityClasses: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label="container-page">
        <div className="container-page rounded-md border border-dashed border-border-brand py-3">
          <span className="font-mono text-mono text-text-muted">content width, fluid gutter</span>
        </div>
      </SpecimenRow>
      <SpecimenRow label="section-y">
        <div className="w-full rounded-md bg-surface-page-alt px-4 section-y">
          <span className="font-mono text-mono text-text-muted">fluid section rhythm</span>
        </div>
      </SpecimenRow>
      <SpecimenRow label="autogrid · autogrid-wide">
        <div className="autogrid w-full">
          <Cell label="autogrid" />
          <Cell label="autogrid" />
          <Cell label="autogrid" />
        </div>
        <div className="autogrid-wide w-full">
          <Cell label="autogrid-wide" />
          <Cell label="autogrid-wide" />
        </div>
      </SpecimenRow>
      <SpecimenRow label="cluster">
        <div className="cluster">
          <Badge>Bestseller</Badge>
          <Badge color="success">Pure veg</Badge>
          <Badge color="warning">Extra Hot</Badge>
        </div>
      </SpecimenRow>
      <SpecimenRow label="line-clamp-2 · text-h1-fluid">
        <span className="line-clamp-2 max-w-60 text-body-sm text-text-body">
          Amritsari paneer, burnt chilli mayo, potato brioche, masala fries on the side, and a
          pickle that argues back.
        </span>
        <span className="font-display text-h1-fluid text-text-heading">Most ordered this week</span>
      </SpecimenRow>
      <SpecimenRow label="scrim-bottom — the only gradient, over photography">
        <div className="relative w-60 overflow-hidden rounded-lg">
          <ImageSlot ratio="4:3" radius="none" label="Dish photo 4:3" />
          <div className="absolute inset-0 scrim-bottom" />
        </div>
      </SpecimenRow>
    </div>
  ),
};
