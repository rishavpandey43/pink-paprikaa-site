### Task 4: TestimonialWall

**Dev reference:** `git show dev:packages/ui/src/organisms/testimonial-wall/testimonial-wall.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                         | Ruling  | Where / clause                                                                                  |
| ------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| Heading and every review render                  | ALREADY | tests "heads the wall…", "lists one review card per review…"                                    |
| The component adds the quote marks               | ALREADY | ReviewCard's behaviour (Plan 3b, spec §9.2); this plan asserts the verbatim text                |
| `lede` under the heading                         | ADD     | contract delta 1 (R110); test "renders the lede under the heading"                              |
| `headingLevel`                                   | ALREADY | test "takes its heading level from headingLevel"                                                |
| Each score announced as an image                 | ADD     | test "announces each score as an image with its value"                                          |
| No score when a review carries none              | ADD     | test "omits the score for a review that carries none"                                           |
| Cards pale pink by default (`variant = "brand"`) | DROP    | D1 — the design system's `TestimonialWall.jsx` defaults `variant="default"`; `brand` is tested  |
| `mark="symbol"` forced on every card             | DROP    | D1 — the design system passes no `mark`; a review's own `mark` passes through `ReviewCardProps` |
| Auto-fit grid survives 360px                     | ALREADY | `autogrid` test                                                                                 |
| Merges a caller `className`                      | ADD     | test "merges a caller className"                                                                |
| axe                                              | ALREADY | test "has no accessibility violations"                                                          |
| `WallReview` type                                | ALREADY | `ReviewCardProps` (contract §7)                                                                 |
| Stories Default · DefaultCards · Narrow          | ALREADY | Default · BrandCards (the other variant) · Mobile                                               |
| Story SixReviews (invented guests)               | DROP    | spec §10.1 — real reviews only; four exist (`FourReviews`)                                      |
| Story WithLede                                   | ADD     | `WithLede` (contract delta 1)                                                                   |
| Story WithoutScores                              | ADD     | `WithoutScores`                                                                                 |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/ui/src/organisms/testimonial-wall/testimonial-wall.tsx`, `testimonial-wall.test.tsx`, `testimonial-wall.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `ReviewCard`/`ReviewCardProps`, `SectionHeader`, `componentVariants`, `HeadingLevel`; the `autogrid` utility (Plan 1 — 260px tracks; the card's 280px minimum snaps to it, spec §15.2).
- Produces: `TestimonialWall`, `TestimonialWallProps`.

No component tokens: rhythm is `section-y`, width `container-page`, grid `autogrid`.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/organisms/testimonial-wall/testimonial-wall.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { GOOGLE_REVIEWS } from "../story-fixtures";
import { TestimonialWall } from "./testimonial-wall";

const REVIEWS = GOOGLE_REVIEWS.slice(1);

describe("TestimonialWall", () => {
  it("heads the wall with its overline and a level-2 title", () => {
    render(
      <TestimonialWall overline="Guests" title="What people actually say" reviews={REVIEWS} />
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "What people actually say" })
    ).toBeInTheDocument();
    expect(screen.getByText("Guests")).toBeInTheDocument();
  });

  it("renders the lede under the heading", () => {
    render(
      <TestimonialWall
        title="Reviews"
        lede="Verified Google reviews, in the guests' own words."
        reviews={REVIEWS}
      />
    );
    expect(
      screen.getByText("Verified Google reviews, in the guests' own words.")
    ).toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "Reviews" })).toBeInTheDocument();
  });

  it("lists one review card per review, quotes verbatim", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(REVIEWS.length);
    expect(screen.getAllByRole("figure")).toHaveLength(REVIEWS.length);
    expect(screen.getByText(/Had Honey chili potato and it was good/)).toBeInTheDocument();
  });

  it("dresses every card in the wall's variant", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} variant="brand" />);
    // ReviewCard's brand variant is Card's pale-pink `feature` surface.
    for (const card of screen.getAllByRole("figure")) {
      expect(card).toHaveAttribute("data-surface", "soft");
    }
  });

  it("lays the cards on the auto-fitting card grid", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} />);
    expect(screen.getByRole("list")).toHaveClass("autogrid");
  });

  it("announces each score as an image with its value", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} />);
    expect(screen.getAllByRole("img", { name: /out of 5$/ })).toHaveLength(REVIEWS.length);
  });

  it("omits the score for a review that carries none", () => {
    const [first] = REVIEWS;
    if (first === undefined) throw new Error("no fixture review");
    render(<TestimonialWall title="Reviews" reviews={[{ ...first, rating: undefined }]} />);
    expect(screen.queryByRole("img", { name: /out of 5$/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("figure")).toHaveLength(1);
  });

  it("merges a caller className", () => {
    const { container } = render(
      <TestimonialWall title="Reviews" reviews={REVIEWS} className="bg-surface-page-alt" />
    );
    expect(container.firstElementChild).toHaveClass("section-y", "bg-surface-page-alt");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TestimonialWall overline="Guests" title="What people actually say" reviews={REVIEWS} />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- testimonial-wall 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./testimonial-wall`.

