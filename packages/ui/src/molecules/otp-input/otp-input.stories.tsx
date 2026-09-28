import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { OtpInput } from "./otp-input";

const meta = {
  title: "Molecules/OtpInput",
  component: OtpInput,
  args: { label: "Login code", onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Mobile-OTP login code — the app\'s only sign-in method. 48×56 cells, Space Mono digits; filled cells take a 2px pink border, the next cell shows the focus ring. It is one real input (`autocomplete="one-time-code"`) behind the cells, so SMS autofill, paste (spaces and dashes are dropped) and Backspace just work. Wraps to a second row rather than overflowing on a 360px screen. `status` + `message` for verified/expired.',
      },
    },
  },
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Paste a formatted code: every cell fills with digits only. */
export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Login code" });
    await userEvent.click(input);
    await userEvent.paste("48-21 93");
    await expect(input).toHaveValue("482193");
    await userEvent.keyboard("{Backspace}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("48219");
  },
};

/** Card row "partial". */
export const Partial: Story = { args: { defaultValue: "482" } };

/** Card row "complete" — `length={4}`. */
export const Complete: Story = { args: { length: 4, defaultValue: "4821" } };

/** Card row "success". */
export const Verified: Story = {
  args: {
    length: 4,
    defaultValue: "4821",
    status: "success",
    message: "Verified. Signing you in.",
  },
};

/** Card row "error". */
export const Expired: Story = {
  args: {
    length: 4,
    defaultValue: "1234",
    status: "error",
    message: "That code has expired. Send a new one?",
  },
};

/** Card row "disabled". */
export const Disabled: Story = { args: { length: 4, defaultValue: "48", disabled: true } };

/** Dev parity: a neutral hint under the cells — `message` on the default status. */
export const WithHint: Story = { args: { length: 4, message: "The code lasts 10 minutes." } };

/** Dev parity: a 360px screen less its gutters (320px) — six cells wrap to a second row, never overflow. */
export const Narrow: Story = {
  args: { defaultValue: "4821" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
