### Task 3: Introduction and the Brand group

Sources: `guidelines/{brand-logo,brand-wordmark,brand-symbol,mark-legibility,brand-pattern,diamond-motif,brand-company}.card.html`, design-system `readme.md` §2 and §4, spec §4 C3/C10/C16 and §7.3.

**Files:**

- Replace: `apps/storybook/src/docs/introduction.mdx`
- Create: `apps/storybook/src/foundations/brand/{company-details.tsx,brand.stories.tsx,logo.mdx,pattern.mdx,company-details.mdx,voice-and-content.mdx,iconography.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/{introduction,voice-and-accessibility}.mdx`

**Dev parity:**

| Dev item                                                                                                                        | Ruling        | Where / spec clause                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intro hero: flooded pink panel, overline, display title, tagline, "pink is the whole identity"                                  | ADD / DROP    | ADD the line as prose (Step 4). DROP the hand-classed panel: D4 names (`rounded-5`, `text-subtitle2`), §11.2 R23 (`max-w-(--…)`); the flooded-pink move is live on Brand → Pattern and Colors → Surfaces |
| "What this is": pure-veg café, Sector 57 / MKM Market                                                                           | ALREADY       | Brand → Company details binds the outlet from `@pink-paprikaa-web/content` (D12 — a page never retypes a fact)                                                                                           |
| Personality: loud, warm, young, city-street; one pink, warm neutrals, one accent; restraint                                     | ADD           | Step 4 intro                                                                                                                                                                                             |
| "How it fits together" layer table + imports only go downward (lint-enforced)                                                   | ADD           | Step 4 intro, with D14 (`layouts`, atoms import only Icon)                                                                                                                                               |
| "Using it": barrel import + the two-line CSS contract                                                                           | ALREADY       | Step 4 "Consume it"                                                                                                                                                                                      |
| What `styles.css` pulls in (theme, keyframes, base layer, focus ring, reduced motion)                                           | ADD           | Step 4 "Consume it"                                                                                                                                                                                      |
| "Stock Tailwind classes do not exist here" (`rounded-lg`, `text-sm`, `bg-red-500`, `shadow-md`, `font-sans`)                    | ADD           | Step 4, re-stated for D4 names (`rounded-lg` is real and 16px; the rest compile to nothing)                                                                                                              |
| "Before you add a component": tokens first, canonical shape, the trio, the gate                                                 | ADD           | Step 4 "For authors", pointing at AUTHORING.md §5, §3, §2 and spec §11.1                                                                                                                                 |
| Voice: tone, you/we, the seven Write/Don't rows, casing, numbers, plain labels, no emoji, one "!", never-say, veg once          | ALREADY       | Step 5 `voice-and-content.mdx`                                                                                                                                                                           |
| Hard rule: **Pink Paprikaa** — two `a`s; a misspelling is a content bug                                                         | ADD           | Step 5 `voice-and-content.mdx` Rules                                                                                                                                                                     |
| Accessibility: axe in every test and again in every story; `a11y.test = "error"`                                                | ADD           | Step 4 intro "Accessibility"                                                                                                                                                                             |
| Guarantees: brand focus ring, 44px targets, disabled = real grey fill, behaviour from Radix, global reduced motion              | ADD           | Step 4 intro "Accessibility" — Radix line restated for D7 (native first, Radix for five); 36/38px exception per §5.5                                                                                     |
| Each use owns: a name (icon-only label, decorative `aria-hidden`), never colour alone (SpiceLevel/DietMark text), heading order | ADD           | Step 4 intro — heading order via `headingLevel` (§5.5), not only `Text as`                                                                                                                               |
| "`text-muted` only on light grounds; on pink/ink use `text-on-brand`/`text-on-inverse`"                                         | ADD (adapted) | Step 4 intro: D5 — put the content on a `data-surface` field and the tokens remap; Colors → Contrast lists the pairs                                                                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: docs-kit (Task 2); `brand`, `toBrandLines` (content); `Logo`, `LogoLockup`, `PatternField`, `Text`, `SpiceLevel`, `StepTracker`, `Rating`, `StatusDot`, `Spinner`, `Icon`, brand glyphs, `DietMark`, `Card`, `Badge`, `KeyValueList` (ui).
- Produces: `CompanyDetails`, `pendingFacts(value)`, `OWNER_TO_SUPPLY`; specimens `Brand/Specimens` → `Lockup`, `Wordmark`, `ClearSpace`, `LogoTokens`, `SymbolMark`, `MarkLegibility`, `PatternFields`, `PatternTokens`, `DiamondMotif`, `CompanyFacts`, `IconSizes`, `BrandGlyphs`, `DietAndHeat`; pages `Introduction`, `Brand/Logo`, `Brand/Pattern`, `Brand/Company details`, `Brand/Voice & content`, `Brand/Iconography`.