- [ ] **Step 3: Implement**

`packages/ui/src/organisms/testimonial-wall/testimonial-wall.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { HeadingLevel } from "../../lib/heading";

import { componentVariants } from "../../lib/component-variants";
import { ReviewCard, type ReviewCardProps } from "../../molecules/review-card/review-card";
import { SectionHeader } from "../../molecules/section-header/section-header";

const testimonialWall = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page flex flex-col gap-8",
    grid: "autogrid",
    item: "flex",
    card: "flex-1",
  },
});

export interface TestimonialWallProps extends Omit<ComponentProps<"section">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  /** One sentence under the heading. */
  lede?: ReactNode;
  /** Real guest reviews only — three or six read best. */
  reviews: ReviewCardProps[];
  variant?: "default" | "brand" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** A grid of guest reviews under a section header, every card in the wall's variant. */
export function TestimonialWall({
  overline,
  title,
  lede,
  reviews,
  variant = "default",
  headingLevel = 2,
  className,
  ...props
}: TestimonialWallProps) {
  const slots = testimonialWall();
  return (
    <section className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        <SectionHeader overline={overline} title={title} lede={lede} headingLevel={headingLevel} />
        <ul className={slots.grid()}>
          {reviews.map((review, index) => (
            <li key={index} className={slots.item()}>
              <ReviewCard
                {...review}
                variant={variant}
                className={slots.card({ class: review.className })}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- testimonial-wall 2>&1 | tail -8`
Expected: PASS (10 tests). The score assertions read Rating's name ("5.0 out of 5", Plan 2b via ReviewCard — `value.toFixed(1)`, confirmed in Task 0).

- [ ] **Step 5: Stories (card parity with `TestimonialWall.card.html`)**

The card's three guests ("Aditi Rao", "Kabir Shah", "Meera Iyer") are invented; the spec's copy rule (§10.1) is real reviews only, so the rows use the verified Google reviews.

`packages/ui/src/organisms/testimonial-wall/testimonial-wall.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { GOOGLE_REVIEWS, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { TestimonialWall } from "./testimonial-wall";

const meta = {
  title: "Organisms/TestimonialWall",
  component: TestimonialWall,
  args: {
    overline: "Guests",
    title: "What people actually say",
    reviews: GOOGLE_REVIEWS.slice(1),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Social proof on the marketing site: a section header over a grid of ReviewCards. Three or six reviews read best. Only real guest copy — these are the verified Google reviews, verbatim.",
      },
    },
  },
} satisfies Meta<typeof TestimonialWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: the grid of three reviews. */
export const Default: Story = {};

export const BrandCards: Story = { args: { variant: "brand" } };

export const FourReviews: Story = { args: { reviews: GOOGLE_REVIEWS } };

export const OnTint: Story = { args: { className: "bg-surface-page-alt" } };

export const WithLede: Story = {
  args: { lede: "Verified Google reviews, in the guests' own words." },
};

/** Quotes with no score still carry the card — the words are the proof, not the number. */
export const WithoutScores: Story = {
  args: { reviews: GOOGLE_REVIEWS.slice(1).map((review) => ({ ...review, rating: undefined })) },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 6: Export**

```ts
export {
  TestimonialWall,
  type TestimonialWallProps,
} from "./organisms/testimonial-wall/testimonial-wall";
```

- [ ] **Step 7: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/testimonial-wall packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/ui/src/organisms/testimonial-wall packages/ui/src/index.ts
git commit -m "feat(ui): add the TestimonialWall organism

A section header over an auto-fitting grid of review cards in one variant;
stories show the verified Google reviews verbatim instead of the design
system's invented guests.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

