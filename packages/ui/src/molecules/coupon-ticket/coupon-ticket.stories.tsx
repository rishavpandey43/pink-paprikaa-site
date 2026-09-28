import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, spyOn } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { CouponTicket } from "./coupon-ticket";

const meta = {
  title: "Molecules/CouponTicket",
  component: CouponTicket,
  args: {
    code: "PAPRIKAA50",
    headline: "50% off your first order",
    terms: "One use per guest. Dine-in and pickup. Till 30 Sep.",
    onCopy: fn(),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Voucher artwork for stories, DMs, table cards and print handouts. The code stub copies to the clipboard on tap; always pair `onCopy` with a Snackbar — the stub\'s own "Copied" flash is reinforcement, not the confirmation. If the browser refuses the copy, the code is selected so it can be copied by hand. Pass `isCopyable={false}` on print artwork and inside PostFrame artboards. `notch` colours the punched notches to match the ground behind the ticket.',
      },
    },
  },
} satisfies Meta<typeof CouponTicket>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "brand". */
export const Brand: Story = {
  // Headless Chromium refuses a clipboard write from a scripted click (no real gesture), so under
  // the test runner (an automated browser, `navigator.webdriver`) this story's clipboard accepts
  // the code; the refused path is the jsdom test "never claims a copy…". A person clicking the
  // stub in Storybook gets the real clipboard.
  beforeEach: () => {
    if (!navigator.webdriver) return;
    const writeText = spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    return () => {
      writeText.mockRestore();
    };
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Use code PAPRIKAA50/ }));
    await expect(await canvas.findByRole("button", { name: /Copied/ })).toBeInTheDocument();
    await expect(args.onCopy).toHaveBeenCalledWith("PAPRIKAA50");
  },
};

/** Card row "light". */
export const Light: Story = {
  args: {
    tone: "light",
    code: "CHAI20",
    headline: "20% off all chai, all week",
    terms: "Dine-in only. Till 30 Sep.",
  },
};

/** The marketing kit's ticket: artwork size, light, on a pink field, not tappable. */
export const OnPinkArtwork: Story = {
  args: { tone: "light", size: "lg", notch: "brand", isCopyable: false },
  render: (args) => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-10">
      <CouponTicket {...args} />
    </div>
  ),
};

/** The notches are punched holes: on a tinted page `notch="tint"` keeps them from reading as blobs. */
export const OnTintedPage: Story = {
  args: { tone: "light", notch: "tint" },
  render: (args) => (
    <div className="bg-surface-page-alt p-8">
      <CouponTicket {...args} />
    </div>
  ),
};

/** A long code wraps inside the stub instead of widening the ticket. */
export const LongCode: Story = {
  args: { code: "PAPRIKAAFIRSTORDER", headline: `${formatRupees(150)} off your first order` },
};

/** 360px: `md` stacks, the perforation runs across and the notches sit on the side edges. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  // Real layout. The side notches overhang the edge by design and are clipped (overflow-hidden), so
  // the ticket's own scrollWidth counts them; what must hold is that the ticket stacks, stays
  // inside its container and never scrolls the page.
  play: async ({ canvasElement }) => {
    const ticket = canvasElement.querySelector("[data-surface]");
    const frame = ticket?.parentElement;
    await expect(frame).toBeInstanceOf(HTMLElement);
    if (ticket === null || !(frame instanceof HTMLElement)) return;
    await expect(getComputedStyle(ticket).flexDirection).toBe("column");
    await expect(ticket.getBoundingClientRect().right).toBeLessThanOrEqual(
      frame.getBoundingClientRect().right
    );
    const page = document.documentElement;
    await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
  },
};
