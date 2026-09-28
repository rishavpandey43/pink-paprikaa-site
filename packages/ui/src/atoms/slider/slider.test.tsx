import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Slider } from "./slider";

describe("Slider", () => {
  it("is a native range named by its label", () => {
    render(<Slider label="Guests" min={15} max={300} step={5} defaultValue={60} />);
    const slider = screen.getByRole("slider", { name: "Guests" });
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "15");
    expect(slider).toHaveAttribute("max", "300");
    expect(slider).toHaveAttribute("step", "5");
    expect(slider).toHaveValue("60");
  });

  it("is full width, 32px tall and brand-accented", () => {
    render(<Slider label="Guests" />);
    expect(screen.getByRole("slider")).toHaveClass("w-full", "h-8", "accent-pink-500");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native range", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("guests");
    render(<Slider label="Guests" min={15} max={300} step={5} {...field} />);
    const slider = screen.getByRole("slider");

    expect(field.ref).toHaveBeenCalledWith(slider);
    expect(slider).toHaveAttribute("name", "guests");
    fireEvent.change(slider, { target: { value: "120" } });
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(slider).toHaveFocus();
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("merges a consumer className", () => {
    render(<Slider label="Meals a day" className="max-w-text-measure-prose" />);
    expect(screen.getByRole("slider")).toHaveClass("max-w-text-measure-prose", "w-full");
  });

  it("disables natively", () => {
    render(<Slider label="Guests" disabled />);
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Slider label="Guests" min={15} max={300} defaultValue={60} />);
    await expectNoA11yViolations(container);
  });
});
