### Task 8: SiteFooter

**Dev reference:** `git show dev:packages/ui/src/organisms/site-footer/site-footer.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                         | Ruling  | Where / clause                                                      |
| -------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------- |
| The `contentinfo` landmark                                                       | ALREADY | test "is the page's contentinfo landmark…"                          |
| White lockup built in                                                            | DROP    | D9 — the `brand` slot (stories pass `<Logo tone="white">`)          |
| Floods `bg-surface-brand`                                                        | ADD     | the tone `it.each` asserts the background class                     |
| Default columns, blurb, statement, FSSAI licence, legal entity, policies, social | DROP    | D9 — the August fake FSSAI default; Review Focus 5 test             |
| Caller columns replace everything                                                | ALREADY | test "renders exactly what it is given…"                            |
| Social links named, new tab, `rel`                                               | ALREADY | test "names each social link and opens it in a new tab"             |
| Social links keep the 44px hit target                                            | ALREADY | IconButton's `::before` hit area (Plan 2a)                          |
| Generic glyphs for the networks (AtSign, Play, Briefcase)                        | DROP    | D10 — the real brand glyphs                                         |
| Policy links                                                                     | ALREADY | test "renders the brand block, legal lines and policy links…"       |
| Column headings as `<p>`                                                         | DROP    | spec §9.3 — "headings not `<p>`"                                    |
| `Link variant="inverse"`, `Divider on="brand"`                                   | DROP    | D5                                                                  |
| Merges a caller `className`                                                      | ADD     | test "merges a caller className over its own"                       |
| axe                                                                              | ALREADY | test "has no accessibility violations"                              |
| Stories Default · OneColumn · OwnCopy · Smallest                                 | ALREADY | DesignSystemPink · ColumnsOnly · Playground (`brand` slot) · Mobile |
| Story FourColumns                                                                | ADD     | `FourColumns`                                                       |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/site-footer.json`
- Create: `packages/ui/src/organisms/site-footer/site-footer.tsx`, `site-footer.test.tsx`, `site-footer.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`/`IconComponent`, `InstagramGlyph`/`YoutubeGlyph`/`LinkedinGlyph`, `IconButton` (`asChild`), `PatternField`, `Text`, `LinkAs`/`LinkAsProps`, `componentVariants`, `headingTag`; the `autogrid-min-sm` utility (Plan 2c — the handoff footer's 200px column minimum); stories: `Badge`, `DietMark`, `Logo`.
- Produces: `SiteFooter`, `SiteFooterProps`, `FooterItem`, `FooterColumn`, `FooterSocialLink`, `FooterPolicy`; the `pb-site-footer-dock-clearance` contract that Task 9 relies on.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/site-footer.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "site-footer-top": {
      "$value": "clamp(44px, 5vw, 64px)",
      "$description": "Footer top padding (design system SiteFooter)."
    },
    "site-footer-gap": { "$value": "clamp(28px, 3vw, 40px)" },
    "site-footer-dock-clearance": {
      "$value": "calc(110px + env(safe-area-inset-bottom, 0px))",
      "$description": "Bottom padding when an ActionDock is on the page — the handoff's 110px plus the iOS home-indicator inset, more than the dock's own height, so it never covers the legal links."
    }
  }
}
```

Append to `SPACING`:

```ts
  "site-footer-top",
  "site-footer-gap",
  "site-footer-dock-clearance",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/site-footer/site-footer.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { Phone } from "lucide-react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type FooterColumn, SiteFooter } from "./site-footer";

const COLUMNS: FooterColumn[] = [
  {
    heading: "Eat with us",
    items: [
      { label: "Homely Meals", href: "#homely-meals" },
      { label: "Catering & Bulk Orders", href: "#catering" },
    ],
  },
  {
    heading: "Talk to us",
    items: [{ label: "Call +91 90907 04001", href: "tel:+919090704001", icon: Phone }],
  },
  { heading: "Kitchen & restaurant", items: [{ label: "8am – 11:30pm, every day" }] },
];

function RouterLink({ href, className, children }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="">
      {children}
    </a>
  );
}

