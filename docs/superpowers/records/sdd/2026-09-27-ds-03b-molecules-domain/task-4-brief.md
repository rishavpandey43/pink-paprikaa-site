### Task 4: ReviewCard

**Files:**

- Create: `packages/ui/src/molecules/review-card/review-card.tsx`, `review-card.test.tsx`, `review-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/review-card/review-card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                            | Ruling  | Where, or the spec clause                                                                                    |
| ------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| Quote inside the component's own curly quotes, in a `<blockquote>`  | ALREADY | test "quotes the guest in curly quotes…"                                                                     |
| Attribution: name and meta                                          | ALREADY | same test (`figcaption`)                                                                                     |
| Initials stand in for a missing photo                               | ALREADY | test "drops the avatar when asked…" ("VK")                                                                   |
| No meta line and no score when neither is given                     | ADD     | test "omits the score and the meta line when neither is given"                                               |
| Score named for assistive tech                                      | ALREADY | test "shows the score…" ("5 out of 5")                                                                       |
| `default` on the white card                                         | ADD     | test "sits on a white light-island card by default"                                                          |
| `brand` on the light-pink feature card, name/quote in the pink ramp | ALREADY | test "uses the light-pink feature treatment…" (the soft surface remaps heading → pink-800)                   |
| `mark="symbol"` drops the diamond                                   | ALREADY | Rating owns the glyph (Plan 2b Rating test); story `SymbolMark`                                              |
| Old class asserts `bg-surface-card`, `rounded-4`                    | DROP    | D4 / D5 — surfaces are asserted as `data-surface`                                                            |
| `Rating hasValueLabel={false}`                                      | DROP    | D2 — the design-system `ReviewCard.jsx` shows the value                                                      |
| Caller `className` replaces the card radius                         | ADD     | test "lets a caller className replace the card radius"                                                       |
| axe on both variants and both marks                                 | ADD     | last test renders a `brand` + `symbol` card too                                                              |
| Stories `Default`, `Variants`, `SymbolMark`, `LongQuote`            | ALREADY | `Playground` / `Default` (Raj's long review), `Brand`, `SymbolMark`                                          |
| Story `WithoutScore`                                                | ADD     | story `WithoutScore`                                                                                         |
| Story `PartialScore` (4.5 on an invented review)                    | DROP    | spec §10.1 — only the four real Google reviews, never fabricated; Rating's own stories show halves (Plan 2b) |
| Story `Wall` (three across)                                         | ALREADY | TestimonialWall organism (Plan 4) owns the wall                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Card` (`asChild`; `default` → `data-surface="light"`, `feature` → `data-surface="soft"`), `Rating` (`variant="diamond" | "symbol"`), `Avatar` (`size="sm"`), `Badge` (`tone="success"`), `Link` (`size="sm"`, `isExternal`).
- Produces: `ReviewCard`, `type ReviewCardProps` (contract §6 + deviation 10). Documented defaults: `variant = "default"`, `mark = "diamond"`, `verifiedLabel = "Verified on Google"`, `hasAvatar = true`. The component adds the curly quotes.

- [ ] **Step 1: Tokens** — none new.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/review-card/review-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ReviewCard } from "./review-card";

const REVIEW = {
  name: "Vikas Kumar",
  meta: "Restaurant · Google review",
  quote: "Very nice and economical food or very tasty food as home",
} as const;

