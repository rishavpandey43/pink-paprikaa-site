import type { Meta, StoryObj } from "@storybook/react-vite";

import { MapPin, MessageCircle, Search, ShoppingBag, Store } from "lucide-react";
import { expect, within } from "storybook/test";

import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import {
  DietMark,
  Icon,
  InstagramGlyph,
  LinkedinGlyph,
  Logo,
  PatternField,
  Rating,
  SpiceLevel,
  Spinner,
  StatusDot,
  Text,
  YoutubeGlyph,
} from "@pink-paprikaa-web/ui";

import { formatValue, token, utilitiesOf } from "../../docs-kit/catalogue";
import { spyOnClipboard } from "../../docs-kit/clipboard";
import { SpecimenRow, SpecimenTile } from "../../docs-kit/specimen";
import { TokenTable } from "../../docs-kit/token-table";
import { BUILD_YEAR } from "../../kits/fixtures";
import { CompanyDetails, OWNER_TO_SUPPLY, pendingFacts } from "./company-details";

/** Live visuals for the Brand pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Brand/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ICON_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const LEVELS = [1, 2, 3, 4] as const;

export const Lockup: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <SpecimenTile
        caption='variant="lockup" tone="pink"'
        className="h-30 items-center justify-center border border-border-subtle bg-surface-page p-6"
      >
        <Logo className="w-44" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="white" · on ink'
        surface="ink"
        className="h-30 items-center justify-center bg-surface-inverse p-6"
      >
        <Logo tone="white" className="w-44" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="badge"'
        className="h-30 items-center justify-center bg-surface-sunken p-3"
      >
        <Logo tone="badge" className="w-24" />
      </SpecimenTile>
    </div>
  ),
};

export const Wordmark: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <SpecimenTile
        caption='variant="wordmark" tone="pink"'
        className="h-30 items-center justify-center border border-border-subtle bg-surface-page p-6"
      >
        <Logo variant="wordmark" className="w-44" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="white" · on ink'
        surface="ink"
        className="h-30 items-center justify-center bg-surface-inverse p-6"
      >
        <Logo variant="wordmark" tone="white" className="w-44" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="badge"'
        className="h-30 items-center justify-center bg-surface-sunken p-3"
      >
        <Logo variant="wordmark" tone="badge" className="w-24" />
      </SpecimenTile>
    </div>
  ),
};

export const LogoTokens: Story = {
  render: () => (
    <TokenTable
      caption="Logo widths"
      selection={{ names: ["spacing-logo-lockup", "spacing-logo-wordmark", "spacing-logo-symbol"] }}
    />
  ),
};

export const SymbolMark: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <SpecimenTile
        caption='tone="pink"'
        className="size-30 items-center justify-center bg-surface-page-alt"
      >
        <Logo variant="symbol" className="w-16" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="white"'
        surface="brand"
        className="size-30 items-center justify-center bg-surface-brand"
      >
        <Logo variant="symbol" tone="white" className="w-16" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="white" · on ink'
        surface="ink"
        className="size-30 items-center justify-center bg-surface-inverse"
      >
        <Logo variant="symbol" tone="white" className="w-16" />
      </SpecimenTile>
      <SpecimenTile
        caption='tone="badge" · app icon'
        className="size-30 items-center justify-center"
      >
        <span className="block overflow-hidden rounded-xl shadow-brand">
          <Logo variant="symbol" tone="badge" className="block w-30" />
        </span>
      </SpecimenTile>
    </div>
  ),
};

export const MarkLegibility: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label='StatusDot — size="sm" · "md"'>
        {(["sm", "md"] as const).map((size) => (
          <StatusDot key={size} tone="live" size={size} label={`Live · ${size}`} />
        ))}
      </SpecimenRow>
      <SpecimenRow label='SpiceLevel — size="sm" · "md" · "lg"'>
        {SIZES.map((size) => (
          <SpiceLevel key={size} level={2} size={size} />
        ))}
      </SpecimenRow>
      <SpecimenRow label='Rating — size="sm" · "md" · "lg"'>
        {SIZES.map((size) => (
          <Rating key={size} value={4} size={size} hasValue={false} />
        ))}
      </SpecimenRow>
      <SpecimenRow label='Spinner — size="sm" · "md" · "lg"'>
        {SIZES.map((size) => (
          <Spinner key={size} size={size} label={`Loading · ${size}`} />
        ))}
      </SpecimenRow>
    </div>
  ),
};

export const PatternFields: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <PatternField tone="brand" radius="lg" className="flex flex-col gap-1.5 px-7 py-6">
        <Text variant="overline" tone="muted" as="span">
          Loyalty
        </Text>
        <Text variant="h3" weight="black" as="span">
          3 more visits and chai&apos;s on us.
        </Text>
      </PatternField>
      <div className="grid gap-4 md:grid-cols-4">
        <PatternField tone="ink" radius="lg" className="h-24 p-4">
          <span className="font-mono text-mono">tone=&quot;ink&quot;</span>
        </PatternField>
        <PatternField tone="ink" density="faint" radius="lg" className="h-24 p-4">
          <span className="font-mono text-mono">density=&quot;faint&quot;</span>
        </PatternField>
        <PatternField tone="soft" radius="lg" className="h-24 p-4">
          <span className="font-mono text-mono">tone=&quot;soft&quot;</span>
        </PatternField>
        <PatternField tone="light" radius="lg" className="h-24 p-4">
          <span className="font-mono text-mono">tone=&quot;light&quot;</span>
        </PatternField>
      </div>
    </div>
  ),
};

export const PatternTokens: Story = {
  render: () => (
    <TokenTable caption="Pattern opacity and tiles" selection={{ prefix: "pattern-" }} />
  ),
  // R56: a class chip copies the utility the token produces.
  play: async ({ canvas, userEvent }) => {
    const [utility] = utilitiesOf("pattern-opacity-faint");
    if (utility === undefined) throw new Error("pattern-opacity-faint has no utility class");
    await spyOnClipboard(async (write) => {
      await userEvent.click(canvas.getByRole("button", { name: utility }));
      await expect(write).toHaveBeenLastCalledWith(utility);
      await expect(
        canvas.getAllByRole("status").some((status) => status.textContent === `Copied ${utility}`)
      ).toBe(true);
    });
  },
};

export const DiamondMotif: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <SpecimenRow label="Heat scale — SpiceLevel">
        {LEVELS.map((level) => (
          <SpiceLevel key={level} level={level} />
        ))}
      </SpecimenRow>
      {/* Deferred (fold list item 3): the StepTracker row — Plan 3a T19. */}
      <SpecimenRow label="Score — Rating">
        <Rating value={4.5} />
      </SpecimenRow>
      <SpecimenRow label="Dot — StatusDot">
        <StatusDot tone="open" label="Open now" />
        <StatusDot tone="busy" label="Kitchen is busy" />
        <StatusDot tone="closed" label="Closed" />
        <StatusDot tone="live" label="Live" isPulsing />
      </SpecimenRow>
      <SpecimenRow label="Loader — Spinner">
        <Spinner size="lg" />
      </SpecimenRow>
    </div>
  ),
};

