import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Calendar, type CalendarProps } from "./calendar";
import { DatePicker } from "./date-picker";

/** The day's button, by its cell's ISO date: independent of the locale's aria-label wording. */
function dayButton(iso: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(`td[data-day="${iso}"] button`);
  if (button === null) throw new Error(`no day button for ${iso}`);
  return button;
}

const OCTOBER = new Date(2026, 9, 1);

describe("DatePicker", () => {
  it("opens the calendar, picks a day with the keyboard, shows it formatted and submits ISO", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Booking date"
        name="date"
        defaultValue="2026-10-04"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /Booking date/ }));
    expect(screen.getByRole("grid")).toBeVisible();
    expect(dayButton("2026-10-04")).toHaveFocus();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("2026-10-05");
    expect(screen.getByRole("button", { name: /Booking date/ })).toHaveTextContent(
      "Mon, 5 Oct 2026"
    );
    expect(document.querySelector('input[type="hidden"][name="date"]')).toHaveValue("2026-10-05");
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("shows the placeholder, which the caller can change, and submits nothing until a pick", () => {
    const { container, rerender } = render(<DatePicker aria-label="Booking date" name="date" />);
    expect(screen.getByRole("button", { name: /Booking date/ })).toHaveTextContent("Pick a date");
    expect(container.querySelector('input[type="hidden"][name="date"]')).toHaveValue("");
    rerender(<DatePicker aria-label="Booking date" name="date" placeholder="Choose a day" />);
    expect(screen.getByRole("button", { name: /Booking date/ })).toHaveTextContent("Choose a day");
  });

  it("picks a day with a click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Booking date"
        defaultValue="2026-10-04"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /Booking date/ }));
    await user.click(dayButton("2026-10-20"));
    expect(onValueChange).toHaveBeenCalledWith("2026-10-20");
  });

  it("keeps the date when the chosen day is picked again", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Booking date"
        defaultValue="2026-10-04"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /Booking date/ }));
    await user.click(dayButton("2026-10-04"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Booking date/ })).toHaveTextContent(
      "Sun, 4 Oct 2026"
    );
  });

  it("disabled days cannot be chosen", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Booking date"
        defaultValue="2026-10-04"
        disabledDays={{ dayOfWeek: [1] }}
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /Booking date/ }));
    const monday = dayButton("2026-10-05");
    expect(monday).toBeDisabled();
    expect(monday.closest("td")).toHaveAttribute("data-disabled", "true");
    await user.click(monday);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("Escape closes and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Booking date" defaultValue="2026-10-04" />);
    const trigger = screen.getByRole("button", { name: /Booking date/ });
    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("grid")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("ArrowDown on the closed trigger opens the calendar", async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Booking date" defaultValue="2026-10-04" />);
    const trigger = screen.getByRole("button", { name: /Booking date/ });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("grid")).toBeVisible();
  });

  it("min and max disable days outside the range", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Booking date"
        defaultValue="2026-10-12"
        min="2026-10-10"
        max="2026-10-20"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /Booking date/ }));
    expect(dayButton("2026-10-09")).toBeDisabled();
    expect(dayButton("2026-10-21")).toBeDisabled();
    await user.click(dayButton("2026-10-15"));
    expect(onValueChange).toHaveBeenCalledWith("2026-10-15");
  });

  it("is controlled by value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DatePicker aria-label="Booking date" value="2026-10-04" onValueChange={onValueChange} />
    );
    const trigger = screen.getByRole("button", { name: /Booking date/ });
    await user.click(trigger);
    await user.click(dayButton("2026-10-20"));
    expect(onValueChange).toHaveBeenCalledWith("2026-10-20");
    expect(trigger).toHaveTextContent("Sun, 4 Oct 2026");
    rerender(<DatePicker aria-label="Booking date" value="2026-10-20" />);
    expect(trigger).toHaveTextContent("Tue, 20 Oct 2026");
    rerender(<DatePicker aria-label="Booking date" value="" />);
    expect(trigger).toHaveTextContent("Pick a date");
  });

  it("when disabled it cannot be opened and submits nothing", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DatePicker aria-label="Booking date" name="date" defaultValue="2026-10-04" disabled />
    );
    const trigger = screen.getByRole("button", { name: /Booking date/ });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("grid")).toBeNull();
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });

  it("wires field attributes: id, description, status and the trigger's ref-free semantics", () => {
    render(
      <DatePicker
        id="date"
        aria-label="Booking date"
        aria-describedby="date-message"
        status="error"
        defaultValue="2026-10-04"
      />
    );
    const trigger = screen.getByRole("button", { name: /Booking date/ });
    expect(trigger).toHaveAttribute("id", "date");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription(/date-message|Sun, 4 Oct 2026/);
    expect(trigger.getAttribute("aria-describedby")).toContain("date-message");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("merges sx onto the field box", () => {
    const { container } = render(<DatePicker aria-label="Booking date" sx={{ mt: 2 }} />);
    expect(container.firstElementChild).toHaveClass("mt-2");
  });

  it("is accessible closed and open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DatePicker aria-label="Booking date" defaultValue="2026-10-04" />
    );
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole("button", { name: /Booking date/ }));
    await expectNoA11yViolations(document.body);
  });

  it("defaultOpen starts with the calendar shown; inline renders the calendar in flow", () => {
    const { rerender } = render(<DatePicker aria-label="Booking date" defaultOpen />);
    expect(screen.getByRole("grid")).toBeVisible();
    rerender(<DatePicker aria-label="Booking date" inline defaultValue="2026-10-04" />);
    expect(screen.getByRole("grid")).toBeVisible();
    expect(screen.queryByRole("button", { name: /Booking date/ })).toBeNull();
  });

  it("renders Field around itself when given a label and error", () => {
    render(<DatePicker label="Booking date" error="Pick a day" />);
    expect(screen.getByRole("button", { name: "Booking date" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByText("Pick a day")).toBeInTheDocument();
  });
});

