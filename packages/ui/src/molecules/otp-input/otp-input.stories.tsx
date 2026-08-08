import type { Meta, StoryObj } from "@storybook/react-vite";

import { OtpInput } from "./otp-input";

// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof OtpInput> = {
  title: "Molecules/OtpInput",
  component: OtpInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The mobile sign-in code, one cell per digit. Typing walks forward, Backspace walks " +
          "back, and a pasted code fills the cells from wherever it lands. Six 48px cells do not " +
          "fit a 360px screen, so the row wraps rather than overflowing.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/** Uncontrolled — type into it and the cells fill themselves. */
export const Default: Story = {};

export const FourDigits: Story = {
  args: { length: 4, hint: "The code lasts 10 minutes." },
};

/** A filled cell takes the 2px brand border, so progress reads at a glance. */
export const PartlyEntered: Story = {
  args: { length: 6, value: "482", onChange: () => undefined },
};

/** Every status carries a sentence — a colour on its own never says what went wrong. */
export const Statuses: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <OtpInput
        hint="The code lasts 10 minutes."
        length={4}
        onChange={() => undefined}
        value="482"
      />
      <OtpInput
        length={4}
        message="Verified. Signing you in."
        onChange={() => undefined}
        status="success"
        value="4821"
      />
      <OtpInput
        length={4}
        message="That code has expired. Send a new one?"
        onChange={() => undefined}
        status="error"
        value="1234"
      />
      <OtpInput
        length={4}
        message="Checking that code."
        onChange={() => undefined}
        status="loading"
        value="4821"
      />
      <OtpInput
        label="Sign-in code"
        length={4}
        message="Sign-in reopens in a minute."
        onChange={() => undefined}
        status="disabled"
        value="48"
      />
    </div>
  ),
};

/** The narrowest supported width — six cells wrap to a second row instead of overflowing. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
  args: { length: 6, value: "4821", onChange: () => undefined },
};
