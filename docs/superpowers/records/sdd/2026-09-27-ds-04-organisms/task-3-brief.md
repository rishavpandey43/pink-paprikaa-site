### Task 3: HeroBanner

**Dev reference:** `git show dev:packages/ui/src/organisms/hero-banner/hero-banner.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                       | Ruling  | Where / clause                                                                                          |
| ------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------- |
| The title is the page's `h1`                                                   | ALREADY | test "renders its title as the page's h1 by default"                                                    |
| The title is the fluid display step by default (`text-display-1-fluid`)        | ADD     | test "sets the title in the fluid display-1 step by default"                                            |
| Overline, body and actions render                                              | ALREADY | test "renders the badges, overline, body and actions…"                                                  |
| Every meta fact, diamond between each pair                                     | ALREADY | test "lists the meta facts…"                                                                            |
| Headline ink class per tone                                                    | DROP    | D5 — `data-surface` per tone (tested)                                                                   |
| Default placeholder `imageLabel = "Hero food photography 4:5"`                 | DROP    | D9; contract §7 `media` slot (Playground passes the labelled ImageSlot)                                 |
| `image` / `imageAlt` / `imageCaption` props                                    | DROP    | contract §7 / spec §9.3 `media` slot (ImageSlot + overlays)                                             |
| Caption on the `scrim-bottom` over a real photograph, never over a placeholder | ADD     | story `WithPhotograph` composes it in the media slot                                                    |
| Centred layout shows no image                                                  | ALREADY | `media` renders only when passed (SoftCentred passes none)                                              |
| Split tracks stack the photo under the copy at 360px                           | ALREADY | one column below `lg`                                                                                   |
| Merges a caller `className`                                                    | ADD     | test "merges a caller className over its own"                                                           |
| axe                                                                            | ALREADY | test "has no accessibility violations"                                                                  |
| `variant` split/center                                                         | ALREADY | contract `layout`                                                                                       |
| `on="brand"` on the actions                                                    | DROP    | D5                                                                                                      |
| "Est. 2019"                                                                    | DROP    | C3 — established 2025                                                                                   |
| Stories Default · Tones · Centred · Soft · AwaitingPhotography · Smallest      | ALREADY | Playground · BrandSplit/InkSplit · SoftCentred · SoftCentred · Playground (labelled ImageSlot) · Mobile |
| Story HeadlineOnly                                                             | ADD     | `HeadlineOnly`                                                                                          |
| Story WithPhotograph                                                           | ADD     | `WithPhotograph`                                                                                        |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/hero-banner.json`
- Create: `packages/ui/src/organisms/hero-banner/hero-banner.tsx`, `hero-banner.test.tsx`, `hero-banner.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `SymbolMark` (`lib/symbol-mark`, Plan 2a — the meta diamond), `PatternField`, `Text`, `componentVariants`, `headingTag`; stories: `Badge`, `Button`, `DietMark`, `Icon`, `ImageSlot`, `OfferSeal`.
- Produces: `HeroBanner`, `HeroBannerProps`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/hero-banner.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "hero-banner-y": {
      "$value": "clamp(28px, 6vw, 80px)",
      "$description": "Hero vertical rhythm (handoff Home and Catering heroes; tighter than section-y so the fold holds the headline and actions on phones)."
    },
    "hero-banner-gap": {
      "$value": "clamp(24px, 5vw, 64px)",
      "$description": "Gap between the copy and the media column."
    }
  }
}
```

Append to `SPACING`:

```ts
  "hero-banner-y",
  "hero-banner-gap",
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -c "hero-banner" packages/design-tokens/dist/theme.css`
Expected: `2`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/hero-banner/hero-banner.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { HeroBanner } from "./hero-banner";

const TITLE = "Desi at heart. Urban by nature.";
const META = ["Est. 2025", "Sector 57, Gurgaon", "Open till 11:30pm"];

const patternLayer = (container: HTMLElement) =>
  container.querySelector('section > [aria-hidden="true"]');

