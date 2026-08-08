import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pagination } from "./pagination";

const meta = {
  title: "Molecules/Pagination",
  component: Pagination,
  args: { page: 4, pages: 12, getPageHref: (page: number) => `?page=${String(page)}` },
  argTypes: {
    getPageHref: { control: false },
    onPageChange: { control: false },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Paging for the press, blog and careers listings. Every page is a real link so the " +
          "listing stays crawlable on a static export; the current page is a flooded pink pill. " +
          "The row wraps rather than overflowing, and every target clears 44px.",
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Past ±1 of the current page the numbers collapse to a gap. */
export const ManyPages: Story = { args: { page: 6, pages: 24 } };

/** On page one there is nothing behind, so the back step renders inert rather than dead. */
export const FirstPage: Story = { args: { page: 1, pages: 5 } };

export const LastPage: Story = { args: { page: 5, pages: 5 } };

/** Three pages fit whole — no gap is drawn. */
export const ThreePages: Story = { args: { page: 2, pages: 3 } };

/** A listing that fits on one page still renders, so the layout does not jump when it grows. */
export const SinglePage: Story = { args: { page: 1, pages: 1 } };

/** The smallest supported width — the row wraps onto two lines. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <div className="w-full max-w-80">
      <Pagination {...args} />
    </div>
  ),
};
