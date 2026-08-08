import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteHeader } from "./site-header";

const meta = {
  title: "Organisms/SiteHeader",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The site masthead — 72px, sticky, and translucent white with a blur once the page has " +
          "scrolled past its hero. It carries exactly two actions, never three: ordering, which " +
          "never gives way, and Book a Table, which hides below 768px. Below 1024px the rail " +
          "collapses into a keyboard-accessible sheet rather than truncating.",
      },
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Resting on white, then translucent over whatever has scrolled under it. */
export const Scrolled: Story = {
  args: { isScrolled: true },
  render: (args) => (
    <div className="bg-surface-brand-soft">
      <SiteHeader {...args} />
      <div className="h-40" />
    </div>
  ),
};

/** The count sits on the glyph and is folded into the button's accessible name. */
export const WithCart: Story = {
  args: { cartCount: 2, onCart: () => undefined, onSearch: () => undefined },
};

/**
 * Three specimens of one masthead, which is a page shape the browser has opinions about: a
 * document may hold exactly one `banner`, and no two landmarks may share a role and an accessible
 * name. Each specimen is therefore wrapped in its own named `section` — that scopes its `header`
 * out of the `banner` role, the way a `header` inside an `article` is scoped — and each is given
 * its own `navLabel`, so the three rails stay tellable apart.
 */
export const CartCounts: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {[0, 1, 12].map((count) => (
        <section aria-label={`Cart with ${String(count)} items`} key={count}>
          <SiteHeader
            {...args}
            cartCount={count}
            navLabel={`Main, cart with ${String(count)} items`}
            onCart={() => undefined}
          />
        </section>
      ))}
    </div>
  ),
};

/** A shorter rail. Links drop out of the header rather than wrapping the 72px band. */
export const ShortRail: Story = {
  args: {
    links: [
      { label: "Menu", href: "/menu" },
      { label: "Outlets", href: "/outlets" },
      { label: "Our Story", href: "/about" },
    ],
  },
};

/**
 * At 360px only the lockup, the cart, Order Now and the sheet trigger are left — everything else
 * is in the sheet. Open it to check the whole rail is still reachable.
 */
export const Smallest: Story = {
  globals: { viewport: { value: "floor360" } },
  args: { cartCount: 2, onCart: () => undefined, onSearch: () => undefined, isScrolled: true },
};

/** The masthead over real page content, so the sticky behaviour and the blur are visible. */
export const InContext: Story = {
  args: { cartCount: 2, isScrolled: true, onCart: () => undefined, onSearch: () => undefined },
  render: (args) => (
    <div className="h-96 overflow-y-auto bg-surface-page">
      <SiteHeader {...args} />
      <div className="mx-auto flex max-w-(--layout-container-max) flex-col gap-4 p-8">
        {Array.from({ length: 12 }, (_, index) => (
          <div className="h-16 rounded-4 bg-surface-sunken" key={index} />
        ))}
      </div>
    </div>
  ),
};