describe("HeroBanner", () => {
  it("renders its title as the page's h1 by default", () => {
    render(<HeroBanner title={TITLE} />);
    expect(screen.getByRole("heading", { level: 1, name: TITLE })).toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<HeroBanner title={TITLE} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: TITLE })).toBeInTheDocument();
  });

  it("sets the title in the fluid display-1 step by default, so it never overflows", () => {
    render(<HeroBanner title={TITLE} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-display-1-fluid");
  });

  it("renders the badges, overline, body and actions it is given — and nothing else", () => {
    const { container } = render(
      <HeroBanner
        badges={<span>Pure Veg</span>}
        overline="Homely Meals"
        title={TITLE}
        body="Pure veg lunch and dinner."
        actions={<a href="#plans">See plans</a>}
        pattern="none"
      />
    );
    expect(screen.getByRole("link", { name: "See plans" })).toBeInTheDocument();
    expect(container.textContent).toBe(
      `Pure VegHomely Meals${TITLE}Pure veg lunch and dinner.See plans`
    );
  });

  it("lists the meta facts with a decorative diamond between each pair", () => {
    render(<HeroBanner title={TITLE} meta={META} />);
    const list = screen.getByRole("list");
    const facts = within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(facts).toEqual(META);
    expect(list.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
  });

  it("puts the media slot in a positioned column for overlays such as an OfferSeal", () => {
    render(
      <HeroBanner
        title={TITLE}
        media={<img src="hero.jpg" alt="A Homely Meals box" width={400} height={300} />}
      />
    );
    expect(screen.getByRole("img", { name: "A Homely Meals box" }).parentElement).toHaveClass(
      "relative",
      "min-w-0"
    );
  });

  it.each([
    ["brand", "brand"],
    ["ink", "ink"],
    ["soft", "soft"],
    ["alt", "light"],
  ] as const)("tone %s sets the %s surface", (tone, surface) => {
    const { container } = render(<HeroBanner title={TITLE} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", surface);
  });

  it("carries the diamond on the flooded tones and not on the alt tint unless asked", () => {
    const { container, rerender } = render(<HeroBanner title={TITLE} tone="brand" />);
    expect(patternLayer(container)).toBeInTheDocument();
    rerender(<HeroBanner title={TITLE} tone="alt" />);
    expect(patternLayer(container)).not.toBeInTheDocument();
    rerender(<HeroBanner title={TITLE} tone="alt" pattern="faint" />);
    expect(patternLayer(container)).toBeInTheDocument();
  });

  it("uses the display-2 ramp for a long headline", () => {
    render(
      <HeroBanner
        title="Feeding thirty people? It has to be right the first time."
        titleSize="display-2"
      />
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-display-2-fluid");
  });

  it("centres everything with layout=center", () => {
    const { container } = render(<HeroBanner title={TITLE} layout="center" pattern="none" />);
    expect(container.querySelector("section > div")).toHaveClass("text-center");
  });

  it("merges a caller className over its own", () => {
    const { container } = render(<HeroBanner title={TITLE} className="bg-surface-page" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-brand");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <HeroBanner
        overline="India's First Desi Urban Café"
        title={TITLE}
        meta={META}
        actions={<a href="#order">Order Now</a>}
        media={<img src="hero.jpg" alt="Chilli paneer" width={400} height={500} />}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- hero-banner 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./hero-banner`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/hero-banner/hero-banner.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { SymbolMark } from "../../lib/symbol-mark";

const heroBanner = componentVariants({
  slots: {
    root: "relative",
    pattern: "absolute inset-0",
    inner: "gap-hero-banner-gap py-hero-banner-y relative container-page grid items-center",
    copy: "flex min-w-0 flex-col gap-5",
    badges: "flex flex-wrap gap-2",
    actions: "flex flex-wrap gap-3",
    meta: "flex flex-wrap items-center gap-x-4.5 gap-y-2",
    metaItem: "flex items-center gap-4.5",
    metaMark: "size-3 opacity-80",
    media: "relative min-w-0",
  },
  variants: {
    tone: {
      // The diamond between meta facts: white on the dark fields, brand pink on the light ones.
      brand: { root: "bg-surface-brand", metaMark: "text-ink-000" },
      ink: { root: "bg-surface-inverse", metaMark: "text-ink-000" },
      soft: { root: "bg-surface-brand-soft", metaMark: "text-pink-500" },
      alt: { root: "bg-surface-page-alt", metaMark: "text-pink-500" },
    },
    layout: {
      split: { inner: "lg:grid-cols-2" },
      center: {
        inner: "justify-items-center text-center",
        copy: "max-w-article items-center",
        badges: "justify-center",
        actions: "justify-center",
        meta: "justify-center",
      },
    },
  },
  defaultVariants: { tone: "brand", layout: "split" },
});

type HeroTone = NonNullable<VariantProps<typeof heroBanner>["tone"]>;
type HeroPattern = "none" | "default" | "faint";

/** The surface each tone paints; `alt` is the handoff's pink-50 tint, a light surface. */
const SURFACE: Readonly<Record<HeroTone, "brand" | "ink" | "soft" | "light">> = {
  brand: "brand",
  ink: "ink",
  soft: "soft",
  alt: "light",
};

/** Flooded tones carry the diamond (design system); the alt tint is plain (handoff heroes). */
const DEFAULT_PATTERN: Readonly<Record<HeroTone, HeroPattern>> = {
  brand: "default",
  ink: "default",
  soft: "default",
  alt: "none",
};

export interface HeroBannerProps
  extends
    Omit<ComponentProps<"section">, "title">,
    Pick<VariantProps<typeof heroBanner>, "tone" | "layout"> {
  overline?: ReactNode;
  /** Badge row above the title (handoff): the product badge and the Pure Veg badge. */
  badges?: ReactNode;
  title: ReactNode;
  /** `display-2` for a long headline (handoff Catering). */
  titleSize?: "display-1" | "display-2" | undefined;
  headingLevel?: HeadingLevel | undefined;
  body?: ReactNode;
  /** One or two Buttons. */
  actions?: ReactNode;
  /** Short facts separated by the brand diamond, e.g. `["Est. 2025", "Sector 57, Gurgaon"]`. */
  meta?: ReactNode[] | undefined;
  /** The image column — an ImageSlot plus any overlay (an OfferSeal positions itself on it). */
  media?: ReactNode;
  /** Defaults to `default` on brand/ink/soft and `none` on alt. */
  pattern?: HeroPattern | undefined;
}

/** The top of a marketing page: headline (fluid display type, never overflows), actions, facts, media. */
export function HeroBanner({
  overline,
  badges,
  title,
  titleSize = "display-1",
  headingLevel = 1,
  body,
  actions,
  meta = [],
  media,
  tone = "brand",
  layout,
  pattern,
  className,
  ...props
}: HeroBannerProps) {
  const slots = heroBanner({ tone, layout });
  const density = pattern ?? DEFAULT_PATTERN[tone];
  return (
    <section data-surface={SURFACE[tone]} className={slots.root({ className })} {...props}>
      {density === "none" ? null : (
        <PatternField
          aria-hidden
          tone={SURFACE[tone]}
          tile={86}
          density={density}
          className={slots.pattern()}
        />
      )}
      <div className={slots.inner()}>
        <div className={slots.copy()}>
          {badges ? <div className={slots.badges()}>{badges}</div> : null}
          {overline ? (
            <Text variant="overline" tone="brand">
              {overline}
            </Text>
          ) : null}
          <Text as={headingTag(headingLevel)} variant={titleSize} isFluid isBalanced>
            {title}
          </Text>
          {body ? (
            <Text as="div" variant="body-lg" tone="muted" measure="narrow">
              {body}
            </Text>
          ) : null}
          {actions ? <div className={slots.actions()}>{actions}</div> : null}
          {meta.length > 0 ? (
            <ul className={slots.meta()}>
              {meta.map((fact, index) => (
                <li key={index} className={slots.metaItem()}>
                  {index > 0 ? <SymbolMark className={slots.metaMark()} /> : null}
                  <Text as="span" variant="body-sm" tone="muted">
                    {fact}
                  </Text>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {media ? <div className={slots.media()}>{media}</div> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- hero-banner 2>&1 | tail -8`
Expected: PASS (15 tests).

- [ ] **Step 6: Stories (card parity with `HeroBanner.card.html` + the handoff heroes)**

`packages/ui/src/organisms/hero-banner/hero-banner.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ArrowRight,
  CirclePause,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  Utensils,
} from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { Icon } from "../../atoms/icon/icon";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { Text } from "../../atoms/text/text";
import { OfferSeal } from "../../molecules/offer-seal/offer-seal";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { HeroBanner } from "./hero-banner";

/**
 * A blank bitmap standing in for a photograph, so the scrim over it shows in review. A fixture,
 * not a design decision — no photography exists yet, which is what ImageSlot's placeholder is for.
 */
const BLANK_PHOTOGRAPH =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5'%3E%3Crect width='4' height='5' fill='white'/%3E%3C/svg%3E";

const VEG_BADGE = (
  <Badge tone="success">
    <DietMark size="sm" />
    100% Pure Veg
  </Badge>
);

const meta = {
  title: "Organisms/HeroBanner",
  component: HeroBanner,
  args: {
    overline: "India’s First Desi Urban Café",
    title: "Desi at heart. Urban by nature.",
    body: "Pure veg lunch and dinner from our restaurant kitchen in MKM Market, Sector 57.",
    meta: ["Est. 2025", "Sector 57, Gurgaon", "Open till 11:30pm"],
    actions: (
      <>
        <Button asChild size="lg" icon={ShoppingBag}>
          <a href={BRAND.orderOnlineHref}>Order Now</a>
        </Button>
        <Button asChild variant="secondary" size="lg" iconAfter={ArrowRight}>
          <a href="#menu">See Full Menu</a>
        </Button>
      </>
    ),
    media: (
      <ImageSlot ratio="4:5" radius="xl" label="Hero food photography 4:5" className="shadow-4" />
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The top of any marketing page. The headline is fluid display type, so it never overflows; `titleSize="display-2"` for long ones. Tones brand/ink/soft flood the field with the diamond; `alt` is the handoff\'s pink-50 tint with no pattern. Buttons inside take no colour props — the tone sets the surface. `media` holds an ImageSlot and any overlay (an OfferSeal positions itself on the media column).',
      },
    },
  },
} satisfies Meta<typeof HeroBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `tone="brand"` (default), split. */
export const BrandSplit: Story = { args: { tone: "brand" } };

/** Card row: `tone="soft"` + `layout="center"`. */
export const SoftCentred: Story = {
  args: {
    tone: "soft",
    layout: "center",
    overline: "Homely Meals",
    title: "Home-style food, delivered every day.",
    body: "One dal, one sabji, rice, roti and salad in every box.",
    meta: [],
    media: undefined,
    actions: (
      <Button asChild size="lg">
        <a href="#plans">See plans</a>
      </Button>
    ),
  },
};

/** The ink tone named on the card. */
export const InkSplit: Story = { args: { tone: "ink" } };

/** Handoff Home — pink-50 split hero with the launch OfferSeal on the photo. */
export const HandoffHome: Story = {
  args: {
    tone: "alt",
    overline: undefined,
    badges: (
      <>
        <Badge tone="brand">Homely Meals by Pink Paprikaa</Badge>
        {VEG_BADGE}
      </>
    ),
    title: "Pure veg homely meals, delivered every day.",
    body: (
      <>
        <span className="block font-display text-h2-fluid font-black text-text-brand">
          ₹130 a meal. Try 5 meals for ₹650.
        </span>
        <span className="mt-3 flex items-center gap-2 text-body-sm">
          <Icon icon={Store} size="sm" />
          From the Pink Paprikaa restaurant kitchen, MKM Market, Sector 57
        </span>
      </>
    ),
    actions: (
      <>
        <Button asChild size="lg" iconAfter={ArrowRight}>
          <a href="#trial">Start a trial, ₹650</a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="#plans">See plans</a>
        </Button>
      </>
    ),
    meta: [
      <span key="delivery" className="inline-flex items-center gap-1.5">
        <Icon icon={Truck} size="sm" />
        Free delivery within 3 km
      </span>,
      <span key="pause" className="inline-flex items-center gap-1.5">
        <Icon icon={CirclePause} size="sm" />
        Pause any day
      </span>,
      <span key="menu" className="inline-flex items-center gap-1.5">
        <Icon icon={RefreshCw} size="sm" />
        New menu daily
      </span>,
    ],
    media: (
      <>
        <ImageSlot
          ratio="4:3"
          radius="xl"
          label="PHOTO: Homely Meals box — dal, rice, sabji, tawa roti, salad, raita and chutney"
        />
        <OfferSeal
          value="₹130"
          label="Launch"
          size="md"
          tone="brand"
          corner="top-right"
          bleed="none"
        />
      </>
    ),
  },
};

/** Handoff Catering — brand flood with the diamond and a display-2 headline. */
export const HandoffCatering: Story = {
  args: {
    tone: "brand",
    titleSize: "display-2",
    overline: undefined,
    badges: (
      <>
        <Badge tone="ink">Pink Paprikaa Catering</Badge>
        {VEG_BADGE}
      </>
    ),
    title: "Feeding thirty people? It has to be right the first time.",
    body: (
      <>
        <span className="block">
          We cook it in our own restaurant kitchen in Sector 57 — the same tandoor, the same cooks,
          the same food our dine-in guests eat every day. Tell us the date and headcount. We take it
          from there.
        </span>
        <span className="mt-4 block font-display text-h2-fluid font-black text-text-heading">
          From ₹99 per person.
        </span>
      </>
    ),
    actions: (
      <>
        <Button asChild variant="inverse" size="lg" iconAfter={ArrowRight}>
          <a href="#dawat-builder">Build your Dawat</a>
        </Button>
        <Button asChild variant="secondary" size="lg" icon={Utensils}>
          <a href={BRAND.whatsappHref}>Taste it first</a>
        </Button>
      </>
    ),
    meta: [
      "One kitchen, no shared surfaces, pure vegetarian — ever. Jain and satvik menus on request.",
    ],
    media: (
      <ImageSlot
        ratio="4:3"
        radius="xl"
        tone="strong"
        label="PHOTO: Real Dawat spread from our kitchen — tandoori roti, paneer, dal"
      />
    ),
  },
};

/** Handoff Office & PG Lunch — pink-50 split hero. */
export const HandoffOffice: Story = {
  args: {
    tone: "alt",
    overline: undefined,
    badges: (
      <>
        <Badge tone="brand">Office &amp; PG Lunch</Badge>
        {VEG_BADGE}
      </>
    ),
    title: "Team lunch from ₹99 a meal.",
    body: "For offices and PGs with 20+ people at one address. Fixed slot, one GST invoice a month, free tasting first.",
    actions: (
      <>
        <Button asChild size="lg" icon={MessageCircle}>
          <a href={BRAND.whatsappHref}>Get a free office tasting</a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="#quote">See my cost</a>
        </Button>
      </>
    ),
    meta: [],
    media: (
      <ImageSlot
        ratio="4:3"
        radius="xl"
        label="PHOTO: Team eating Pink Paprikaa boxes at an office pantry"
      />
    ),
  },
};

/** The title alone — everything else on the hero is optional. */
export const HeadlineOnly: Story = {
  args: { overline: undefined, body: undefined, meta: [], actions: undefined, media: undefined },
};

/**
 * A real photograph with a line printed on it: the media slot layers the `scrim-bottom` gradient
 * under the caption so it stays legible whatever the picture does. Only over a photograph — over
 * a placeholder the scrim would dim the crop note.
 */
export const WithPhotograph: Story = {
  args: {
    media: (
      <div className="relative">
        <ImageSlot
          src={BLANK_PHOTOGRAPH}
          alt=""
          width={4}
          height={5}
          ratio="4:5"
          radius="xl"
          className="shadow-4"
        />
        <div aria-hidden className="absolute inset-0 rounded-xl scrim-bottom" />
        <Text
          as="p"
          variant="body"
          weight="bold"
          tone="inverse"
          className="absolute right-6 bottom-6 left-6"
        >
          From our restaurant kitchen, MKM Market, Sector 57
        </Text>
      </div>
    ),
  },
};

export const Mobile: Story = { ...HandoffHome, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffHome, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffHome, globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { HeroBanner, type HeroBannerProps } from "./organisms/hero-banner/hero-banner";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/hero-banner packages/design-tokens/tokens/component/hero-banner.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/hero-banner.json packages/ui/src/organisms/hero-banner packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): HeroBanner organism

Brand, ink and soft floods over the diamond plus the handoff's plain pink-50
tint; split or centred; fluid display-1 or display-2 headline at any heading
level; a badge row, diamond-separated facts and a positioned media column
for the photo and its OfferSeal.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

