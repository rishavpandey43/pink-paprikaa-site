import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Users } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Select } from "./select";

/**
 * Radix's Select popover is built on pointer capture, `scrollIntoView` and a `ResizeObserver` —
 * three browser APIs jsdom does not implement. They are stubbed here rather than in
 * `vitest.setup.ts` because this is the only suite that opens a portalled popover, and a global
 * stub would quietly hide the same gap from a component that genuinely needs measuring.
 */
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe = () => undefined;
    unobserve = () => undefined;
    disconnect = () => undefined;
  };
  Element.prototype.scrollIntoView = () => undefined;
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
});

const OUTLETS = ["Sector 57", "MKM Market"];
const NAME = "Pick your outlet";

describe("Select", () => {
  it("renders a closed combobox showing its placeholder", () => {
    render(<Select aria-label={NAME} options={OUTLETS} placeholder="Choose an outlet" />);
    const trigger = screen.getByRole("combobox", { name: NAME });
    expect(trigger).toHaveTextContent("Choose an outlet");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("shows the chosen value instead of the placeholder", () => {
    render(<Select aria-label={NAME} defaultValue="Sector 57" options={OUTLETS} />);
    expect(screen.getByRole("combobox", { name: NAME })).toHaveTextContent("Sector 57");
  });

  it("opens on click and reports the option the reader picks", async () => {
    const handleValueChange = vi.fn();
    render(<Select aria-label={NAME} onValueChange={handleValueChange} options={OUTLETS} />);

    await userEvent.click(screen.getByRole("combobox", { name: NAME }));
    expect(screen.getAllByRole("option")).toHaveLength(2);

    await userEvent.click(screen.getByRole("option", { name: "MKM Market" }));

    expect(handleValueChange).toHaveBeenCalledWith("MKM Market");
    expect(screen.getByRole("combobox", { name: NAME })).toHaveTextContent("MKM Market");
  });

  it("opens from the keyboard", async () => {
    render(<Select aria-label={NAME} options={OUTLETS} />);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("takes labelled options and can disable one of them", async () => {
    render(
      <Select
        aria-label="Pickup slot"
        options={[
          { value: "1930", label: "7:30pm" },
          { value: "2000", label: "8:00pm", disabled: true },
        ]}
      />
    );

    await userEvent.click(screen.getByRole("combobox", { name: "Pickup slot" }));

    expect(screen.getByRole("option", { name: "7:30pm" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "8:00pm" })).toHaveAttribute("data-disabled");
  });

  it.each([
    ["sm", "h-10"],
    ["md", "h-(--field-h)"],
    ["lg", "h-14"],
  ] as const)("renders the %s size at its fixed height", (size, expected) => {
    render(<Select aria-label={NAME} options={OUTLETS} size={size} />);
    expect(screen.getByRole("combobox")).toHaveClass(expected);
  });

  it.each([
    ["error", "border-(--field-border-error)"],
    ["success", "border-(--field-border-success)"],
    ["warning", "border-(--field-border-warning)"],
  ] as const)("draws the %s border", (status, expected) => {
    render(<Select aria-label={NAME} options={OUTLETS} status={status} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass(expected);
    expect(trigger).toHaveClass("border-2");
  });

  it("marks itself invalid only on the error status", () => {
    const { rerender } = render(<Select aria-label={NAME} options={OUTLETS} status="error" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");

    rerender(<Select aria-label={NAME} options={OUTLETS} status="warning" />);
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });

  it("renders a leading glyph beside the value", () => {
    const { container } = render(
      <Select aria-label="Guests" icon={Users} options={["2 guests", "4 guests"]} />
    );
    // The leading glyph plus the trailing chevron.
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("will not open while read-only, and shows a lock", async () => {
    render(<Select aria-label="Outlet" defaultValue="Sector 57" isReadOnly options={OUTLETS} />);

    const trigger = screen.getByRole("combobox", { name: "Outlet" });
    await userEvent.click(trigger);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveClass("bg-(--field-bg-readonly)");
  });

  it("keeps a real grey fill when disabled rather than fading out", () => {
    render(<Select aria-label="Delivery slot" disabled options={OUTLETS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("bg-(--field-bg-disabled)");
    expect(trigger.className).not.toMatch(/opacity-/);
  });

  it("merges a caller className onto the trigger", () => {
    render(<Select aria-label={NAME} className="rounded-6" options={OUTLETS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("rounded-6");
    expect(trigger).not.toHaveClass("rounded-3");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Select aria-label={NAME} options={OUTLETS} placeholder="Choose an outlet" />
        <Select
          aria-label="Guests"
          icon={Users}
          options={["2 guests", "4 guests"]}
          status="error"
        />
        <Select aria-label="Delivery slot" disabled options={OUTLETS} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