describe("ReviewCard", () => {
  it("quotes the guest in curly quotes inside a blockquote, attributed in the caption", () => {
    const { container } = render(<ReviewCard {...REVIEW} />);
    expect(container.querySelector("blockquote")).toHaveTextContent(`“${REVIEW.quote}”`);
    expect(container.querySelector("figcaption")).toHaveTextContent(REVIEW.name);
    expect(container.querySelector("figcaption")).toHaveTextContent(REVIEW.meta);
  });

  it("shows the score when given one", () => {
    render(<ReviewCard {...REVIEW} rating={5} />);
    expect(screen.getByRole("img", { name: "5 out of 5" })).toBeInTheDocument();
  });

  it("sits on a white light-island card by default", () => {
    const { container } = render(<ReviewCard {...REVIEW} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
  });

  it("omits the score and the meta line when neither is given", () => {
    const { container } = render(<ReviewCard name={REVIEW.name} quote={REVIEW.quote} />);
    expect(screen.queryByRole("img", { name: /out of 5/ })).not.toBeInTheDocument();
    expect(container.querySelector("figcaption")).not.toHaveTextContent(REVIEW.meta);
  });

  it("lets a caller className replace the card radius", () => {
    const { container } = render(<ReviewCard {...REVIEW} className="rounded-md" />);
    expect(container.firstElementChild).toHaveClass("rounded-md");
    expect(container.firstElementChild).not.toHaveClass("rounded-lg");
  });

  it("uses the light-pink feature treatment for the brand variant", () => {
    const { container } = render(<ReviewCard {...REVIEW} variant="brand" />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "soft");
  });

  it("marks a verified review with a chip whose words the page can change", () => {
    const { rerender } = render(<ReviewCard {...REVIEW} isVerified />);
    expect(screen.getByText("Verified on Google")).toBeInTheDocument();
    rerender(<ReviewCard {...REVIEW} isVerified verifiedLabel="Verified guest" />);
    expect(screen.getByText("Verified guest")).toBeInTheDocument();
  });

  it("links to the review at its source, in a new tab", () => {
    render(
      <ReviewCard
        {...REVIEW}
        source={{ label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" }}
      />
    );
    expect(screen.getByRole("link", { name: /View on Google/ })).toHaveAttribute(
      "target",
      "_blank"
    );
  });

  it("drops the avatar when asked (the handoff's Google reviews)", () => {
    const { container, rerender } = render(<ReviewCard {...REVIEW} />);
    expect(container.querySelector("figcaption")).toHaveTextContent("VK");
    rerender(<ReviewCard {...REVIEW} hasAvatar={false} />);
    expect(container.querySelector("figcaption")).not.toHaveTextContent("VK");
  });

  it("has no accessibility violations with every part shown, on both treatments", async () => {
    const { container } = render(
      <>
        <ReviewCard
          {...REVIEW}
          rating={5}
          isVerified
          source={{ label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" }}
        />
        <ReviewCard {...REVIEW} rating={4} variant="brand" mark="symbol" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

(Avatar renders two initials, "VK" for "Vikas Kumar" — Task 0 fact g.)

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- review-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./review-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/review-card/review-card.tsx`:

```tsx
import type { ComponentProps } from "react";

import { BadgeCheck } from "lucide-react";

import { Avatar } from "../../atoms/avatar/avatar";
import { Badge } from "../../atoms/badge/badge";
import { Card } from "../../atoms/card/card";
import { Link } from "../../atoms/link/link";
import { Rating } from "../../atoms/rating/rating";
import { componentVariants } from "../../lib/component-variants";

const reviewCard = componentVariants({
  slots: {
    root: "flex flex-col gap-3.5",
    header: "flex flex-wrap items-center justify-between gap-3",
    quote: "m-0",
    quoteText: "m-0 max-w-text-measure-narrow text-body",
    footer: "flex items-center gap-2.5",
    person: "grid min-w-0 flex-1",
    name: "text-body-sm font-medium text-text-heading",
    meta: "text-caption",
    source: "shrink-0",
  },
  variants: {
    variant: {
      default: { quoteText: "text-text-body", meta: "text-text-subtle" },
      // Feature card (soft surface): heading → pink-800, brand → pink-700.
      brand: { quoteText: "text-text-heading", meta: "text-text-brand" },
    },
  },
});

export interface ReviewCardProps extends ComponentProps<"figure"> {
  name: string;
  /** Outlet and date, or the source: "Restaurant · Google review". */
  meta?: string | undefined;
  /** The review text without quote marks — the component adds them. Real guest copy only. */
  quote: string;
  rating?: number | undefined;
  /** Avatar image URL; without it the Avatar shows initials. */
  avatar?: string | undefined;
  variant?: "default" | "brand" | undefined;
  /** Score glyph: brand diamonds carrying the mark, or the bare mark. */
  mark?: "diamond" | "symbol" | undefined;
  isVerified?: boolean | undefined;
  /** Words on the verified chip. Default "Verified on Google". */
  verifiedLabel?: string | undefined;
  /** Link to the review where it was published. */
  source?: { label: string; href: string } | undefined;
  hasAvatar?: boolean | undefined;
}

/** A real guest review. Never invented copy: the fixtures are the verified Google reviews. */
export function ReviewCard({
  name,
  meta,
  quote,
  rating,
  avatar,
  variant = "default",
  mark = "diamond",
  isVerified = false,
  verifiedLabel = "Verified on Google",
  source,
  hasAvatar = true,
  className,
  ...props
}: ReviewCardProps) {
  const styles = reviewCard({ variant });
  const hasHeader = rating !== undefined || isVerified;

  return (
    <Card
      asChild
      variant={variant === "brand" ? "feature" : "default"}
      padding="md"
      className={styles.root({ className })}
    >
      <figure {...props}>
        {hasHeader ? (
          <div className={styles.header()}>
            {rating === undefined ? null : <Rating value={rating} variant={mark} />}
            {isVerified ? (
              <Badge tone="success" icon={BadgeCheck}>
                {verifiedLabel}
              </Badge>
            ) : null}
          </div>
        ) : null}
        <blockquote className={styles.quote()}>
          <p className={styles.quoteText()}>{`“${quote}”`}</p>
        </blockquote>
        <figcaption className={styles.footer()}>
          {hasAvatar ? <Avatar name={name} src={avatar} size="sm" aria-hidden /> : null}
          <span className={styles.person()}>
            <span className={styles.name()}>{name}</span>
            {meta ? <span className={styles.meta()}>{meta}</span> : null}
          </span>
          {source ? (
            <Link href={source.href} size="sm" isExternal className={styles.source()}>
              {source.label}
            </Link>
          ) : null}
        </figcaption>
      </figure>
    </Card>
  );
}
```

(The Avatar is `aria-hidden`: the name is written beside it, so announcing the initials too would say it twice.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- review-card 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories — every `ReviewCard.card.html` row, bound to the four real Google reviews (`rates.js` → `google.reviews`; the card's invented names are replaced, spec §10.1), plus the handoff GoogleReviews treatment**

`packages/ui/src/molecules/review-card/review-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ReviewCard } from "./review-card";

/** The four verified Google reviews from the handoff (`rates.js`), verbatim. */
const GOOGLE_REVIEWS = [
  {
    name: "Raj Chrome",
    meta: "Restaurant · Google review",
    rating: 5,
    quote:
      "I ordered Mahararaja Thali, steamed Momos and other few extras for the first time. The experience and taste was great😋 A1. Restaurant customer support over phone were well spoken. I will recommend this to my friends. Looking forward to order more […]. Packing was great👌Hatts of Team",
    href: "https://maps.app.goo.gl/uGhWvzmZW7To5etbA",
  },
  {
    name: "Vikas Kumar",
    meta: "Restaurant · Google review",
    rating: 5,
    quote: "Very nice and economical food or very tasty food as home",
    href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA",
  },
  {
    name: "Abhishek Aggarwal",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Good place for indian main course at reasonable price in gurgaon sector 57",
    href: "https://maps.app.goo.gl/GB38hi9T2G2UfQdG9",
  },
  {
    name: "Shrideep Chatterjee",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Had Honey chili potato and it was good 👍",
    href: "https://maps.app.goo.gl/s1ghZv4qg3f773Gn8",
  },
] as const;

const [raj, vikas, abhishek, shrideep] = GOOGLE_REVIEWS;

const meta = {
  title: "Molecules/ReviewCard",
  component: ReviewCard,
  args: { name: vikas.name, meta: vikas.meta, quote: vikas.quote, rating: vikas.rating },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Guest quotes on the website and in social proof bands. The score renders as brand diamonds carrying the mark; `mark="symbol"` drops the diamond for the bare mark. Never invent reviews — these must be real guest copy (the fixtures are the four verified Google reviews). `variant="brand"` is the light-pink treatment in a testimonial wall. The handoff\'s Google cards add `isVerified`, `source` and `hasAvatar={false}`.',
      },
    },
  },
} satisfies Meta<typeof ReviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "default": two cards side by side. */
export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3.5">
      <ReviewCard name={raj.name} meta={raj.meta} quote={raj.quote} rating={raj.rating} />
      <ReviewCard name={vikas.name} meta={vikas.meta} quote={vikas.quote} rating={vikas.rating} />
    </div>
  ),
};

/** Card row `variant="brand"`. */
export const Brand: Story = {
  args: {
    variant: "brand",
    name: abhishek.name,
    meta: abhishek.meta,
    quote: abhishek.quote,
    rating: abhishek.rating,
  },
};

/** Card row "symbol": the bare mark instead of diamonds. */
export const SymbolMark: Story = {
  args: {
    mark: "symbol",
    name: shrideep.name,
    meta: shrideep.meta,
    quote: shrideep.quote,
    rating: shrideep.rating,
  },
};

/** The handoff GoogleReviews card: verified chip, source link, no avatar, bare mark. */
export const GoogleReview: Story = {
  args: {
    mark: "symbol",
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: vikas.href },
  },
};

/** No `rating`: the quote carries the card on its own. */
export const WithoutScore: Story = { args: { rating: undefined } };
```

- [ ] **Step 7: Export**

```ts
export { ReviewCard, type ReviewCardProps } from "./molecules/review-card/review-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/review-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/review-card packages/ui/src/index.ts
git commit -m "feat(ui): ReviewCard molecule

A real guest review as figure/blockquote/figcaption with score, avatar,
the brand (feature) treatment and the handoff's verified chip and source
link. Stories bind the four verified Google reviews verbatim.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

