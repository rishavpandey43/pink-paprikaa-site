import type { Meta, StoryObj } from "@storybook/react-vite";

import { ReviewCard } from "./review-card";

const meta = {
  title: "Molecules/ReviewCard",
  component: ReviewCard,
  args: {
    name: "Aditi Rao",
    meta: "Sector 57 — March",
    quote: "The chilli paneer is the whole reason I moved to Sector 57.",
    rating: 5,
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A guest quote, for social-proof bands and the testimonial wall. The score renders as " +
          "brand diamonds rather than stars, and the quote marks belong to the component — pass " +
          "the quote unquoted. Every quote that ships must be real guest copy; the copy in these " +
          "stories is placeholder and never goes to production.",
      },
    },
  },
} satisfies Meta<typeof ReviewCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `default` on white, `brand` on the pale pink a testimonial wall floods itself with. */
export const Variants: Story = {
  render: (args) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <ReviewCard {...args} />
      <ReviewCard
        {...args}
        meta="Sector 57 — April"
        name="Meera Iyer"
        quote="Chai at 8am, chilli paneer at 11pm. They mean it."
        variant="brand"
      />
    </div>
  ),
};

/** The bare mark instead of the diamond — quieter, for a wall of several cards at once. */
export const SymbolMark: Story = {
  args: { mark: "symbol", rating: 4.3, name: "Rhea Dutta", quote: "Good coffee, better fries." },
};

/** A fractional score fills its last mark proportionally: 4.5 fills half. */
export const PartialScore: Story = {
  args: { rating: 4.5, name: "Kabir Shah", quote: "Finally a kitchen that tastes like home." },
};

/** With no `rating`, the quote carries the card on its own. */
export const WithoutScore: Story = {
  args: { rating: undefined },
};

/** Long copy wraps at the narrow measure; a missing photo falls back to the guest's initials. */
export const LongQuote: Story = {
  args: {
    name: "Sanya Bhatt",
    meta: "Sector 57 — May",
    quote:
      "I came in for a plate of momos and stayed two hours. The chole is the closest thing to " +
      "my grandmother's, the kitchen is 100% vegetarian, and nobody rushed me once.",
  },
};

/** Three across, the shape a social-proof band takes on a page. */
export const Wall: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
      <ReviewCard {...args} variant="brand" />
      <ReviewCard
        {...args}
        mark="symbol"
        meta="Sector 57 — April"
        name="Kabir Shah"
        quote="Finally a kitchen that tastes like home."
        rating={4.5}
        variant="brand"
      />
      <ReviewCard
        {...args}
        meta="Sector 57 — May"
        name="Rhea Dutta"
        quote="Good coffee, better fries."
        rating={4.3}
        variant="brand"
      />
    </div>
  ),
};
