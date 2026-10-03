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
      <div className="w-190 max-w-full">
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

/** Card row "default": two cards side by side, stacked at 360px. */
export const Default: Story = {
  render: () => (
    <div className="grid gap-3.5 sm:grid-cols-2">
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