describe("Calendar", () => {
  it("starts the week on Monday", () => {
    render(<Calendar defaultMonth={OCTOBER} />);
    const headers = screen.getAllByRole("columnheader", { hidden: true });
    expect(headers[0]).toHaveAttribute("aria-label", "Monday");
    expect(headers[6]).toHaveAttribute("aria-label", "Sunday");
  });

  it("single mode selects a day and marks it selected", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="single" defaultMonth={OCTOBER} onSelect={onSelect} />);
    await user.click(dayButton("2026-10-14"));
    expect(onSelect).toHaveBeenCalledWith(new Date(2026, 9, 14));
  });

  it("shows a selected day as aria-selected", () => {
    render(<Calendar mode="single" selected={new Date(2026, 9, 14)} defaultMonth={OCTOBER} />);
    expect(dayButton("2026-10-14").closest("td")).toHaveAttribute("aria-selected", "true");
    expect(dayButton("2026-10-15").closest("td")).not.toHaveAttribute("aria-selected");
  });

  it("range mode selects a start and an end", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    function Range() {
      const [range, setRange] = useState<CalendarProps["selected"]>(undefined);
      return (
        <Calendar
          mode="range"
          defaultMonth={OCTOBER}
          selected={range}
          onSelect={(next) => {
            onSelect(next);
            setRange(next);
          }}
        />
      );
    }
    render(<Range />);
    await user.click(dayButton("2026-10-06"));
    await user.click(dayButton("2026-10-09"));
    expect(onSelect).toHaveBeenLastCalledWith({
      from: new Date(2026, 9, 6),
      to: new Date(2026, 9, 9),
    });
    expect(dayButton("2026-10-07").closest("td")).toHaveAttribute("aria-selected", "true");
  });

  it("disables days before fromDate and after toDate", () => {
    render(
      <Calendar
        mode="single"
        defaultMonth={OCTOBER}
        fromDate={new Date(2026, 9, 10)}
        toDate={new Date(2026, 9, 20)}
      />
    );
    expect(dayButton("2026-10-09")).toBeDisabled();
    expect(dayButton("2026-10-10")).toBeEnabled();
    expect(dayButton("2026-10-20")).toBeEnabled();
    expect(dayButton("2026-10-21")).toBeDisabled();
  });

  it("navigates between months with the nav buttons and stops at the limits", async () => {
    const user = userEvent.setup();
    render(
      <Calendar
        mode="single"
        defaultMonth={OCTOBER}
        fromDate={new Date(2026, 9, 10)}
        toDate={new Date(2026, 10, 20)}
      />
    );
    const previous = screen.getByRole("button", { name: /previous month/i });
    const next = screen.getByRole("button", { name: /next month/i });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    await user.click(next);
    expect(document.querySelector('td[data-day="2026-11-05"]')).not.toBeNull();
    expect(next).toHaveAttribute("aria-disabled", "true");
  });

  it("shows two months on request", () => {
    render(<Calendar mode="single" defaultMonth={OCTOBER} numberOfMonths={2} />);
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(document.querySelector('td[data-day="2026-11-05"]')).not.toBeNull();
  });

  it("merges sx", () => {
    const { container } = render(<Calendar defaultMonth={OCTOBER} sx={{ mt: 2 }} />);
    expect(container.firstElementChild).toHaveClass("mt-2");
  });

  it("ships no react-day-picker class wiring of its own: every part is a token class", () => {
    render(<Calendar mode="single" defaultMonth={OCTOBER} selected={new Date(2026, 9, 14)} />);
    const grid = screen.getByRole("grid");
    expect(
      within(grid.closest("div") as HTMLElement).getAllByRole("gridcell").length
    ).toBeGreaterThan(27);
    expect(document.querySelector('[class*="rdp-"]')).toBeNull();
  });

  it("is accessible, single and range", async () => {
    const single = render(
      <Calendar mode="single" defaultMonth={OCTOBER} selected={new Date(2026, 9, 14)} />
    );
    await expectNoA11yViolations(single.container);
    single.unmount();
    const range = render(
      <Calendar
        mode="range"
        defaultMonth={OCTOBER}
        selected={{ from: new Date(2026, 9, 6), to: new Date(2026, 9, 9) }}
        disabled={{ dayOfWeek: [1] }}
        numberOfMonths={2}
      />
    );
    await expectNoA11yViolations(range.container);
  });
});
