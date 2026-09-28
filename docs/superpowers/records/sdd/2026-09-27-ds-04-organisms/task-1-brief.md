### Task 1: CtaBand (and the organism story fixtures)

**Dev reference:** `git show dev:packages/ui/src/organisms/cta-band/cta-band.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / clause                                                                  |
| ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| Overline, heading and body render                                      | ALREADY | test "renders the overline, a level-2 title…"                                   |
| `headingLevel`                                                         | ALREADY | test "takes its heading level from headingLevel"                                |
| The action stays clickable                                             | ADD     | test "keeps the action clickable"                                               |
| Nothing extra without an action                                        | ALREADY | test "renders nothing but the title…" (whole text content)                      |
| Each tone floods its `bg-surface-*` ground                             | ADD     | the tone `it.each` asserts the background class beside `data-surface`           |
| Split: the action sits beside the copy (`shrink-0`)                    | ADD     | test "sits the action beside the copy with align=split"                         |
| Centre: the action stacks under the copy (`justify-center`)            | ADD     | the centre test asserts the action wrapper                                      |
| Type inverts on ink/brand, stays dark on soft (heading colour classes) | DROP    | D5 — text follows `data-surface`, asserted per tone                             |
| Merges a caller `className`                                            | ADD     | test "merges a caller className over its own"                                   |
| axe                                                                    | ALREADY | test "has no accessibility violations"                                          |
| Heading always the fluid `h2` step                                     | ALREADY | `variant="h2" isFluid`                                                          |
| `on="brand"` on the action's Button                                    | DROP    | D5                                                                              |
| "One action, never two"                                                | DROP    | handoff bands carry two actions (D2; `HandoffOfficeStrip`, `HandoffTasteFirst`) |
| Exported `CtaBandTone`                                                 | ALREADY | `CtaBandProps["tone"]`                                                          |
| Stories Default · Split · Centred · Tones · Narrow                     | ALREADY | Playground · InkSplit · BrandCentred · InkSplit/BrandCentred/SoftSplit · Mobile |
| Story HeadingOnly                                                      | ADD     | `HeadingOnly`                                                                   |
| Story WithoutAction                                                    | ADD     | `WithoutAction`                                                                 |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/cta-band.json`
- Create: `packages/ui/src/organisms/story-fixtures.ts`
- Create: `packages/ui/src/organisms/cta-band/cta-band.tsx`, `cta-band.test.tsx`, `cta-band.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `PatternField`, `Text`, `Button` (stories), `componentVariants`, `headingTag`/`HeadingLevel`, `ReviewCardProps` (fixtures).
- Produces: `CtaBand`, `CtaBandProps`; `story-fixtures.ts` exports `BRAND`, `GOOGLE_REVIEWS`, `VIEWPORT_360`, `VIEWPORT_768`, `VIEWPORT_1024`, `VIEWPORT_1280` (stories only, not exported from the package).

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/cta-band.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "cta-band-y": {
      "$value": "clamp(48px, 6vw, 72px)",
      "$description": "CtaBand vertical rhythm (design system CtaBand)."
    },
    "cta-band-copy": {
      "$value": "36ch",
      "$description": "Copy measure beside the action in the split layout."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, append to `SPACING`:

```ts
  "cta-band-y",
  "cta-band-copy",
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "cta-band" packages/design-tokens/dist/theme.css`
Expected: `--spacing-cta-band-y: clamp(48px, 6vw, 72px);` and `--spacing-cta-band-copy: 36ch;`.

- [ ] **Step 2: The story fixtures**

`packages/ui/src/organisms/story-fixtures.ts`:

```ts
import type { ReviewCardProps } from "../molecules/review-card/review-card";

/**
 * Real copy for the organism stories: brand facts from
 * `zip-files/Pink Paprikaa Design System/brand.js` (spec C3/C6 applied) and handoff copy from
 * `zip-files/pink-paprikaa-handoff/design/rates.js`.
 *
 * Stories only. No component reads this file — the system carries no content (spec D9); the web
 * app binds the same facts from `@pink-paprikaa-web/content`. Internal links are `#` anchors, so
 * clicking one in a story never navigates the preview away.
 */
