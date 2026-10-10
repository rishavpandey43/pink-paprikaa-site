import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Target sidebar from the Claude Design tree (plan Task 11b). Extras (no design card) are marked
 * with `extra: true` and must sit after the design pages in their group (R144).
 */
export const DESIGN_TREE: readonly {
  group: string;
  pages: readonly { name: string; extra?: true }[];
}[] = [
  {
    group: "Readme",
    pages: [
      { name: "Readme" },
      { name: "Docs kit", extra: true },
      { name: "Docs prose", extra: true },
      { name: "Canvas geometry", extra: true },
      { name: "System (sx)", extra: true },
    ],
  },
  {
    group: "Templates",
    pages: [
      { name: "Marketing website" },
      { name: "Ordering app screen" },
      { name: "Social post" },
    ],
  },
  { group: "App", pages: [{ name: "Ordering app" }] },
  {
    group: "Atoms",
    pages: [
      { name: "Avatar" },
      { name: "Badge" },
      { name: "Button" },
      { name: "Card" },
      { name: "Checkbox" },
      { name: "DietMark" },
      { name: "Divider" },
      { name: "Icon" },
      { name: "IconButton" },
      { name: "ImageSlot" },
      { name: "Input" },
      { name: "Link" },
      { name: "Menu" },
      { name: "PatternField" },
      { name: "Popover" },
      { name: "PriceTag" },
      { name: "ProgressBar" },
      { name: "Radio" },
      { name: "Rating" },
      { name: "Select" },
      { name: "Skeleton" },
      { name: "SocialHeadline" },
      { name: "SpiceLevel" },
      { name: "Spinner" },
      { name: "StatusDot" },
      { name: "Switch" },
      { name: "Tag" },
      { name: "Typography" },
      { name: "TextButton" },
      { name: "Tooltip" },
      { name: "Countdown", extra: true },
      { name: "Fab", extra: true },
      { name: "Slider", extra: true },
      { name: "ToggleButton", extra: true },
    ],
  },
  {
    group: "Brand",
    pages: [
      { name: "Logo" },
      { name: "Company details" },
      { name: "Logo lockup" },
      { name: "Pattern" },
      { name: "Symbol" },
      { name: "Wordmark" },
      { name: "Iconography", extra: true },
      { name: "Voice & content", extra: true },
    ],
  },
  {
    group: "Colors",
    pages: [
      { name: "Spice accents" },
      { name: "Spice heat scale" },
      { name: "Warm ink neutrals" },
      { name: "Brand pink" },
      { name: "Semantic surfaces & text" },
      { name: "Status colors" },
      { name: "Text on surfaces" },
      { name: "Contrast", extra: true },
    ],
  },
  {
    group: "Explore",
    pages: [{ name: "Diamond + symbol" }, { name: "Mark legibility" }],
  },
  {
    group: "Layout",
    pages: [
      { name: "Auto grid" },
      { name: "Breakpoints" },
      { name: "Card anatomy" },
      { name: "Form states" },
      { name: "Utility classes", extra: true },
    ],
  },
  {
    group: "Layouts",
    pages: [
      { name: "AppShell" },
      { name: "AutoGrid" },
      { name: "Cluster" },
      { name: "Container" },
      { name: "PostFrame" },
      { name: "Section" },
      { name: "Stack" },
      { name: "Box", extra: true },
      { name: "Grid", extra: true },
    ],
  },
  {
    group: "Marketing",
    pages: [{ name: "Canvas formats" }, { name: "Canvas type" }, { name: "Social & ads" }],
  },
  {
    group: "Molecules",
    pages: [
      { name: "Accordion" },
      { name: "ActionMenu" },
      { name: "Alert" },
      { name: "Breadcrumb" },
      { name: "Combobox" },
      { name: "CouponTicket" },
      { name: "DatePicker" },
      { name: "EmptyState" },
      { name: "Field" },
      { name: "FilterBar" },
      { name: "ListRow" },
      { name: "LogoLockup" },
      { name: "LoyaltyCard" },
      { name: "MenuItemCard" },
      { name: "MenuItemRow" },
      { name: "OfferSeal" },
      { name: "OtpInput" },
      { name: "OutletCard" },
      { name: "Pagination" },
      { name: "PriceSummary" },
      { name: "QuantityStepper" },
      { name: "ReviewCard" },
      { name: "SearchField" },
      { name: "SectionHeader" },
      { name: "SlotPicker" },
      { name: "Snackbar" },
      { name: "Stat" },
      { name: "StepTracker" },
      { name: "Tabs" },
      { name: "Toast" },
      { name: "AnnouncementBar", extra: true },
      { name: "CheckCard", extra: true },
      { name: "ChipGroup", extra: true },
      { name: "ChoiceCardGroup", extra: true },
      { name: "FeatureItem", extra: true },
      { name: "KeyValueList", extra: true },
      { name: "LinkCard", extra: true },
      { name: "PricingCard", extra: true },
      { name: "SpeedDial", extra: true },
      { name: "Steps", extra: true },
      { name: "StickyActionBar", extra: true },
      { name: "Table", extra: true },
      { name: "ToggleButtonGroup", extra: true },
      { name: "Field/React Hook Form + Zod", extra: true },
    ],
  },
  {
    group: "Motion",
    pages: [
      { name: "Duration & easing" },
      { name: "Interaction states" },
      { name: "Section reveal", extra: true },
    ],
  },
  {
    group: "Organisms",
    pages: [
      { name: "CartPanel" },
      { name: "CtaBand" },
      { name: "Dialog" },
      { name: "FaqSection" },
      { name: "HeroBanner" },
      { name: "MenuList" },
      { name: "OrderTracker" },
      { name: "SiteFooter" },
      { name: "SiteHeader" },
      { name: "StatBand" },
      { name: "TabBar" },
      { name: "TestimonialWall" },
      { name: "ActionDock", extra: true },
      { name: "QuotePanel", extra: true },
      { name: "ReviewCarousel", extra: true },
    ],
  },
  {
    group: "Spacing",
    pages: [
      { name: "Borders & focus" },
      { name: "Shadows" },
      { name: "Corner radii" },
      { name: "Layout rhythm" },
      { name: "Spacing scale" },
    ],
  },
  {
    group: "Type",
    pages: [
      { name: "Fluid type" },
      { name: "Body" },
      { name: "Devanagari" },
      { name: "Display" },
      { name: "Headings" },
      { name: "Overline & mono" },
    ],
  },
  { group: "Website", pages: [{ name: "Homepage" }] },
];

