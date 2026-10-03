import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { expect, waitFor } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Icon } from "../../atoms/icon/icon";
import { Logo } from "../../atoms/logo/logo";
import { Typography } from "../../atoms/typography/typography";
import { ringClippers } from "../../lib/story-ring";
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
        <Logo variant="symbol" color="badge" isDecorative className="w-12" />
        <div className="flex min-w-0 flex-col gap-1">
          <Typography as="span" weight="bold" className="font-display">
            Read what our guests say on Google
          </Typography>
          <Typography as="span" variant="body-sm" color="muted">
            Every review there is from a real Pink Paprikaa guest.
          </Typography>
        </div>
      </div>
      <Button asChild iconAfter={ArrowUpRight}>
        <a href={BRAND.directionsHref} target="_blank" rel="noopener noreferrer">
          Open Google reviews
          <span className="sr-only"> (Opens in a new tab)</span>
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

/**
 * The track scrolls, so it clips: tab through every stop — previous, next, the track, each card's
 * source link (the track scrolls it into view), the footer link — and keep each focus ring whole.
 */
const proveRingsWhole: NonNullable<Story["play"]> = async ({ canvasElement, userEvent }) => {
  const stops = 3 + HANDOFF_REVIEWS.filter((review) => review.source).length + 1;
  const seen = new Set<Element>();
  for (let step = 0; step < stops; step += 1) {
    await userEvent.tab();
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || seen.has(active)) break;
    seen.add(active);
    await expect(canvasElement).toContainElement(active);
    // Focus scrolls a card into view, gliding under motion-safe: measure where it comes to rest.
    await waitFor(() => expect(ringClippers(active)).toEqual([]));
  }
  await expect(seen.size).toBe(stops);
};

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
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Previous reviews" })).toHaveAttribute(
        "aria-disabled",
        "false"
      )
    );
  },
};

export const Mobile: Story = { globals: VIEWPORT_360, play: proveRingsWhole };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280, play: proveRingsWhole };