describe("SiteFooter", () => {
  it("is the page's contentinfo landmark with one labelled nav per link column", () => {
    render(<SiteFooter columns={COLUMNS} />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    const eat = screen.getByRole("navigation", { name: "Eat with us" });
    expect(within(eat).getByRole("heading", { level: 2, name: "Eat with us" })).toBeInTheDocument();
    expect(within(eat).getAllByRole("listitem")).toHaveLength(2);
    expect(within(eat).getByRole("link", { name: "Homely Meals" })).toHaveAttribute(
      "href",
      "#homely-meals"
    );
  });

  it("keeps a column with no links out of the navigation landmarks", () => {
    render(<SiteFooter columns={COLUMNS} />);
    expect(
      screen.queryByRole("navigation", { name: "Kitchen & restaurant" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kitchen & restaurant" })).toBeInTheDocument();
    expect(screen.getByText("8am – 11:30pm, every day").closest("a")).toBeNull();
  });

  it("renders exactly what it is given — no licence, tax, contact or social defaults", () => {
    const { container } = render(
      <SiteFooter
        columns={[{ heading: "Eat with us", items: [{ label: "Homely Meals", href: "#homely" }] }]}
      />
    );
    expect(container.textContent).toBe("Eat with usHomely Meals");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(container.textContent).not.toMatch(/FSSAI|GSTIN|©|\+91|pinkpaprikaa\.com/);
  });

  it("names each social link and opens it in a new tab", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        social={[
          { network: "instagram", href: "https://instagram.com/pinkpaprikaa", label: "Instagram" },
          { network: "youtube", href: "https://youtube.com/@pinkpaprikaa", label: "YouTube" },
        ]}
      />
    );
    const instagram = screen.getByRole("link", { name: "Instagram" });
    expect(instagram).toHaveAttribute("href", "https://instagram.com/pinkpaprikaa");
    expect(instagram).toHaveAttribute("target", "_blank");
    expect(instagram).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "YouTube" })).toBeInTheDocument();
  });

  it("renders the brand block, legal lines and policy links it is given", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        brand={<p>100% Pure Veg Kitchen</p>}
        legal={<span>© 2026 Paprikaa Culinary Ventures Private Limited</span>}
        policies={[
          { label: "Privacy Policy", href: "#privacy" },
          { label: "Terms of Service", href: "#terms" },
        ]}
      />
    );
    expect(screen.getByText("100% Pure Veg Kitchen")).toBeInTheDocument();
    expect(
      screen.getByText("© 2026 Paprikaa Culinary Ventures Private Limited")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "#privacy"
    );
  });

  it("renders column and policy links through linkAs", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        policies={[{ label: "Privacy Policy", href: "#privacy" }]}
        linkAs={RouterLink}
      />
    );
    expect(screen.getByRole("link", { name: "Homely Meals" })).toHaveAttribute("data-router-link");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "data-router-link"
    );
  });

  it.each([
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
  ] as const)("sets the %s surface and paints its field", (tone, background) => {
    render(<SiteFooter columns={COLUMNS} tone={tone} />);
    expect(screen.getByRole("contentinfo")).toHaveAttribute("data-surface", tone);
    expect(screen.getByRole("contentinfo")).toHaveClass(background);
  });

  it("merges a caller className over its own", () => {
    render(<SiteFooter columns={COLUMNS} className="bg-surface-inverse" />);
    expect(screen.getByRole("contentinfo")).toHaveClass("bg-surface-inverse");
    expect(screen.getByRole("contentinfo")).not.toHaveClass("bg-surface-brand");
  });

  it("carries the faint diamond on ink by default and none on brand", () => {
    const { container, rerender } = render(<SiteFooter columns={COLUMNS} tone="ink" />);
    const layer = () => container.querySelector('footer > [aria-hidden="true"]');
    expect(layer()).toBeInTheDocument();
    rerender(<SiteFooter columns={COLUMNS} tone="brand" />);
    expect(layer()).not.toBeInTheDocument();
    rerender(<SiteFooter columns={COLUMNS} tone="brand" pattern="default" />);
    expect(layer()).toBeInTheDocument();
  });

  it("pads the bottom clear of an ActionDock only when asked", () => {
    const { rerender } = render(<SiteFooter columns={COLUMNS} />);
    expect(screen.getByRole("contentinfo")).toHaveClass("pb-10");
    rerender(<SiteFooter columns={COLUMNS} hasDockClearance />);
    expect(screen.getByRole("contentinfo")).toHaveClass("pb-site-footer-dock-clearance");
    expect(screen.getByRole("contentinfo")).not.toHaveClass("pb-10");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SiteFooter
        tone="ink"
        columns={COLUMNS}
        brand={<p>100% Pure Veg Kitchen</p>}
        social={[
          { network: "instagram", href: "https://instagram.com/pinkpaprikaa", label: "Instagram" },
        ]}
        legal={<span>© 2026 Paprikaa Culinary Ventures Private Limited</span>}
        policies={[{ label: "Privacy Policy", href: "#privacy" }]}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- site-footer 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./site-footer`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/site-footer/site-footer.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";

import { InstagramGlyph, LinkedinGlyph, YoutubeGlyph } from "../../atoms/icon/brand-glyphs";
import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

export interface FooterItem {
  label: ReactNode;
  /** Omit for a plain line (an address, opening hours). */
  href?: string | undefined;
  icon?: IconComponent | undefined;
}

export interface FooterColumn {
  heading: string;
  items: FooterItem[];
}

export interface FooterSocialLink {
  network: "instagram" | "youtube" | "linkedin";
  href: string;
  /** Accessible name, e.g. "Pink Paprikaa on Instagram". */
  label: string;
}

export interface FooterPolicy {
  label: string;
  href: string;
}

const SOCIAL_GLYPH: Readonly<Record<FooterSocialLink["network"], IconComponent>> = {
  instagram: InstagramGlyph,
  youtube: YoutubeGlyph,
  linkedin: LinkedinGlyph,
};

const siteFooter = componentVariants({
  slots: {
    root: "relative",
    pattern: "absolute inset-0",
    grid: "gap-site-footer-gap pt-site-footer-top relative container-page grid autogrid-min-sm pb-8",
    brand: "flex flex-col items-start gap-3.5",
    social: "flex gap-2",
    column: "flex min-w-0 flex-col gap-3.5",
    items: "flex flex-col items-start gap-2.5",
    item: "inline-flex items-start gap-2 text-body text-text-body",
    link: "inline-flex items-start gap-2 text-body text-text-link no-underline hover:underline",
    itemIcon: "mt-1",
    legal: "relative container-page",
    legalBar:
      "flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-t border-border-subtle pt-5 text-caption text-text-subtle",
    legalText: "flex flex-wrap gap-x-6 gap-y-2.5",
    policies: "flex flex-wrap gap-x-5 gap-y-2.5",
    policyLink: "text-text-muted no-underline hover:underline",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
    },
    hasDockClearance: {
      true: { root: "pb-site-footer-dock-clearance" },
      false: { root: "pb-10" },
    },
  },
  defaultVariants: { tone: "brand", hasDockClearance: false },
});

type FooterTone = NonNullable<VariantProps<typeof siteFooter>["tone"]>;
type FooterPattern = "none" | "default" | "faint";

/** The design system's pink footer is flat; the handoff's ink footer carries the 4% diamond. */
const DEFAULT_PATTERN: Readonly<Record<FooterTone, FooterPattern>> = {
  brand: "none",
  ink: "faint",
};

export interface SiteFooterProps
  extends ComponentProps<"footer">, Pick<VariantProps<typeof siteFooter>, "tone"> {
  /** The brand block — lockup, veg chip, licence line, blurb, contact lines: whatever the app passes. */
  brand?: ReactNode;
  columns: FooterColumn[];
  social?: FooterSocialLink[] | undefined;
  /** Legal lines (©, GSTIN), rendered verbatim. The system holds no company facts. */
  legal?: ReactNode;
  policies?: FooterPolicy[] | undefined;
  linkAs?: LinkAs | undefined;
  /** Defaults to `none` on brand and `faint` on ink. */
  pattern?: FooterPattern | undefined;
  /** Pad the bottom so the page's ActionDock never covers the legal links. */
  hasDockClearance?: boolean | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The site footer: brand block, link columns (each a labelled nav with list markup; a column of
 * plain lines stays a plain group), social links and the legal bar. It renders exactly what it
 * is given — the FSSAI line, GSTIN and © come from the app's brand facts, never from here.
 */
export function SiteFooter({
  tone = "brand",
  brand,
  columns,
  social = [],
  legal,
  policies = [],
  linkAs: LinkComponent = "a",
  pattern,
  hasDockClearance = false,
  headingLevel = 2,
  className,
  ...props
}: SiteFooterProps) {
  const slots = siteFooter({ tone, hasDockClearance });
  const density = pattern ?? DEFAULT_PATTERN[tone];
  const heading = headingTag(headingLevel);
  const hasBrandBlock = brand !== undefined || social.length > 0;
  const hasLegalBar = legal !== undefined || policies.length > 0;
  return (
    <footer data-surface={tone} className={slots.root({ className })} {...props}>
      {density === "none" ? null : (
        <PatternField
          aria-hidden
          tone={tone}
          tile={80}
          density={density}
          className={slots.pattern()}
        />
      )}
      <div className={slots.grid()}>
        {hasBrandBlock ? (
          <div className={slots.brand()}>
            {brand}
            {social.length > 0 ? (
              <ul className={slots.social()}>
                {social.map((link) => (
                  <li key={link.network}>
                    <IconButton
                      asChild
                      icon={SOCIAL_GLYPH[link.network]}
                      label={link.label}
                      variant="secondary"
                    >
                      <a
                        href={link.href}
                        aria-label={link.label}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    </IconButton>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {columns.map((column) => {
          const Column = column.items.some((item) => item.href !== undefined) ? "nav" : "div";
          return (
            <Column
              key={column.heading}
              aria-label={Column === "nav" ? column.heading : undefined}
              className={slots.column()}
            >
              <Text as={heading} variant="overline" tone="brand">
                {column.heading}
              </Text>
              <ul className={slots.items()}>
                {column.items.map((item, index) => {
                  const icon = item.icon ? (
                    <Icon icon={item.icon} size="sm" className={slots.itemIcon()} />
                  ) : null;
                  return (
                    <li key={index}>
                      {item.href === undefined ? (
                        <span className={slots.item()}>
                          {icon}
                          {item.label}
                        </span>
                      ) : (
                        <LinkComponent href={item.href} className={slots.link()}>
                          {icon}
                          {item.label}
                        </LinkComponent>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Column>
          );
        })}
      </div>
      {hasLegalBar ? (
        <div className={slots.legal()}>
          <div className={slots.legalBar()}>
            {legal === undefined ? null : <div className={slots.legalText()}>{legal}</div>}
            {policies.length > 0 ? (
              <ul className={slots.policies()}>
                {policies.map((policy) => (
                  <li key={policy.href}>
                    <LinkComponent href={policy.href} className={slots.policyLink()}>
                      {policy.label}
                    </LinkComponent>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </footer>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- site-footer 2>&1 | tail -8`
Expected: PASS (12 tests).

- [ ] **Step 6: Stories (card parity with `SiteFooter.card.html` + handoff `PPFooter`)**

`packages/ui/src/organisms/site-footer/site-footer.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { CreditCard, Mail, MessageCircle, Phone } from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { Logo } from "../../atoms/logo/logo";
import { Text } from "../../atoms/text/text";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { type FooterColumn, type FooterSocialLink, SiteFooter } from "./site-footer";

/** The design system card's columns (its sample information architecture). */
const DS_COLUMNS: FooterColumn[] = [
  {
    heading: "Eat",
    items: [
      { label: "Full Menu", href: "#menu" },
      { label: "Small Plates", href: "#small-plates" },
      { label: "Chai & Coffee", href: "#chai" },
      { label: "Sweets", href: "#sweets" },
    ],
  },
  {
    heading: "Visit",
    items: [
      { label: "Outlets", href: "#outlets" },
      { label: "Book a Table", href: "#book" },
      { label: "Private Dining", href: "#private-dining" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "Our Story", href: "#about" },
      { label: "Careers", href: "#careers" },
    ],
  },
];

/** The handoff footer's columns, with the brand facts from story-fixtures. */
const HANDOFF_COLUMNS: FooterColumn[] = [
  {
    heading: "Eat with us",
    items: [
      { label: "Homely Meals", href: "#homely-meals" },
      { label: "This week’s menu", href: "#this-week" },
      { label: "Catering & Bulk Orders", href: "#catering" },
      { label: "Office & PG Lunch", href: "#office-lunch" },
      { label: "Restaurant Menu", href: "#menu" },
    ],
  },
  {
    heading: "Talk to us",
    items: [
      { label: `WhatsApp ${BRAND.phoneDisplay}`, href: BRAND.whatsappHref, icon: MessageCircle },
      { label: `Call ${BRAND.phoneDisplay}`, href: BRAND.phoneHref, icon: Phone },
      { label: BRAND.email, href: BRAND.emailHref, icon: Mail },
      { label: "About us", href: "#about" },
      { label: "Contact & directions", href: "#contact" },
    ],
  },
  {
    heading: "Kitchen & restaurant",
    items: [
      { label: BRAND.address },
      { label: BRAND.hours },
      { label: BRAND.payments, icon: CreditCard },
      { label: `Instagram ${BRAND.instagramHandle}`, href: BRAND.instagramHref },
    ],
  },
];

const SOCIAL: FooterSocialLink[] = [
  { network: "instagram", href: BRAND.instagramHref, label: "Pink Paprikaa on Instagram" },
  { network: "youtube", href: BRAND.youtubeHref, label: "Pink Paprikaa on YouTube" },
  { network: "linkedin", href: BRAND.linkedinHref, label: "Pink Paprikaa on LinkedIn" },
];

const meta = {
  title: "Organisms/SiteFooter",
  component: SiteFooter,
  args: {
    tone: "brand",
    columns: DS_COLUMNS,
    brand: (
      <>
        <Logo tone="white" className="w-65" />
        <Text variant="body-sm" tone="muted">
          Chai at 8am, chilli paneer at midnight. One kitchen in Sector 57, Gurgaon.
        </Text>
        <div className="flex flex-col gap-1">
          <Text as="span" variant="body-sm">
            {BRAND.website}
          </Text>
          <Text as="span" variant="body-sm">
            {BRAND.phoneDisplay}
          </Text>
          <Text as="span" variant="body-sm">
            {BRAND.email}
          </Text>
        </div>
      </>
    ),
    social: SOCIAL,
    legal: (
      <>
        <span>{BRAND.copyright}</span>
        <span>{BRAND.fssai}</span>
      </>
    ),
    policies: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "Refunds", href: "#refunds" },
    ],
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The site footer — a flooded field (pink in the design system, ink with the faint diamond in the handoff), brand block, link columns, social links and the legal bar. It renders exactly what it is given: the FSSAI licence line (legally required on Indian food sites), GSTIN and © come from the app's brand facts. Columns auto-fit and collapse to one on mobile. Pass `hasDockClearance` on pages with an ActionDock.",
      },
    },
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: the full design-system footer (brand tone). */
export const DesignSystemPink: Story = {};

/** Handoff PPFooter — ink, faint diamond, contact rows with icons, dock clearance. */
export const HandoffInk: Story = {
  args: {
    tone: "ink",
    columns: HANDOFF_COLUMNS,
    brand: (
      <>
        <Logo tone="white" className="w-50" />
        <Badge tone="success">
          <DietMark size="sm" />
          100% Pure Veg Kitchen
        </Badge>
        <Text as="span" variant="mono" tone="muted">
          {BRAND.fssai}
        </Text>
      </>
    ),
    social: [],
    legal: (
      <>
        <span>{BRAND.copyright}</span>
        <span>{BRAND.gstin}</span>
      </>
    ),
    policies: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Refund & Cancellation", href: "#refunds" },
      { label: "Delivery Policy", href: "#delivery" },
    ],
    hasDockClearance: true,
  },
};

/** Only columns given — nothing else appears (no default facts). */
export const ColumnsOnly: Story = {
  args: {
    brand: undefined,
    social: [],
    legal: undefined,
    policies: [],
    columns: HANDOFF_COLUMNS.slice(0, 1),
  },
};

/** Four link columns still fit; a fifth belongs on a page, not in the footer. */
export const FourColumns: Story = {
  args: {
    columns: [
      ...DS_COLUMNS,
      {
        heading: "Help",
        items: [
          { label: "Contact & directions", href: "#contact" },
          { label: "Delivery Policy", href: "#delivery" },
        ],
      },
    ],
  },
};

export const Mobile: Story = { ...HandoffInk, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffInk, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffInk, globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export {
  type FooterColumn,
  type FooterItem,
  type FooterPolicy,
  type FooterSocialLink,
  SiteFooter,
  type SiteFooterProps,
} from "./organisms/site-footer/site-footer";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/site-footer packages/design-tokens/tokens/component/site-footer.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/site-footer.json packages/ui/src/organisms/site-footer packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the SiteFooter organism

Pink or ink footer with brand block, link columns as labelled navs (plain
lines stay plain), social links and the legal bar, all rendered through
linkAs. It carries no company facts: the test proves a footer given only a
column prints only that column — the August port's fake FSSAI default
cannot come back. hasDockClearance pads it clear of the ActionDock.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