- [ ] **Step 1: Write the failing Company details test (Review Focus 2)**

Create `apps/storybook/src/foundations/brand/brand.stories.tsx` with the meta and **only** this story first:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import { expect, within } from "storybook/test";

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
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- brand.stories 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./company-details"`.

- [ ] **Step 2: Implement `CompanyDetails`**

Create `apps/storybook/src/foundations/brand/company-details.tsx`:

```tsx
import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import { Badge, Card, type KeyValueItem, KeyValueList, Text } from "@pink-paprikaa-web/ui";
import { type ReactNode, useId } from "react";

import { BUILD_YEAR } from "../../kits/fixtures";

export const OWNER_TO_SUPPLY = "Owner to supply";

/** Every fact the owner has not supplied yet, by path (`billing.upi`, `outlets[0].hours`). */
export function pendingFacts(value: unknown, path = ""): string[] {
  if (value === null) return [path];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => pendingFacts(item, `${path}[${String(index)}]`));
  }
  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      pendingFacts(child, path === "" ? key : `${path}.${key}`)
    );
  }
  return [];
}

function fact(value: string | number | null): ReactNode {
  return value === null ? <Badge tone="danger">{OWNER_TO_SUPPLY}</Badge> : value;
}

function percent(rate: number): string {
  return `${String(Math.round(rate * 1000) / 10)}%`;
}

interface FactBox {
  heading: string;
  items: KeyValueItem[];
}

/** The brand facts as the design system's Company details card shows them, bound to the real data. */
export function CompanyDetails() {
  const pendingId = useId();
  const lines = toBrandLines(brand, BUILD_YEAR);
  const { billing, contact, legal } = brand;
  const pending = pendingFacts(brand);
  const boxes: FactBox[] = [
    {
      heading: "Identity",
      items: [
        { key: "name", value: `${brand.name} · ${brand.nameDevanagari}` },
        { key: "tagline", value: brand.tagline },
        { key: "statement", value: brand.statement },
        { key: "veg", value: brand.vegStatement },
        { key: "established", value: brand.established },
      ],
    },
    {
      heading: "Legal",
      items: [
        { key: "entity", value: legal.entity },
        { key: "cin", value: legal.cin },
        { key: "gstin", value: legal.gstin },
        { key: "fssai", value: legal.fssai },
        { key: "pan", value: legal.pan },
        { key: "registered", value: legal.registeredAddress },
      ],
    },
    {
      heading: "Contact",
      items: [
        { key: "web", value: contact.website },
        { key: "phone", value: contact.phoneDisplay },
        { key: "whatsapp", value: contact.whatsapp },
        { key: "email", value: contact.email },
        { key: "orders", value: contact.ordersEmail },
        { key: "franchise", value: contact.franchiseEmail },
        { key: "careers", value: contact.careersEmail },
      ],
    },
    {
      heading: "Billing",
      items: [
        {
          key: "gst",
          value: `${percent(billing.gstRate)} (CGST ${percent(billing.gstSplit.cgst)} + SGST ${percent(billing.gstSplit.sgst)})`,
        },
        { key: "tax note", value: billing.taxNote },
        { key: "invoice", value: `${billing.invoicePrefix}-0000` },
        { key: "account", value: billing.accountName },
        { key: "bank", value: fact(billing.bankName) },
        { key: "account no.", value: fact(billing.accountNumber) },
        { key: "ifsc", value: fact(billing.ifsc) },
        { key: "upi", value: fact(billing.upi) },
      ],
    },
    {
      heading: "Social",
      items: brand.social.map((profile) => ({ key: profile.network, value: profile.handle })),
    },
    {
      heading: `Outlets · ${lines.cities}`,
      items: brand.outlets.flatMap((outlet) => [
        { key: outlet.city, value: `${outlet.name} — ${outlet.address}` },
        { key: "hours", value: fact(outlet.hours) },
        { key: "maps", value: fact(outlet.mapsUrl) },
      ]),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {boxes.map((box) => (
          <Card key={box.heading} padding="sm" className="flex min-w-0 flex-col gap-3">
            <Text variant="overline" tone="brand" as="h2">
              {box.heading}
            </Text>
            <KeyValueList items={box.items} density="compact" keyWidth="sm" />
          </Card>
        ))}
      </div>
      <Card variant="quiet" padding="sm" className="flex flex-col gap-3">
        <Text variant="overline" tone="brand" as="h2">
          Derived lines — toBrandLines(brand, year)
        </Text>
        <KeyValueList
          density="compact"
          keyWidth="md"
          items={[
            { key: "copyright", value: lines.copyright },
            { key: "fssai", value: lines.fssai },
            { key: "gstin", value: lines.gstin },
            { key: "cin", value: lines.cin },
            { key: "contactShort", value: lines.contactShort },
            { key: "footerPolicies", value: lines.footerPolicies.join(" · ") },
          ]}
        />
      </Card>
      <div className="flex flex-col gap-2">
        <Text variant="h4" as="h2" id={pendingId}>
          {pending.length} facts pending from the owner
        </Text>
        <ul aria-labelledby={pendingId} className="flex flex-col gap-1">
          {pending.map((path) => (
            <li key={path} className="font-mono text-mono text-text-muted">
              {path}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

Run the Step 1 command → PASS.

Probe: delete the `{ key: "ifsc", … }` row; rerun; expect FAIL (`expected … to have length 6` — the count comes from the data, the page lost a fact). Restore; rerun green. Paste both.

- [ ] **Step 3: The remaining Brand specimens**

Replace `apps/storybook/src/foundations/brand/brand.stories.tsx` with the full file (the `CompanyFacts` story unchanged):

```tsx
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
  LogoLockup,
  PatternField,
  Rating,
  SpiceLevel,
  Spinner,
  StatusDot,
  StepTracker,
  Text,
  YoutubeGlyph,
} from "@pink-paprikaa-web/ui";

