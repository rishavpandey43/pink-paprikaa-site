### Task 13: ReviewCarousel

**Dev reference:** none (handoff component)

**Files:**

- Create: `packages/design-tokens/tokens/component/review-carousel.json`
- Modify: `packages/ui/eslint.config.mjs` (a scrollable region may take focus — skip if Task 0 found it configured)
- Create: `packages/ui/src/organisms/review-carousel/review-carousel.tsx`, `review-carousel-track.tsx` (client leaf), `review-carousel.test.tsx`, `review-carousel.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `IconButton`, `Link`, `Text`, `ReviewCard`/`ReviewCardProps`, `componentVariants`, `headingTag`; stories: `Button`, `Card`, `Icon`, `Logo`.
- Produces: `ReviewCarousel`, `ReviewCarouselProps`. The track leaf is internal.

- [ ] **Step 1: Let a scrollable region take keyboard focus (lint)**

`jsx-a11y/no-noninteractive-tabindex` (recommended config) allows `tabIndex` only on `tabpanel`. A horizontally scrolling track must be focusable so keyboard users can scroll it with the arrow keys (WCAG 2.1.1; axe `scrollable-region-focusable`). In `packages/ui/eslint.config.mjs`, add a block after the `settings` block:

```js
  {
    // A scrolling region (ReviewCarousel's track, a Table scroll wrapper) must take keyboard
    // focus so it can be scrolled with the arrow keys — WCAG 2.1.1, axe
    // `scrollable-region-focusable`. `region` joins the rule's default `tabpanel` exception.
    files: ["src/**/*.tsx"],
    rules: {
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: ["tabpanel", "region"], allowExpressionValues: true },
      ],
    },
  },
```

- [ ] **Step 2: Component token**

`packages/design-tokens/tokens/component/review-carousel.json`:

```json
{
  "grid-auto-columns": {
    "$type": "gridTemplate",
    "review-carousel": {
      "$value": "minmax(min(320px, 85%), 1fr)",
      "$description": "Review cards at least 320px (85% on phones, so the next card peeks) and stretching to fill when few (handoff GoogleReviews)."
    }
  }
}
```

(Tailwind's `auto-cols-*` reads the `--grid-auto-columns-*` namespace, so `auto-cols-review-carousel` is a named utility.)

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "review-carousel" packages/design-tokens/dist/theme.css`
Expected: `--grid-auto-columns-review-carousel: minmax(min(320px, 85%), 1fr);` and no Style Dictionary warning (the `gridTemplate` type drives no transform — the platform uses only `attribute/cti` and `name/kebab`).

- [ ] **Step 3: Write the failing test**