export const CompanyFacts: Story = {
  render: () => <CompanyDetails />,
  play: async ({ canvas }) => {
    const pending = pendingFacts(brand);
    await expect(pending.length).toBeGreaterThan(0);
    // Every null fact is shown where it belongs, and nowhere does a placeholder read TODO.
    await expect(canvas.getAllByText(OWNER_TO_SUPPLY)).toHaveLength(pending.length);
    await expect(canvas.queryByText(/TODO/)).toBeNull();
    // …and listed by path, with the count computed from the data.
    const list = canvas.getByRole("list", {
      name: `${String(pending.length)} facts pending from the owner`,
    });
    for (const path of pending) {
      await expect(within(list).getByText(path)).toBeVisible();
    }
    await expect(canvas.getByText(toBrandLines(brand, BUILD_YEAR).copyright)).toBeVisible();
  },
};

export const IconSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label="Icon — size · token value">
        {ICON_SIZES.map((size) => (
          <span key={size} className="flex flex-col items-center gap-2 text-text-heading">
            <Icon icon={MessageCircle} size={size} />
            <span className="font-mono text-mono text-text-muted">
              {size} · {formatValue(token(`spacing-icon-${size}`).value)}
            </span>
          </span>
        ))}
      </SpecimenRow>
      <SpecimenRow label='Lucide glyphs — size="lg"'>
        <Icon icon={MessageCircle} size="lg" label="Message" />
        <Icon icon={ShoppingBag} size="lg" label="Order" />
        <Icon icon={MapPin} size="lg" label="Location" />
        <Icon icon={Search} size="lg" label="Search" />
        <Icon icon={Store} size="lg" label="Outlet" />
      </SpecimenRow>
    </div>
  ),
};

export const BrandGlyphs: Story = {
  render: () => (
    <SpecimenRow label="InstagramGlyph · YoutubeGlyph · LinkedinGlyph — the same grid and stroke">
      <Icon icon={InstagramGlyph} size="lg" label="Instagram" />
      <Icon icon={YoutubeGlyph} size="lg" label="YouTube" />
      <Icon icon={LinkedinGlyph} size="lg" label="LinkedIn" />
    </SpecimenRow>
  ),
};

export const DietAndHeat: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SpecimenRow label='DietMark — the only diet mark; size="sm" · "md" · "lg"'>
        {SIZES.map((size) => (
          <DietMark key={size} size={size} />
        ))}
      </SpecimenRow>
      <SpecimenRow label="SpiceLevel — hasLabel, level 1–4">
        {LEVELS.map((level) => (
          <SpiceLevel key={level} level={level} hasLabel />
        ))}
      </SpecimenRow>
    </div>
  ),
};