import { formatValue, token } from "../../docs-kit/catalogue";
import { SpecimenRow, SpecimenTile } from "../../docs-kit/specimen";
import { TokenTable } from "../../docs-kit/token-table";
import { BUILD_YEAR, ORDER_STEPS } from "../../kits/fixtures";
import { CompanyDetails, OWNER_TO_SUPPLY, pendingFacts } from "./company-details";

/** Live visuals for the Brand pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Brand/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES = ["sm", "md", "lg"] as const;
const ICON_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
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

export const ClearSpace: Story = {
  render: () => (
    <SpecimenRow label="Dashed: the clear space LogoLockup keeps on every side — the height of the P">
      <div className="border border-dashed border-border-brand">
        <LogoLockup tone="pink" />
      </div>
      <div className="border border-dashed border-border-brand">
        <LogoLockup tone="pink" hasTagline={false} />
      </div>
    </SpecimenRow>
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
};

export const DiamondMotif: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <SpecimenRow label="Heat scale — SpiceLevel">
        {LEVELS.map((level) => (
          <SpiceLevel key={level} level={level} />
        ))}
      </SpecimenRow>
      <SpecimenRow label="Step — StepTracker">
        <StepTracker steps={ORDER_STEPS} current={1} orientation="horizontal" />
      </SpecimenRow>
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
```

- [ ] **Step 4: The Introduction page**

Replace `apps/storybook/src/docs/introduction.mdx`:

````mdx
import { Meta } from "@storybook/addon-docs/blocks";

<Meta title="Introduction" />

# Pink Paprikaa Design System

The production design system for pinkpaprikaa.com — tokens, 90 React components and three
reference kits, rebuilt from the supplied design-system folder. This Storybook is that folder's
"Design System tab": the same thirteen groups, in the same order.

The system is loud, warm, young and city-street confident. Pink is not decorative here — it is the
whole identity: one primary pink used at full strength, warm neutrals tinted toward it, and a single
accent per screen. Everything else is restraint.

| Group                                                         | What it holds                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand · Colors · Type · Spacing · Layout · Motion · Marketing | Foundations — every guideline card as a live page. Values are read from the token build, never retyped.                                           |
| Atoms · Molecules · Organisms · Layouts                       | One story file per component: every variant, size, tone and state on its design-system card, a Playground, surface stories and interaction tests. |
| Website · App · Marketing → Kit                               | Reference kits composed only from the library, with real brand facts and verified reviews — each badged "Reference kit — not production copy".    |

## How it fits together

| Layer                              | What lives there                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `@pink-paprikaa-web/design-tokens` | Every value, authored as DTCG JSON and compiled by Style Dictionary            |
| `@pink-paprikaa-web/ui` — atoms    | Indivisible primitives: `Button` `Text` `Icon` `Input` `SpiceLevel` `DietMark` |
| — molecules                        | Small compositions: `Field` `MenuItemCard` `Tabs` `Alert`                      |
| — organisms                        | Page-level regions: `SiteHeader` `HeroBanner` `MenuList` `CtaBand`             |
| — layouts                          | Spacing, width and frame only: `Container` `Section` `AutoGrid` `PostFrame`    |

A layer composes only the layers below it: a molecule may use atoms, an atom may never reach a
molecule, and an atom imports nothing but `Icon`. The rule is lint-enforced (`atomic-layering`),
not advisory.

## Consume it

An app imports Tailwind and the library's one stylesheet — nothing else. The library scans its
own sources, so the app adds no `@source` for it.

```css
@import "tailwindcss";
@import "@pink-paprikaa-web/ui/styles.css";
```

That one import brings the token theme, the `data-surface` remaps, the base layer (element
defaults, the pink focus ring, the reduced-motion contract), the system's named utilities and its
seven animations.

Components are named imports from the one barrel — `import { Button, Field, Input } from "@pink-paprikaa-web/ui";` —
and a Next.js app adds `transpilePackages: ["@pink-paprikaa-web/ui"]`. Fonts are the app's to load
(Poppins with the Devanagari subset, DM Sans, Space Mono); the font tokens pick them up by name.

## The one thing that will surprise you

**Stock Tailwind scales do not exist here.** The tokens package clears every Tailwind namespace it
replaces, so `text-sm`, `bg-red-500`, `shadow-md` and `font-sans` compile to nothing — a class
outside the system fails loudly instead of quietly rendering an off-brand value. Where a name
matches the design system's own token it is the system's value: `rounded-lg` is the card radius.
Use `text-body-sm`, `bg-status-danger`, `shadow-2`, `font-body`.

## Rules the system keeps

- **Tokens only.** Every class is a token utility (`bg-surface-brand`, `text-h2`, `rounded-lg`) —
  no arbitrary values, no literal colours. The brand pink's hex exists once, in
  `packages/design-tokens`.
- **Text colour follows the surface.** A flooded field carries `data-surface`; headings, text,
  links, borders and focus re-read the semantic tokens inside it. No component takes an `on` prop.
- **No content inside the system.** Copy, links, prices and brand facts arrive as props; stories
  bind fixtures, and Brand → Company details and the kits bind `@pink-paprikaa-web/content`.
- **Server-first, native-first.** Only components that own state or effects are client components;
  native `<select>`, `<details>` and inputs come before any library.
- **Accessibility is gated.** Every story runs axe in headless Chromium. Colour contrast is owned by
  the token contrast policy instead — **Colors → Contrast** shows the one declared exception.

## Accessibility

Every component test ends with an axe check, and every story runs axe again in headless Chromium
with `a11y.test = "error"` — a violation fails the suite; it does not sit in a panel nobody opens.

### What the system guarantees

- **Focus is a brand decision.** The base layer paints `:focus-visible` as a 2px `--color-focus`
  outline at a 2px offset, everywhere; fields add the 3px focus ring. No component restates it,
  and none can quietly drop it.
- **Touch targets are at least the hit token** (`--spacing-hit`), icon-only buttons included. Only
  the system's 36/38px controls go smaller, and never below 24px (spec §5.5).
- **Disabled is a real grey fill**, never a reduced opacity — opacity fails contrast and reads as
  "loading" rather than "unavailable".
- **Behaviour is native or Radix, never hand-rolled.** Native `<select>`, `<details>` and inputs
  come first; Dialog/Sheet, Tabs, Tooltip, Toast and ToggleGroup use Radix, so roles, keyboard
  handling and focus management come built in.
- **Reduced motion is global.** `prefers-reduced-motion: reduce` collapses animation and transition
  durations in the base layer; no component handles it alone.

### What each use owns

- **A name.** An icon-only control takes a `label` (`IconButton` requires one); a decorative icon is
  `aria-hidden`, so its meaning is not announced twice beside the text it decorates.
- **Never colour alone.** A status colour always arrives with a message and a glyph. `SpiceLevel`
  and `DietMark` carry text alternatives — heat and diet are load-bearing information.
- **Heading order.** A component's look and its document level are separate decisions: every titled
  component takes `headingLevel` (and `Text` takes `as`); the page owns its outline.
- **Contrast follows the surface.** Put content that sits on pink or ink inside a `data-surface`
  field and the text tokens remap; never hand-pick a light text colour. Muted and subtle text are
  for secondary content only.

## For authors

The binding authoring contract is `packages/ui/AUTHORING.md`; the decisions are in
`docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`. Foundation pages live in
`apps/storybook/src/foundations`, their helpers in `apps/storybook/src/docs-kit` — docs-only, never
shipped in `packages/ui`.

Before you add a component:

1. **Tokens first** — a new visual value goes into `packages/design-tokens/tokens/` before any
   component uses it (AUTHORING §5).
2. **Read the design-system files and copy the canonical shape** (AUTHORING §1, §3), or run
   `/new-component`.
3. **Ship the trio** — component, test (behaviour + axe), stories (every card row) (AUTHORING §2).
4. **Gate:** `pnpm nx test ui && pnpm nx lint ui && pnpm nx run storybook:build`, then
   `pnpm nx test storybook` (AUTHORING §12).
````

- [ ] **Step 5: The Brand pages**

Create `apps/storybook/src/foundations/brand/logo.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./brand.stories";

<Meta title="Brand/Logo" />

{/* source: guidelines/brand-logo.card.html */}
{/* source: guidelines/brand-wordmark.card.html */}
{/* source: guidelines/brand-symbol.card.html */}
{/* source: guidelines/mark-legibility.card.html */}

