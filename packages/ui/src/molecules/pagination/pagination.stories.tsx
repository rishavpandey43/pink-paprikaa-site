import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Pagination } from "./pagination";

const meta = {
  title: "Molecules/Pagination",
  component: Pagination,
  args: { page: 4, pages: 12, getPageHref: (page) => `#page-${String(page)}` },
  parameters: {
    docs: {
      description: {
        component:
          "Paging for press, blog and careers listings — real links (`getPageHref`), so every page is crawlable and back-button friendly. The current page is a flooded pink pill; the rest are white with a 1px border. Gaps appear past ±1 of the current page. Previous/Next disappear into inert placeholders at the ends; a single page renders nothing. Wraps rather than overflowing on mobile. `linkAs` renders the app's router link.",
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "many pages". */
export const Playground: Story = {
  // The names in a real browser, with real CSS on the sr-only text (jsdom proves only its own).
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Page 5" })).toHaveAttribute("href", "#page-5");
    await expect(canvas.getByRole("link", { name: "Previous page" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Next page" })).toBeVisible();
  },
};

/** Card row "first page". */
export const FirstPage: Story = { args: { page: 1, pages: 5 } };

/** Card row "3 pages". */
export const ThreePages: Story = { args: { page: 2, pages: 3 } };

/** The last page — Next is inert. */
export const LastPage: Story = { args: { page: 12, pages: 12 } };

/** Dev parity: deep in a long listing — both runs collapse to a gap. */
export const ManyPages: Story = { args: { page: 6, pages: 24 } };

/** Dev parity: the smallest supported width — the row wraps onto two lines. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};
