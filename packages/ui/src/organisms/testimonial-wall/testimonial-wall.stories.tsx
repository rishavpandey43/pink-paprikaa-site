import type { Meta, StoryObj } from "@storybook/react-vite";

import { TestimonialWall, type WallReview } from "./testimonial-wall";

const REVIEWS: WallReview[] = [
  {
    name: "Aditi Rao",
    rating: 5,
    meta: "Sector 57 — March",
    quote: "The chilli paneer is the whole reason I moved to Sector 57.",
  },
  {
    name: "Kabir Shah",
    rating: 4.5,
    meta: "Sector 57 — April",
    quote: "Finally a kitchen that tastes like home.",
  },
  {
    name: "Meera Iyer",
    rating: 5,
    meta: "Sector 57 — April",
    quote: "Chai at 8am, chilli paneer at 11pm. They mean it.",
  },
];

const SIX: WallReview[] = [
  ...REVIEWS,
  {
    name: "Rhea Dutta",
    rating: 4.3,
    meta: "Sector 57 — May",
    quote: "Good coffee, better fries.",
  },
  {
    name: "Sanya Bhatt",
    rating: 5,
    meta: "Sector 57 — May",
    quote:
      "I came in for a plate of momos and stayed two hours. Nobody rushed me once, and the " +
      "chole is the closest thing to my grandmother's.",
  },
  {
    name: "Nikhil Menon",
    rating: 4.5,
    meta: "Sector 57 — June",
    quote: "Two of us ate for ₹380 and walked out full.",
  },
];

const UNSCORED: WallReview[] = [
  {
    name: "Aditi Rao",
    meta: "Sector 57 — March",
    quote: "The chilli paneer is the whole reason I moved to Sector 57.",
  },
  {
    name: "Kabir Shah",
    meta: "Sector 57 — April",
    quote: "Finally a kitchen that tastes like home.",
  },
  {
    name: "Meera Iyer",
    meta: "Sector 57 — April",
    quote: "Chai at 8am, chilli paneer at 11pm. They mean it.",
  },
];

const meta = {
  title: "Organisms/TestimonialWall",
  component: TestimonialWall,
  args: {
    overline: "Guests",
    title: "What people actually say",
    reviews: REVIEWS,
  },
  argTypes: { reviews: { control: false }, title: { control: "text" } },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The social-proof band: a section opener over an auto-fitting grid of guest quotes. " +
          "Three or six reads best — the grid balances, and a wall of two looks unfinished. Every " +
          "quote that ships must be real guest copy; the copy in these stories is placeholder and " +
          "never goes to production.",
      },
    },
  },
} satisfies Meta<typeof TestimonialWall>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Three across, on the pale-pink card. The page ground and the card are the only two colours. */
export const Default: Story = {};

/** Six fills two full rows. Past six the wall stops being read and starts being scrolled. */
export const SixReviews: Story = {
  args: { reviews: SIX },
};

/** A lede under the heading, for a wall that needs to say where the quotes came from. */
export const WithLede: Story = {
  args: {
    lede: "Collected from guests at the counter and from our delivery partners, unedited.",
  },
};

/** The white card, for a wall dropped onto a page section that is already pink. */
export const DefaultCards: Story = {
  args: { variant: "default" },
};

/** A quote with no score still carries the card — the words are the proof, not the number. */
export const WithoutScores: Story = {
  args: { reviews: UNSCORED },
};

/** At 360px the grid folds to a single column and the long quote wraps at the narrow measure. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: { reviews: SIX.slice(3) },
};