# Logo

Three marks — **lockup**, **wordmark**, **symbol** — each in three tones: `pink` on light, `white`
on pink, ink or photography, and `badge` on its own pink plate. Reach for them through `Logo`
(`variant`, `tone`) or `LogoLockup` (clear space built in); never place, recolour or retype the
artwork by hand.

## Lockup

The official logo, tagline included — pink, white and the badge plate.

<Canvas of={Specimens.Lockup} meta={Specimens} sourceState="none" />

The tagline is part of the artwork — never set it in live type next to the mark; it is drawn,
kerned and locked to the wordmark, and retyping it drifts. Use the lockup wherever there is at
least 200px of width; below that switch to the wordmark. The lockup is the default in every
header, footer, app screen, artboard and template: the tagline tucks into the space beside the
"P" descender, so swapping it in costs no layout anywhere.

## Wordmark

The lockup with the tagline removed — headers, app chrome, anything under 200px wide.

<Canvas of={Specimens.Wordmark} meta={Specimens} sourceState="none" />

Clear space around any logo is the height of the "P". The wordmark's minimum width is 140px.
Never recolour, rotate, outline or add effects to the logo.

<Canvas of={Specimens.ClearSpace} meta={Specimens} sourceState="none" />

<Canvas of={Specimens.LogoTokens} meta={Specimens} sourceState="none" />

