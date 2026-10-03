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