`packages/ui/src/organisms/review-carousel/review-carousel.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { GOOGLE_REVIEWS } from "../story-fixtures";
import { ReviewCarousel } from "./review-carousel";

const HEADING = "Gurgaon eats with us every day.";
const scrollBy = vi.fn();

/** jsdom has no layout: give the track a size and a scroll position, then tell it it scrolled. */
function layOut(track: HTMLElement, { scrollLeft }: { scrollLeft: number }) {
  Object.defineProperties(track, {
    scrollWidth: { configurable: true, value: 3000 },
    clientWidth: { configurable: true, value: 1000 },
    scrollLeft: { configurable: true, writable: true, value: scrollLeft },
  });
  fireEvent.scroll(track);
}

beforeEach(() => {
  scrollBy.mockClear();
  Object.defineProperty(HTMLElement.prototype, "scrollBy", {
    configurable: true,
    writable: true,
    value: scrollBy,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ReviewCarousel", () => {
  it("heads the carousel with its eyebrow and a level-2 heading", () => {
    render(
      <ReviewCarousel
        eyebrow="Verified Google reviews"
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: HEADING })).toBeInTheDocument();
    expect(screen.getByText("Verified Google reviews")).toBeInTheDocument();
  });

  it("makes the track a keyboard-focusable region named by the heading", () => {
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    expect(track).toHaveAttribute("tabindex", "0");
    expect(track.querySelectorAll("figure")).toHaveLength(GOOGLE_REVIEWS.length);
  });

  it("disables previous at the start and next at the end, keeping both focusable", () => {
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    const previous = screen.getByRole("button", { name: "Previous reviews" });
    const next = screen.getByRole("button", { name: "Next reviews" });

    layOut(track, { scrollLeft: 0 });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(next).toHaveAttribute("aria-disabled", "false");

    layOut(track, { scrollLeft: 900 });
    expect(previous).toHaveAttribute("aria-disabled", "false");
    expect(next).toHaveAttribute("aria-disabled", "false");

    layOut(track, { scrollLeft: 2000 });
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(next).not.toBeDisabled();
  });

  it("pages by 90% of the visible width from the keyboard, and not past an end", async () => {
    const user = userEvent.setup();
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    layOut(track, { scrollLeft: 0 });

    screen.getByRole("button", { name: "Next reviews" }).focus();
    await user.keyboard("{Enter}");
    expect(scrollBy).toHaveBeenCalledWith({ left: 900 });

    scrollBy.mockClear();
    await user.click(screen.getByRole("button", { name: "Previous reviews" }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("honours reduced motion: smooth scrolling is CSS under motion-safe, never forced by script", async () => {
    const user = userEvent.setup();
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    expect(track).toHaveClass("motion-safe:scroll-smooth");
    expect(track).not.toHaveClass("scroll-smooth");
    layOut(track, { scrollLeft: 0 });
    await user.click(screen.getByRole("button", { name: "Next reviews" }));
    expect(scrollBy.mock.calls[0]?.[0]).not.toHaveProperty("behavior");
  });

  it("never auto-advances", () => {
    vi.useFakeTimers();
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    vi.advanceTimersByTime(60_000);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("shows no controls for one review", () => {
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS.slice(0, 1)} />);
    expect(screen.getByRole("region", { name: HEADING })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the empty state and no track when there are no reviews", () => {
    render(
      <ReviewCarousel
        heading={HEADING}
        reviews={[]}
        emptyState={<p>Read our reviews on Google</p>}
      />
    );
    expect(screen.getByText("Read our reviews on Google")).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("links to all the reviews, opening an external link in a new tab", () => {
    render(
      <ReviewCarousel
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
        footerLink={{
          label: "Read all our reviews on Google",
          href: "https://maps.google.com/?q=Pink+Paprikaa",
          isExternal: true,
        }}
      />
    );
    const link = screen.getByRole("link", { name: /Read all our reviews on Google/ });
    expect(link).toHaveAttribute("href", "https://maps.google.com/?q=Pink+Paprikaa");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ReviewCarousel
        eyebrow="Verified Google reviews"
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- review-carousel 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./review-carousel`.

- [ ] **Step 5: Implement the track leaf**

`packages/ui/src/organisms/review-carousel/review-carousel-track.tsx`:

```tsx
"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { type ReactNode, useCallback, useState, useSyncExternalStore } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants } from "../../lib/component-variants";

/** One press moves 90% of the visible width, so a sliver of the last card stays for context (handoff). */
const PAGE_FRACTION = 0.9;
/** Sub-pixel scroll positions still count as "at the edge". */
const EDGE_TOLERANCE = 1;

type TrackPosition = "none" | "start" | "middle" | "end";

function positionOf(track: HTMLElement): TrackPosition {
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (maxScroll <= EDGE_TOLERANCE) return "none";
  if (track.scrollLeft <= EDGE_TOLERANCE) return "start";
  if (track.scrollLeft >= maxScroll - EDGE_TOLERANCE) return "end";
  return "middle";
}

const serverPosition = (): TrackPosition => "start";

const carouselTrack = componentVariants({
  slots: {
    header: "flex flex-wrap items-end justify-between gap-5",
    controls: "flex shrink-0 items-center gap-2",
    track:
      "auto-cols-review-carousel grid snap-x snap-mandatory grid-flow-col gap-5 overflow-x-auto overscroll-x-contain px-1 pt-1 pb-4 *:min-w-0 *:snap-start motion-safe:scroll-smooth",
  },
});

export interface ReviewCarouselTrackProps {
  /** Eyebrow and heading, rendered by the server organism. */
  header: ReactNode;
  /** Id of the heading that names the track region. */
  labelledBy: string;
  previousLabel: string;
  nextLabel: string;
  hasControls: boolean;
  /** The ReviewCards, rendered by the server organism. */
  children: ReactNode;
}

/**
 * The carousel's client corner: a scroll-snap track that is a focusable region (arrow keys scroll
 * it natively) and previous/next buttons that page it. The buttons are `aria-disabled` at the
 * ends, so a keyboard user's focus stays put. Nothing auto-advances; smoothness is `motion-safe:`
 * CSS, so reduced motion jumps instead of gliding.
 */
export function ReviewCarouselTrack({
  header,
  labelledBy,
  previousLabel,
  nextLabel,
  hasControls,
  children,
}: ReviewCarouselTrackProps) {
  const [track, setTrack] = useState<HTMLDivElement | null>(null);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (track === null) return () => undefined;
      track.addEventListener("scroll", onChange, { passive: true });
      const resize = new ResizeObserver(onChange);
      resize.observe(track);
      return () => {
        track.removeEventListener("scroll", onChange);
        resize.disconnect();
      };
    },
    [track]
  );
  const position = useSyncExternalStore(
    subscribe,
    () => (track === null ? "start" : positionOf(track)),
    serverPosition
  );

  const canGoPrevious = position === "middle" || position === "end";
  const canGoNext = position === "start" || position === "middle";
  const slots = carouselTrack();

  const page = (direction: -1 | 1, isEnabled: boolean) => {
    if (!isEnabled || track === null) return;
    track.scrollBy({ left: direction * track.clientWidth * PAGE_FRACTION });
  };

  return (
    <>
      <div className={slots.header()}>
        {header}
        {hasControls ? (
          <div className={slots.controls()}>
            <IconButton
              icon={ArrowLeft}
              label={previousLabel}
              variant="secondary"
              size="lg"
              aria-disabled={!canGoPrevious}
              onClick={() => {
                page(-1, canGoPrevious);
              }}
            />
            <IconButton
              icon={ArrowRight}
              label={nextLabel}
              variant="primary"
              size="lg"
              aria-disabled={!canGoNext}
              onClick={() => {
                page(1, canGoNext);
              }}
            />
          </div>
        ) : null}
      </div>
      <div
        ref={setTrack}
        role="region"
        aria-labelledby={labelledBy}
        tabIndex={0}
        className={slots.track()}
      >
        {children}
      </div>
    </>
  );
}
```

- [ ] **Step 6: Implement the organism**

`packages/ui/src/organisms/review-carousel/review-carousel.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { Link } from "../../atoms/link/link";
import { Text } from "../../atoms/text/text";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { ReviewCard, type ReviewCardProps } from "../../molecules/review-card/review-card";
import { ReviewCarouselTrack } from "./review-carousel-track";

const reviewCarousel = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page flex flex-col gap-8",
    titles: "flex min-w-0 flex-col gap-3",
    eyebrow: "flex items-center gap-2",
    footer: "self-start",
  },
});

export interface ReviewCarouselProps extends Omit<ComponentProps<"section">, "title"> {
  /** e.g. `<><Icon icon={BadgeCheck} size="sm" />4.6 on Google · 120 verified reviews</>`. */
  eyebrow?: ReactNode;
  heading: ReactNode;
  /** Real, verified reviews only. */
  reviews: ReviewCardProps[];
  footerLink?: { label: string; href: string; isExternal?: boolean | undefined } | undefined;
  /** Shown in place of the track when there are no reviews. */
  emptyState?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
  previousLabel?: string | undefined;
  nextLabel?: string | undefined;
}

/**
 * Guest reviews in a horizontal scroll-snap track (handoff GoogleReviews): a focusable region
 * named by the heading, previous/next paging from the header row, an empty state when there
 * are none, and a link to all of them. Server-rendered; the track and controls are a client leaf.
 */
export function ReviewCarousel({
  eyebrow,
  heading,
  reviews,
  footerLink,
  emptyState,
  headingLevel = 2,
  previousLabel = "Previous reviews",
  nextLabel = "Next reviews",
  className,
  ...props
}: ReviewCarouselProps) {
  const headingId = useId();
  const slots = reviewCarousel();
  const titles = (
    <div className={slots.titles()}>
      {eyebrow ? (
        <Text variant="overline" tone="brand" className={slots.eyebrow()}>
          {eyebrow}
        </Text>
      ) : null}
      <Text as={headingTag(headingLevel)} id={headingId} variant="display-2" isFluid isBalanced>
        {heading}
      </Text>
    </div>
  );
  return (
    <section className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        {reviews.length === 0 ? (
          <>
            {titles}
            {emptyState}
          </>
        ) : (
          <ReviewCarouselTrack
            header={titles}
            labelledBy={headingId}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            hasControls={reviews.length > 1}
          >
            {reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </ReviewCarouselTrack>
        )}
        {footerLink ? (
          <Link
            href={footerLink.href}
            isExternal={footerLink.isExternal}
            className={slots.footer()}
          >
            {footerLink.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- review-carousel 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 8: Stories (handoff `GoogleReviews`)**

`packages/ui/src/organisms/review-carousel/review-carousel.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { expect, waitFor } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Icon } from "../../atoms/icon/icon";
import { Logo } from "../../atoms/logo/logo";
import { Text } from "../../atoms/text/text";
import {
  BRAND,
  GOOGLE_REVIEWS,
  VIEWPORT_1280,
  VIEWPORT_360,
  VIEWPORT_768,
} from "../story-fixtures";
import { ReviewCarousel } from "./review-carousel";