## Symbol

The standalone diamond mark: pink and white on transparent, plus the badge plate — the app icon,
favicon and avatar.

<Canvas of={Specimens.SymbolMark} meta={Specimens} sourceState="none" />

## Mark legibility

How the embedded mark scales and strengthens as the diamond shrinks. Mark size and opacity both
ramp with the diamond: below 14px the mark is 86% of the square at 85% white, from 14 to 19px it
is 80% at 66%, and from 20px up it is 74% at 50%. Without the ramp a 12px dot draws an 8.9px
glyph at 42% — below the size where its strokes resolve, which is why small marks looked missing.
The components below draw the ramp themselves; they are shown at every size they ship.

<Canvas of={Specimens.MarkLegibility} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/brand/pattern.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./brand.stories";

<Meta title="Brand/Pattern" />

{/* source: guidelines/brand-pattern.card.html */}
{/* source: guidelines/diamond-motif.card.html */}

# Pattern

The white symbol, tiled faintly, is the brand's only texture. No noise, no grain, no paper
texture, no hand-drawn illustration.

<Canvas of={Specimens.PatternFields} meta={Specimens} sourceState="none" />

`PatternField` paints it: `tone` sets the field and its `data-surface`, `tile` picks a tile size,
and `density="faint"` is the lighter pattern the handoff uses on ink sections. Use it on pink
panels, ticket stubs and loading states — never on cards, and never behind body text.

<Canvas of={Specimens.PatternTokens} meta={Specimens} sourceState="none" />