export const BRAND = {
  copyright: "© 2026 Paprikaa Culinary Ventures Private Limited",
  fssai: "FSSAI Lic. 10825005001702",
  gstin: "GSTIN 06AAPCP9130L1ZW",
  phoneDisplay: "+91 90907 04001",
  phoneHref: "tel:+919090704001",
  whatsappHref: "https://wa.me/919090704001",
  email: "business@pinkpaprikaa.com",
  emailHref: "mailto:business@pinkpaprikaa.com",
  website: "pinkpaprikaa.com",
  address: "Booth No. 67P, HSVP Market (MKM Market), Sector 57, Gurgaon 122003",
  hours: "8am – 11:30pm, every day",
  payments: "UPI, cards, Pluxee (Sodexo)",
  orderOnlineHref: "https://order.pinkpaprikaa.com",
  directionsHref: "https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon",
  instagramHandle: "@pinkpaprikaa",
  instagramHref: "https://instagram.com/pinkpaprikaa",
  youtubeHref: "https://youtube.com/@pinkpaprikaa",
  linkedinHref: "https://linkedin.com/company/pinkpaprikaa",
} as const;

/**
 * The four verified Google reviews (rates.js → google.reviews). Quotes are verbatim, the guests'
 * own spelling included — a review is never edited. One elision ("[…]") removes a guest's one-a
 * spelling of the brand name (ruling R17, the same text as Plan 5's `fixtures.ts`).
 */
export const GOOGLE_REVIEWS: ReviewCardProps[] = [
  {
    name: "Raj Chrome",
    meta: "Restaurant · Google review",
    rating: 5,
    quote:
      "I ordered Mahararaja Thali, steamed Momos and other few extras for the first time. The experience and taste was great😋 A1. Restaurant customer support over phone were well spoken. I will recommend this to my friends. Looking forward to order more […]. Packing was great👌Hatts of Team",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/uGhWvzmZW7To5etbA" },
  },
  {
    name: "Vikas Kumar",
    meta: "Restaurant · Google review",
    rating: 5,
    quote: "Very nice and economical food or very tasty food as home",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" },
  },
  {
    name: "Abhishek Aggarwal",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Good place for indian main course at reasonable price in gurgaon sector 57",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/GB38hi9T2G2UfQdG9" },
  },
  {
    name: "Shrideep Chatterjee",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Had Honey chili potato and it was good 👍",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/s1ghZv4qg3f773Gn8" },
  },
];

/** Storybook viewport globals for the review widths (keys from `apps/storybook/.storybook/preview.tsx`). */
export const VIEWPORT_360 = { viewport: { value: "floor360", isRotated: false } };
export const VIEWPORT_768 = { viewport: { value: "md", isRotated: false } };
export const VIEWPORT_1024 = { viewport: { value: "lg", isRotated: false } };
export const VIEWPORT_1280 = { viewport: { value: "xl", isRotated: false } };
```

- [ ] **Step 3: Write the failing test**

`packages/ui/src/organisms/cta-band/cta-band.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CtaBand } from "./cta-band";

const COPY = {
  overline: "Taste it first",
  title: "If you order, the tasting is free.",
  body: "Take one Dawat as a trial at the normal per-head rate.",
};

const patternLayer = (container: HTMLElement) =>
  container.querySelector('section > [aria-hidden="true"]');