const HEADING = "Gurgaon eats with us every day.";

/** The handoff's review cards carry no avatar (ReviewCard `hasAvatar`, Plan 3b). */
const HANDOFF_REVIEWS = GOOGLE_REVIEWS.map((review) => ({ ...review, hasAvatar: false }));

/** The handoff's no-reviews card — page content, composed here for the story. */
const EMPTY = (
  <Card>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <Logo variant="symbol" tone="badge" isDecorative className="w-12" />
        <div className="flex min-w-0 flex-col gap-1">
          <Text as="span" weight="bold" className="font-display">
            Read what our guests say on Google
          </Text>
          <Text as="span" variant="body-sm" tone="muted">
            Every review there is from a real Pink Paprikaa guest.
          </Text>
        </div>
      </div>
      <Button asChild iconAfter={ArrowUpRight}>
        <a href={BRAND.directionsHref} target="_blank" rel="noopener noreferrer">
          Open Google reviews
        </a>
      </Button>
    </div>
  </Card>
);

const meta = {
  title: "Organisms/ReviewCarousel",
  component: ReviewCarousel,
  args: {
    eyebrow: (
      <>
        <Icon icon={BadgeCheck} size="sm" />
        Verified Google reviews
      </>
    ),
    heading: HEADING,
    reviews: HANDOFF_REVIEWS,
    footerLink: {
      label: "Read all our reviews on Google",
      href: BRAND.directionsHref,
      isExternal: true,
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Verified guest reviews in a horizontal scroll-snap track (the handoff's GoogleReviews). The track is a focusable region — arrow keys scroll it; previous/next page it by 90% of its width and are aria-disabled at the ends. Nothing auto-advances; with reduced motion it jumps instead of gliding. One review shows no controls; none shows the `emptyState`.",
      },
    },
  },
} satisfies Meta<typeof ReviewCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Handoff Home — four verified reviews. */
export const HandoffHome: Story = {};

/** Handoff Office — the tinted section behind it. */
export const HandoffOnTint: Story = {
  args: { heading: "Teams that stopped ordering in.", className: "bg-surface-page-alt" },
};

export const OneReview: Story = { args: { reviews: HANDOFF_REVIEWS.slice(0, 1) } };

/** Handoff empty state — no verified reviews yet. */
export const Empty: Story = { args: { reviews: [], emptyState: EMPTY } };

/** Paging by keyboard at phone width. */
export const Paging: Story = {
  globals: VIEWPORT_360,
  play: async ({ canvas, userEvent }) => {
    const track = canvas.getByRole("region", { name: HEADING });
    const next = canvas.getByRole("button", { name: "Next reviews" });
    next.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(track.scrollLeft).toBeGreaterThan(0));
    await expect(canvas.getByRole("button", { name: "Previous reviews" })).toHaveAttribute(
      "aria-disabled",
      "false"
    );
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 9: Export**

```ts
export {
  ReviewCarousel,
  type ReviewCarouselProps,
} from "./organisms/review-carousel/review-carousel";
```

- [ ] **Step 10: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/review-carousel packages/design-tokens/tokens/component/review-carousel.json packages/ui/eslint.config.mjs packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/review-carousel.json packages/ui/eslint.config.mjs packages/ui/src/organisms/review-carousel packages/ui/src/index.ts
git commit -m "feat(ui): add the ReviewCarousel organism

The handoff's Google reviews as a scroll-snap track that is a focusable
region named by its heading, paged by previous/next buttons that stay
focusable (aria-disabled) at the ends. No auto-advance; smooth scrolling is
motion-safe CSS; one review drops the controls, none shows the empty state.
Lint now lets a scrolling region take focus, as WCAG 2.1.1 requires.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