## Diamond + symbol

Every small diamond the system draws — heat levels, review scores, order-step markers, status
dots — is a rotated square with the brand mark inside it: white on a coloured fill, pink on an
empty ink-200 fill, so it never blends away. The loader is the bare mark, pulsing. These are the
live components, at the sizes the design system weighed (heat, step, score, dot, loader).

<Canvas of={Specimens.DiamondMotif} meta={Specimens} sourceState="none" />

The design system compared five treatments before settling on this one: plain diamonds, the mark
inside and upright, inside and aligned with the diamond, knocked out, and the mark alone (which
loses the heat colour). Places that already use the mark on its own — the loyalty card, empty
states, dividers, pattern fields — keep the bare symbol.
```

Create `apps/storybook/src/foundations/brand/company-details.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./brand.stories";

<Meta title="Brand/Company details" />

{/* source: guidelines/brand-company.card.html */}

# Company details

`brand` from `@pink-paprikaa-web/content` is the single source for name, legal, GST, contact,
outlets and billing — the design system's `brand.js`, validated by a Zod schema where it enters the
workspace. Every design reads from it; a page never retypes a fact. The derived strings —
copyright, licence lines, footer policies — come from `toBrandLines(brand, year)`, with the year
passed in when the site is built.

<Canvas of={Specimens.CompanyFacts} meta={Specimens} sourceState="none" />

A fact the owner has not supplied yet is `null` in the data — never the string "TODO" — and this
page shows every one as **Owner to supply**, then lists them by path. The count is computed from
the data, so a new pending fact appears here the moment it is added, and the page's test fails if
a box stops showing one.

The design system itself never imports these facts (a boundary rule): components take them as
props, and only apps and this Storybook bind them.
```

Create `apps/storybook/src/foundations/brand/voice-and-content.mdx` (design-system `readme.md` §2, verbatim except the two table-header glyphs, which are words here — the brand uses no emoji — plus the first bullet, the two-`a` rule carried from dev's Voice page):

```mdx
import { Meta } from "@storybook/addon-docs/blocks";

<Meta title="Brand/Voice & content" />

{/* source: readme.md §2 Content fundamentals */}

# Voice & content

**Voice: a confident city café that speaks Hinglish without apology.** The brand's one supplied
line of copy sets the whole tone — _"India's First Desi Urban Café"_: a claim, stated flatly, in
Title Case, no punctuation, no hedging. Copy follows that lead.

## Rules

- **`Pink Paprikaa` — two `a`s**, everywhere. A misspelling is a content bug, not a typo.
- **Person.** Talk to the guest as **you**; the café speaks as **we**. Never "the customer", never
  "users". _"Your table's ready."_ / _"We roast our own masala."_
