import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, screen, waitFor } from "storybook/test";

import { Field } from "../field/field";
import { Calendar, type CalendarProps, type DateRange } from "./calendar";
import { DatePicker } from "./date-picker";

/** Fixed dates, so every story renders the same month whenever it runs. */
const OCTOBER = new Date(2026, 9, 1);
const FOURTH = new Date(2026, 9, 4);

const meta = {
  title: "Molecules/DatePicker",
  component: DatePicker,
  args: { "aria-label": "Booking date" },
  parameters: {
    docs: {
      story: { inline: false, height: "420px" },
      description: {
        component:
          "A date field: a button that shows the chosen day (en-IN, `Mon, 5 Oct 2026`) and opens a Calendar in a Popover. The week starts on Monday. Arrow keys, Home/End and PageUp/PageDown move across days and months; Enter picks; Escape closes and returns focus to the field. `name` submits `yyyy-mm-dd` through a hidden input; `disabledDays` takes a date, `{ before }`, `{ dayOfWeek }`, a predicate or a list. `Calendar` is the same grid on its own, single or range, one or two months. Label and message belong to Field.",
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DatePickerPlayground: Story = {
  args: { name: "date", defaultValue: FOURTH },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /Booking date/ });
    await expect(trigger).toHaveTextContent("Sun, 4 Oct 2026");
    await userEvent.click(trigger);
    await expect(await screen.findByRole("grid")).toBeVisible();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(trigger).toHaveTextContent("Mon, 5 Oct 2026");
    await waitFor(() => expect(screen.queryByRole("grid")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Empty: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /Booking date/ });
    await expect(trigger).toHaveTextContent("Pick a date");
    await userEvent.click(trigger);
    await expect(await screen.findByRole("grid")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("grid")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const DisabledDays: Story = {
  args: {
    defaultValue: FOURTH,
    disabledDays: [{ before: FOURTH }, { dayOfWeek: [1] }],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Booking date/ }));
    await expect(await screen.findByRole("grid")).toBeVisible();
    const monday = document.querySelector<HTMLButtonElement>('td[data-day="2026-10-05"] button');
    await expect(monday).toBeDisabled();
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: FOURTH } };

export const InFieldWithError: Story = {
  render: (args) => (
    <Field label="Date of visit" status="error" message="Pick a day we are open.">
      {({ id, "aria-describedby": describedBy }) => (
        <DatePicker
          {...args}
          id={id}
          aria-describedby={describedBy}
          aria-label={undefined}
          status="error"
        />
      )}
    </Field>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Date of visit" });
    await expect(trigger).toHaveAttribute("aria-invalid", "true");
    await expect(trigger).toHaveAccessibleDescription(/Pick a day we are open\./);
  },
};

function ControlledPicker(args: Parameters<typeof DatePicker>[0]) {
  const [date, setDate] = useState<Date | null>(FOURTH);
  return (
    <div className="grid gap-3">
      <DatePicker {...args} value={date} onValueChange={setDate} />
      <button
        type="button"
        className="justify-self-start text-body-sm underline"
        onClick={() => {
          setDate(null);
        }}
      >
        Clear from outside
      </button>
    </div>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledPicker {...args} />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /Booking date/ });
    await userEvent.click(canvas.getByRole("button", { name: "Clear from outside" }));
    await expect(trigger).toHaveTextContent("Pick a date");
  },
};

/** The popover stays inside the smallest supported viewport. */
export const Mobile360: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  args: { defaultValue: FOURTH },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Booking date/ }));
    const grid = await screen.findByRole("grid");
    const rect = grid.getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
  },
};

export const CalendarSingle: Story = {
  render: () => {
    return <SingleDemo />;
  },
  play: async ({ canvas, userEvent }) => {
    const day = document.querySelector<HTMLButtonElement>('td[data-day="2026-10-14"] button');
    if (day === null) throw new Error("day not found");
    await userEvent.click(day);
    await expect(canvas.getByText(/^Chosen:/)).toHaveTextContent("Chosen: 2026-10-14");
  },
};

function SingleDemo() {
  const [date, setDate] = useState<Date | undefined>(FOURTH);
  return (
    <div className="grid gap-3">
      <Calendar
        mode="single"
        defaultMonth={OCTOBER}
        selected={date}
        onSelect={(next) => {
          setDate(next instanceof Date ? next : undefined);
        }}
      />
      <p className="text-body-sm text-text-muted">
        <output>Chosen: {date === undefined ? "none" : date.toLocaleDateString("en-CA")}</output>
      </p>
    </div>
  );
}

function RangeDemo({ numberOfMonths }: Pick<CalendarProps, "numberOfMonths">) {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 9, 6),
    to: new Date(2026, 9, 9),
  });
  return (
    <Calendar
      mode="range"
      defaultMonth={OCTOBER}
      numberOfMonths={numberOfMonths}
      selected={range}
      onSelect={(next) => {
        setRange(next instanceof Date ? undefined : next);
      }}
    />
  );
}

function dayButtonAt(iso: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(`td[data-day="${iso}"] button`);
  if (button === null) throw new Error(`no day button for ${iso}`);
  return button;
}

export const CalendarRange: Story = {
  render: () => <RangeDemo />,
  play: async ({ userEvent }) => {
    // The ends are the brand fill, the stretch between is the soft tint, and hovering an end
    // does not repaint it.
    const start = dayButtonAt("2026-10-06");
    const middle = dayButtonAt("2026-10-07");
    const plain = dayButtonAt("2026-10-20");
    const fill = getComputedStyle(start).backgroundColor;
    await expect(fill).not.toBe(getComputedStyle(plain).backgroundColor);
    await expect(getComputedStyle(middle).backgroundColor).not.toBe(fill);
    await expect(getComputedStyle(middle).backgroundColor).not.toBe(
      getComputedStyle(plain).backgroundColor
    );
    await userEvent.hover(start);
    await expect(getComputedStyle(start).backgroundColor).toBe(fill);
    const day = dayButtonAt("2026-10-16");
    await userEvent.click(day);
    await expect(day.closest("td")).toHaveAttribute("aria-selected", "true");
  },
};

export const CalendarDisabledDays: Story = {
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={OCTOBER}
      disabled={[{ before: FOURTH }, { dayOfWeek: [1] }]}
    />
  ),
  play: async () => {
    const monday = document.querySelector<HTMLButtonElement>('td[data-day="2026-10-12"] button');
    await expect(monday).toBeDisabled();
  },
};

export const TwoMonths: Story = {
  render: () => <RangeDemo numberOfMonths={2} />,
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("grid")).toHaveLength(2);
  },
};