describe("CtaBand", () => {
  it("renders the overline, a level-2 title, the body and the action", () => {
    render(<CtaBand {...COPY} action={<a href="#trial">Book a trial Dawat</a>} />);
    expect(screen.getByRole("heading", { level: 2, name: COPY.title })).toBeInTheDocument();
    expect(screen.getByText(COPY.overline)).toBeInTheDocument();
    expect(screen.getByText(COPY.body)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a trial Dawat" })).toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<CtaBand title={COPY.title} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: COPY.title })).toBeInTheDocument();
  });

  it("renders nothing but the title when nothing else is given — no default copy", () => {
    const { container } = render(<CtaBand title={COPY.title} />);
    expect(container.textContent).toBe(COPY.title);
  });

  it("keeps the action clickable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <CtaBand
        title={COPY.title}
        action={
          <button type="button" onClick={onClick}>
            Book a trial Dawat
          </button>
        }
      />
    );
    await user.click(screen.getByRole("button", { name: "Book a trial Dawat" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each([
    ["ink", "bg-surface-inverse"],
    ["brand", "bg-surface-brand"],
    ["soft", "bg-surface-brand-soft"],
  ] as const)("paints the %s field and sets its surface", (tone, background) => {
    const { container } = render(<CtaBand title={COPY.title} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", tone);
    expect(container.firstElementChild).toHaveClass(background);
  });

  it("carries the tiled diamond by default and drops it with pattern=none", () => {
    const { container, rerender } = render(<CtaBand title={COPY.title} />);
    expect(patternLayer(container)).toBeInTheDocument();
    rerender(<CtaBand title={COPY.title} pattern="none" />);
    expect(patternLayer(container)).not.toBeInTheDocument();
  });

  it("sits the action beside the copy with align=split (the default)", () => {
    const { container } = render(
      <CtaBand title={COPY.title} pattern="none" action={<a href="#trial">Book a trial Dawat</a>} />
    );
    expect(container.querySelector("section > div")).toHaveClass("justify-between");
    expect(screen.getByRole("link", { name: "Book a trial Dawat" }).parentElement).toHaveClass(
      "shrink-0"
    );
  });

  it("stacks and centres copy and action with align=center", () => {
    const { container } = render(
      <CtaBand
        title={COPY.title}
        align="center"
        pattern="none"
        action={<a href="#trial">Book a trial Dawat</a>}
      />
    );
    expect(container.querySelector("section > div")).toHaveClass("flex-col", "text-center");
    expect(screen.getByRole("link", { name: "Book a trial Dawat" }).parentElement).toHaveClass(
      "justify-center"
    );
  });

  it("merges a caller className over its own", () => {
    const { container } = render(<CtaBand title={COPY.title} className="bg-surface-page-alt" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page-alt");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-inverse");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CtaBand {...COPY} tone="brand" action={<a href="#trial">Book a trial Dawat</a>} />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- cta-band 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./cta-band"`.

- [ ] **Step 5: Implement**

`packages/ui/src/organisms/cta-band/cta-band.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

const ctaBand = componentVariants({
  slots: {
    root: "relative",
    pattern: "absolute inset-0",
    inner: "py-cta-band-y relative container-page flex flex-wrap gap-8",
    copy: "flex min-w-0 flex-col gap-2.5",
    action: "flex shrink-0 flex-wrap items-center gap-2.5",
  },
  variants: {
    tone: {
      ink: { root: "bg-surface-inverse" },
      brand: { root: "bg-surface-brand" },
      soft: { root: "bg-surface-brand-soft" },
    },
    align: {
      split: { inner: "items-end justify-between", copy: "max-w-cta-band-copy" },
      center: {
        inner: "flex-col items-center text-center",
        copy: "max-w-text-measure-narrow items-center",
        action: "justify-center",
      },
    },
  },
  defaultVariants: { tone: "ink", align: "split" },
});

export interface CtaBandProps
  extends
    Omit<ComponentProps<"section">, "title">,
    Pick<VariantProps<typeof ctaBand>, "tone" | "align"> {
  overline?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  /** One or two Buttons — `<Button asChild><a …/></Button>`. */
  action?: ReactNode;
  /** The tiled diamond behind the band; `faint` is the handoff's 4% ink sections (spec C7). */
  pattern?: "none" | "default" | "faint" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The band that closes a page — one per page, never two. Paints its own field (ink, brand or
 * soft) and sets that surface, so the heading, body and buttons inside need no colour props.
 */
export function CtaBand({
  overline,
  title,
  body,
  action,
  tone = "ink",
  align,
  pattern = "default",
  headingLevel = 2,
  className,
  ...props
}: CtaBandProps) {
  const slots = ctaBand({ tone, align });
  return (
    <section data-surface={tone} className={slots.root({ className })} {...props}>
      {pattern === "none" ? null : (
        <PatternField
          aria-hidden
          tone={tone}
          tile={72}
          density={pattern}
          className={slots.pattern()}
        />
      )}
      <div className={slots.inner()}>
        <div className={slots.copy()}>
          {overline ? (
            <Text variant="overline" tone="brand">
              {overline}
            </Text>
          ) : null}
          <Text as={headingTag(headingLevel)} variant="h2" isFluid isBalanced>
            {title}
          </Text>
          {body ? (
            <Text variant="body-lg" tone="muted">
              {body}
            </Text>
          ) : null}
        </div>
        {action ? <div className={slots.action()}>{action}</div> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- cta-band 2>&1 | tail -8`
Expected: PASS (12 tests).

- [ ] **Step 7: Stories (card parity with `components/organisms/CtaBand.card.html` + handoff bands)**

`packages/ui/src/organisms/cta-band/cta-band.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, MapPin, MessageCircle } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { CtaBand } from "./cta-band";

const meta = {
  title: "Organisms/CtaBand",
  component: CtaBand,
  args: {
    overline: "Taste it first",
    title: "If you order, the tasting is free.",
    body: "Take one Dawat as a trial at the normal per-head rate. You only pay if you decide not to go ahead.",
    action: (
      <Button asChild size="lg" icon={MessageCircle}>
        <a href={BRAND.whatsappHref}>Book a trial Dawat</a>
      </Button>
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The band that closes a page — franchise, newsletter, a free tasting. One per page, never two. Copy left and action right (`align="split"`) or stacked and centred. Carries the tiled diamond (`pattern`; `faint` is the handoff\'s 4% ink band). The tone sets the surface, so buttons inside take no colour props.',
      },
    },
  },
} satisfies Meta<typeof CtaBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `tone="ink"` split. */
export const InkSplit: Story = {
  args: {
    tone: "ink",
    align: "split",
    overline: "Catering",
    title: "Feeding thirty people? It has to be right the first time.",
    body: "Tell us the date and headcount. We take it from there.",
    action: (
      <Button asChild size="lg" iconAfter={ArrowRight}>
        <a href="#dawat-builder">Build your Dawat</a>
      </Button>
    ),
  },
};

/** Card row: `tone="brand"` centred. */
export const BrandCentred: Story = {
  args: {
    tone: "brand",
    align: "center",
    overline: "Office & PG lunch",
    title: "₹99 / ₹119 a meal for your team",
    body: undefined,
    action: (
      <Button asChild variant="inverse" size="lg" icon={MessageCircle}>
        <a href={BRAND.whatsappHref}>Get a free office tasting</a>
      </Button>
    ),
  },
};

/** Card row: `tone="soft"` split. */
export const SoftSplit: Story = {
  args: {
    tone: "soft",
    overline: "Homely Meals",
    title: "Home-style food, delivered every day.",
    body: "Pure veg lunch and dinner from our restaurant kitchen in MKM Market, Sector 57.",
    action: (
      <Button asChild variant="secondary" size="lg">
        <a href="#plans">See plans</a>
      </Button>
    ),
  },
};

/** Handoff Home — the office strip: brand, split, two actions. */
export const HandoffOfficeStrip: Story = {
  args: {
    tone: "brand",
    overline: "Office & PG lunch",
    title: "₹99 / ₹119 a meal for your team",
    body: "20+ meals at one address · fixed slot · one GST invoice a month",
    action: (
      <>
        <Button asChild variant="inverse" size="lg" icon={MessageCircle}>
          <a href={BRAND.whatsappHref}>Get a free office tasting</a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="#office-lunch">Details</a>
        </Button>
      </>
    ),
  },
};

/** Handoff Catering — "Taste first": ink with the faint 4% diamond. */
export const HandoffTasteFirst: Story = {
  args: {
    tone: "ink",
    pattern: "faint",
    action: (
      <>
        <Button asChild size="lg" icon={MessageCircle}>
          <a href={BRAND.whatsappHref}>Book a trial Dawat</a>
        </Button>
        <Button asChild variant="secondary" size="lg" icon={MapPin}>
          <a href={BRAND.directionsHref}>Eat at the restaurant</a>
        </Button>
      </>
    ),
  },
};

export const WithoutPattern: Story = { args: { pattern: "none" } };

/** No overline and no body — the heading carries the band on its own. */
export const HeadingOnly: Story = { args: { overline: undefined, body: undefined } };

/** A band that only announces — no action. Rare, but the layout holds. */
export const WithoutAction: Story = { args: { action: undefined } };

export const Mobile: Story = { ...HandoffOfficeStrip, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffOfficeStrip, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffOfficeStrip, globals: VIEWPORT_1280 };
```

- [ ] **Step 8: Export**

In `packages/ui/src/index.ts`, add (keep the file's path order — organisms after molecules):

```ts
export { CtaBand, type CtaBandProps } from "./organisms/cta-band/cta-band";
```

- [ ] **Step 9: Format, gate, commit**

Run:

```bash
pnpm exec prettier --write packages/ui/src/organisms packages/design-tokens/tokens/component/cta-band.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook lists Organisms/CtaBand with 12 stories.

```bash
git add packages/design-tokens/tokens/component/cta-band.json packages/ui/src/organisms packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): CtaBand organism and the organism story fixtures

The page-closing band in ink, brand and soft, split or centred, over the
tiled diamond at the default or the handoff's faint density. Story fixtures
hold the real brand facts and the four verified Google reviews, so no
component ever needs a content default.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