- **Casing.** Title Case for names, claims and buttons of consequence (_"Order Now"_, _"Find a
  Paprikaa"_). Sentence case for body, helper text and form labels. **ALL CAPS only for
  eyebrows/overlines and heat labels** (`MENU`, `EXTRA HOT`) — never for a full sentence.
- **Length.** Headlines ≤ 6 words. Body sentences short — average 12 words, hard stop at 24. Menu
  descriptions ≤ 14 words, ingredient-led, no adjective stacking: _"Amritsari paneer, burnt chilli
  mayo, potato brioche."_ not _"A delicious hand-crafted artisanal paneer creation."_
- **Interface labels are plain, generic English.** Spice is _Mild / Medium / Hot / Extra Hot_;
  sizes are _Regular / Sharing_; nothing a guest has to decode. Anything a person taps, filters by,
  or is billed for uses the word they already know.
- **Hinglish belongs to dish names and voice, not to controls.** _Kulhad Chai_, _Gulkand Kulfi_,
  _Masala Cold Brew_ are dish names and stay as they are; the tagline _"Desi at heart. Urban by
  nature."_ stays exactly as written. But a filter chip, a radio label, a status line or a button
  never carries a word the guest might not know. Devanagari is reserved for the logo, big display
  moments and dish names on the menu (`छोले`, `कुल्फी`).
- **Numbers & prices.** `₹` with no space, no decimals on whole rupees: `₹240`. Ranges use an en
  dash: `₹180–₹320`. Times are 12-hour lowercase: `8am – 11:30pm`.
- **Emoji: no.** The brand has a chilli, a diamond symbol and a very loud pink; it does not need
  emoji. Use the chilli/heat glyph component for spice, not an emoji.
- **Exclamation marks:** at most one per screen, and never in a heading.
- **Being pure veg is stated once, plainly, and never apologised for or over-sold**: _"100%
  vegetarian kitchen."_ Never "veg-friendly", never "even meat-eaters love it", never a leaf emoji.
  The veg badge sits in the menu header and the footer — not on every dish name (the `DietMark`
  does that job).
- **Never say:** "artisanal", "curated", "experience" (as a noun), "elevated", "journey",
  "unleash", "revolutionise". Never call the food "authentic" — the brand's claim is _desi_, which
  is a fact, not a compliment.

## Examples

| Situation       | Write                                                                  | Don't                                                          |
| --------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Hero headline   | Desi at heart. Urban by nature.                                        | Experience Our Curated Culinary Journey                        |
| Menu item       | Paprikaa Chilli Paneer — `₹280` · Amritsari paneer, burnt chilli mayo. | Our signature artisanal paneer creation, lovingly hand-crafted |
| Veg claim       | 100% vegetarian kitchen. Always was.                                   | 100% PURE VEG!! No compromise!                                 |
| Empty cart      | Nothing here yet. Let's fix that.                                      | Your cart is currently empty!                                  |
| Error           | That card didn't go through. Try another?                              | Transaction failed. Error code 402.                            |
| Order confirmed | Order in. Kitchen's on it.                                             | Thank you for your purchase!!!                                 |
| Loyalty         | 3 more visits and chai's on us.                                        | Unlock exclusive rewards today                                 |
```

(The design system's "Empty cart — Don't" cell ends with a cart emoji; it is dropped here for the same no-emoji rule the row illustrates.)

Create `apps/storybook/src/foundations/brand/iconography.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./brand.stories";

<Meta title="Brand/Iconography" />

{/* source: readme.md §4 Iconography */}

# Iconography

- **Lucide, self-hosted.** No icon set was supplied with the brand assets, so the system
  standardises on Lucide — a 24px grid, round caps, geometric construction, the closest match to
  the logo's even-weight geometry. It ships as `lucide-react` (tree-shaken, server-safe) and is
  passed as a component — `icon={MessageCircle}` — never a name string, never fetched from a CDN.
- **Stroke icons only**, painted with `currentColor` — never a second colour, never filled and
  stroked together. `Icon` sets the stroke itself: 2 at the two smallest sizes, 1.75 above.
- **Sizes by job:** `sm` inline with body text, `md` in buttons and list rows, `lg` in nav and the
  tab bar, `xl` in empty states.

<Canvas of={Specimens.IconSizes} meta={Specimens} sourceState="none" />

- **Brand glyphs belong to the brand.** The diamond symbol is a brand mark — bullets, loaders,
  pattern tiles, the app's launcher — never restyled or recoloured beyond pink and white. The
  chilli in the logo is part of the lockup and is never extracted as a standalone icon. The three
  social glyphs Lucide 1.x no longer ships are `InstagramGlyph`, `YoutubeGlyph` and
  `LinkedinGlyph`, drawn on the same grid.

<Canvas of={Specimens.BrandGlyphs} meta={Specimens} sourceState="none" />

- **Emoji are never icons** — not even for spice. Heat is `SpiceLevel`: filled diamonds on the heat
  ramp.
- **Unicode is used for two things only:** `₹` and the en dash in ranges.
- **The kitchen is 100% vegetarian — nothing non-veg, not even egg.** The only diet mark is the
  statutory green veg mark, `DietMark`, and every dish carries it. There is no egg mark and never a
  non-veg mark (owner decision 2026-09-27, spec C10 — the design system's egg-dot line is
  superseded).

<Canvas of={Specimens.DietAndHeat} meta={Specimens} sourceState="none" />
```

- [ ] **Step 6: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- brand.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
```

Expected: 13 Brand specimens pass (axe included); the build indexes `Introduction` and the five Brand pages. Open `storybook:serve` → Brand → each page and confirm every Canvas renders (MDX is not run by the test suite; a broken `<Canvas of>` shows only here).

```bash
git add apps/storybook/src/docs apps/storybook/src/foundations/brand
git commit -m "feat(storybook): introduction and the Brand foundation pages

Logo, Pattern, Company details, Voice & content and Iconography from the
design system's cards and readme. Company details binds the validated brand
facts and lists every fact the owner has not supplied, counted from the data.
No egg mark: the kitchen is egg-free.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

