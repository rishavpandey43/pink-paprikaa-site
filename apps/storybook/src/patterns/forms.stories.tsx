import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, type UserEventObject, waitFor } from "storybook/test";

import { ENQUIRY_MESSAGES, EnquiryForm } from "./enquiry-form";

/** The messages an empty submit must show — every required field. */
const REQUIRED_MESSAGES = [
  ENQUIRY_MESSAGES.name,
  ENQUIRY_MESSAGES.phone,
  ENQUIRY_MESSAGES.occasion,
  ENQUIRY_MESSAGES.guestsMin,
  ENQUIRY_MESSAGES.date,
  ENQUIRY_MESSAGES.meal,
  ENQUIRY_MESSAGES.spice,
  ENQUIRY_MESSAGES.service,
  ENQUIRY_MESSAGES.consent,
];

const MAX_TABS = 80;

/** Press Tab until `target` has focus — proves it is reachable by keyboard, in document order. */
async function tabTo(user: UserEventObject, target: HTMLElement): Promise<void> {
  for (
    let presses = 0;
    presses < MAX_TABS && target.ownerDocument.activeElement !== target;
    presses += 1
  ) {
    await user.tab();
  }
  await expect(target).toHaveFocus();
}

const meta = {
  title: "Molecules/Field/React Hook Form + Zod",
  component: EnquiryForm,
  args: { onSubmit: fn() },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The design system is form-library-agnostic and RHF-compatible by contract (spec D17). Native-backed controls — Input, Select, Checkbox, Radio, ChoiceCardGroup, CheckCard — take `{...register(\"field\")}` unmodified; value-based controls — QuantityStepper, ChipGroup — take `<Controller>` (`value`, `onValueChange`, `onBlur`, `name`); Field renders the message from `formState.errors` through `status` and `message`. One Zod schema drives validation and the submitted types. The form sets `noValidate` so validation is the schema's, not the browser's. react-hook-form, @hookform/resolvers and zod are devDependencies of this Storybook only — never of packages/ui.",
      },
    },
  },
} satisfies Meta<typeof EnquiryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeyboardOnly: Story = {
  name: "Enquiry form — keyboard only",
  play: async ({ args, canvas, step, userEvent }) => {
    const submit = canvas.getByRole("button", { name: "Send enquiry" });

    await step(
      "an empty submit shows every message and focuses the first invalid field",
      async () => {
        await tabTo(userEvent, submit);
        await userEvent.keyboard("{Enter}");
        for (const message of REQUIRED_MESSAGES) {
          await expect(await canvas.findByText(message)).toBeVisible();
        }
        await expect(canvas.getByRole("textbox", { name: /^Name/ })).toHaveFocus();
        await expect(args.onSubmit).not.toHaveBeenCalled();
      }
    );

    await step("every field completed from the keyboard submits the parsed values", async () => {
      await userEvent.keyboard("Kavya Menon");

      await tabTo(userEvent, canvas.getByRole("textbox", { name: /^Mobile number/ }));
      await userEvent.keyboard("98765 43210");

      const occasion = canvas.getByRole("combobox", { name: /^Occasion/ });
      await tabTo(userEvent, occasion);
      await userEvent.keyboard("{Enter}{Enter}");
      await expect(occasion).toHaveTextContent("Birthday");

      const date = canvas.getByRole("button", { name: /^Date/ });
      await tabTo(userEvent, date);
      // DatePicker opens on pointer (ArrowDown-to-open is Task 8); click after keyboard focus.
      await userEvent.click(date);
      await expect(await screen.findByRole("grid")).toBeVisible();
      const dayButton = document.querySelector<HTMLButtonElement>(
        'td[data-day]:not([aria-disabled="true"]) button:not(:disabled)'
      );
      if (dayButton === null) throw new Error("expected a pickable day in the open calendar");
      const pickedIso = dayButton.closest("td")?.getAttribute("data-day");
      if (pickedIso === null || pickedIso === undefined) {
        throw new Error("day cell missing data-day");
      }
      await userEvent.click(dayButton);
      await expect(date).not.toHaveTextContent("Choose a day");

      const increase = canvas.getByRole("button", { name: /^Add one/ });
      await tabTo(userEvent, increase);
      for (let press = 0; press < 5; press += 1) {
        await userEvent.keyboard("{Enter}");
      }

      await tabTo(userEvent, canvas.getByRole("radio", { name: /^Classic Dawat/ }));
      await userEvent.keyboard("{ArrowDown}");
      await expect(canvas.getByRole("radio", { name: /^Signature Dawat/ })).toBeChecked();

      await tabTo(userEvent, canvas.getByRole("radio", { name: "Mild" }));
      await userEvent.keyboard("{ArrowRight}");
      await expect(canvas.getByRole("radio", { name: "Medium" })).toHaveFocus();
      await userEvent.keyboard(" ");
      await expect(canvas.getByRole("radio", { name: "Medium" })).toBeChecked();

      const delivered = canvas.getByRole("radio", { name: /^Delivered/ });
      await tabTo(userEvent, delivered);
      await userEvent.keyboard(" ");
      await expect(delivered).toBeChecked();

      await tabTo(userEvent, canvas.getByRole("checkbox", { name: /^No onion, no garlic/ }));
      await userEvent.keyboard(" ");

      await tabTo(userEvent, canvas.getByRole("textbox", { name: /^Notes/ }));
      await userEvent.keyboard("Jain thali for four of the guests.");

      await tabTo(userEvent, canvas.getByRole("checkbox", { name: "Reply to me on WhatsApp" }));
      await userEvent.keyboard(" ");

      await tabTo(userEvent, submit);
      await userEvent.keyboard("{Enter}");

      await waitFor(() => expect(args.onSubmit).toHaveBeenCalledOnce());
      await expect(args.onSubmit).toHaveBeenCalledWith({
        name: "Kavya Menon",
        phone: "9876543210",
        occasion: "birthday",
        guests: 15,
        date: pickedIso,
        meal: "signature",
        spice: "medium",
        service: "delivered",
        noOnionGarlic: true,
        notes: "Jain thali for four of the guests.",
        consent: true,
      });
      for (const message of REQUIRED_MESSAGES) {
        await expect(canvas.queryByText(message)).toBeNull();
      }
      await expect(await canvas.findByText("Enquiry sent")).toBeVisible();
    });
  },
};
