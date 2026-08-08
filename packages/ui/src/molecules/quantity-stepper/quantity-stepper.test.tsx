import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { QuantityStepper } from "./quantity-stepper";

describe("QuantityStepper", () => {
  it("renders a named group around the count and both buttons", () => {
    render(<QuantityStepper defaultValue={2} />);
    const group = screen.getByRole("group", { name: "Quantity" });
    expect(group).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: "Remove One" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add One" })).toBeInTheDocument();
  });

  it("counts up and down on its own when uncontrolled", async () => {
    render(<QuantityStepper defaultValue={2} />);

    await userEvent.click(screen.getByRole("button", { name: "Add One" }));
    expect(screen.getByRole("group")).toHaveTextContent("3");

    await userEvent.click(screen.getByRole("button", { name: "Remove One" }));
    expect(screen.getByRole("group")).toHaveTextContent("2");
  });

  it("leaves the count to the caller when controlled", async () => {
    const handleChange = vi.fn();
    render(<QuantityStepper onChange={handleChange} value={2} />);

    await userEvent.click(screen.getByRole("button", { name: "Add One" }));

    expect(handleChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("group")).toHaveTextContent("2");
  });

  it("stops at the minimum and disables the minus button there", async () => {
    const handleChange = vi.fn();
    render(<QuantityStepper min={1} onChange={handleChange} value={1} />);

    const minus = screen.getByRole("button", { name: "Remove One" });
    expect(minus).toBeDisabled();

    await userEvent.click(minus);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("reaches zero when zero removes the line item", async () => {
    const handleChange = vi.fn();
    render(<QuantityStepper min={0} onChange={handleChange} value={1} />);

    await userEvent.click(screen.getByRole("button", { name: "Remove One" }));

    expect(handleChange).toHaveBeenCalledWith(0);
  });

  it("stops at the maximum and disables the plus button there", async () => {
    const handleChange = vi.fn();
    render(<QuantityStepper max={5} onChange={handleChange} value={5} />);

    const plus = screen.getByRole("button", { name: "Add One" });
    expect(plus).toBeDisabled();

    await userEvent.click(plus);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("names the dish when the caller says which one this is", () => {
    render(
      <QuantityStepper
        decrementLabel="Remove One Paneer Tikka"
        incrementLabel="Add One Paneer Tikka"
        label="Paneer Tikka quantity"
      />
    );
    expect(screen.getByRole("group", { name: "Paneer Tikka quantity" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add One Paneer Tikka" })).toBeInTheDocument();
  });

  it.each([
    ["sm", "size-(--button-h-sm)"],
    ["md", "size-(--button-h-md)"],
  ] as const)("renders the %s size at its fixed height", (size, expected) => {
    render(<QuantityStepper size={size} />);
    expect(screen.getByRole("button", { name: "Add One" })).toHaveClass(expected);
  });

  it("announces the count as it changes", () => {
    render(<QuantityStepper value={3} />);
    expect(screen.getByText("3")).toHaveAttribute("aria-live", "polite");
  });

  it("keeps a real grey glyph at the end of the range rather than fading out", () => {
    render(<QuantityStepper min={1} value={1} />);
    const minus = screen.getByRole("button", { name: "Remove One" });
    expect(minus).toHaveClass("disabled:text-(--button-fg-disabled)");
    expect(minus.className).not.toMatch(/opacity-/);
  });

  it("merges a caller className", () => {
    render(<QuantityStepper className="rounded-1" />);
    const group = screen.getByRole("group");
    expect(group).toHaveClass("rounded-1");
    expect(group).not.toHaveClass("rounded-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <QuantityStepper defaultValue={2} min={1} />
        <QuantityStepper label="Gulab Jamun quantity" size="sm" value={0} />
        <QuantityStepper label="Masala Chai quantity" max={5} value={5} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