interface IndexEntry {
  id: string;
  title?: string;
  name?: string;
  type: string;
  tags?: string[];
}

/** Visible sidebar pages: docs + story components, excluding `!dev` specimens. */
export function sidebarFromIndex(indexPath: string): { group: string; pages: string[] }[] {
  const { entries } = JSON.parse(readFileSync(indexPath, "utf8")) as {
    entries: Record<string, IndexEntry>;
  };
  const byGroup = new Map<string, string[]>();
  for (const entry of Object.values(entries)) {
    if (entry.type !== "docs" && entry.type !== "story") continue;
    // Storybook's `tags: ["!dev"]` removes the default `dev` tag — those stay out of the sidebar.
    if (!(entry.tags ?? []).includes("dev")) continue;
    const title = entry.title;
    if (title === undefined || title === "") continue;
    const slash = title.indexOf("/");
    const group = slash === -1 ? title : title.slice(0, slash);
    // Keep the full remainder (e.g. Molecules/Field/React Hook Form + Zod). Autodocs leaves share
    // the same two-segment title as their component; only two titles in the index are deeper.
    const page = slash === -1 ? title : title.slice(slash + 1);
    if (
      page === "Specimens" ||
      page.endsWith(" specimens") ||
      page.startsWith("Kit/") ||
      group === "Foundations"
    ) {
      continue;
    }
    const list = byGroup.get(group) ?? [];
    if (!list.includes(page)) list.push(page);
    byGroup.set(group, list);
  }
  // Order groups by DESIGN_TREE; unknown groups trail alphabetically.
  const order = new Map(DESIGN_TREE.map((g, i) => [g.group, i]));
  return [...byGroup.entries()]
    .sort(([a], [b]) => (order.get(a) ?? 999) - (order.get(b) ?? 999) || a.localeCompare(b))
    .map(([group, pages]) => {
      const design = DESIGN_TREE.find((g) => g.group === group);
      if (design === undefined) return { group, pages: pages.sort() };
      const rank = new Map(design.pages.map((p, i) => [p.name, i]));
      return {
        group,
        pages: [...pages].sort(
          (a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999) || a.localeCompare(b)
        ),
      };
    });
}

describe("Storybook sidebar vs Claude Design tree", () => {
  const indexPath = join(import.meta.dirname, "../../storybook-static/index.json");

  it("lists every design group and page name, in order", () => {
    const actual = sidebarFromIndex(indexPath);
    const expectedGroups = DESIGN_TREE.map((g) => g.group);
    const actualGroups = actual.map((g) => g.group);
    expect(actualGroups, "group order").toEqual(expectedGroups);

    for (const expected of DESIGN_TREE) {
      const got = actual.find((g) => g.group === expected.group);
      expect(got, `missing group ${expected.group}`).toBeDefined();
      expect(got?.pages, `${expected.group} pages`).toEqual(expected.pages.map((p) => p.name));
    }
  });
});
