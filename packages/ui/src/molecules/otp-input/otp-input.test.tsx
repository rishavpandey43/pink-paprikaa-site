import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OtpInput } from "./otp-input";

/** Cells are queried by their accessible name, which is stable and one-based. */
const cell = (index: number, length = 4) =>
  screen.getByRole("textbox", { name: `Digit ${String(index + 1)} of ${String(length)}` });

describe("OtpInput", () => {
  it("renders six named cells inside a named group by default", () => {
    render(<OtpInput />);
    expect(screen.getByRole("group", { name: "One-time code" })).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    expect(cell(0, 6)).toBeInTheDocument();
  });

  it("renders a four-digit code when asked", () => {
    render(<OtpInput length={4} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
  });

  it("shows one digit per cell", () => {
    render(<OtpInput length={4} value="482" />);
    expect(cell(0)).toHaveValue("4");
    expect(cell(1)).toHaveValue("8");
    expect(cell(2)).toHaveValue("2");
    expect(cell(3)).toHaveValue("");
  });

  it("reports the whole code, not the single digit, and walks forward", async () => {
    const handleChange = vi.fn();
    render(<OtpInput length={4} onChange={handleChange} value="48" />);

    await userEvent.type(cell(2), "2");

    expect(handleChange).toHaveBeenCalledWith("482");
    expect(cell(3)).toHaveFocus();
  });

  it("keeps its own code when uncontrolled", async () => {
    render(<OtpInput length={4} />);

    await userEvent.type(cell(0), "4");

    expect(cell(0)).toHaveValue("4");
    expect(cell(1)).toHaveFocus();
  });

  it("spills a pasted code across the cells that follow", async () => {
    const handleChange = vi.fn();
    render(<OtpInput length={4} onChange={handleChange} value="" />);

    await userEvent.click(cell(0));
    await userEvent.paste("4821");

    expect(handleChange).toHaveBeenCalledWith("4821");
  });

  it("ignores anything that is not a digit", async () => {
    const handleChange = vi.fn();
    render(<OtpInput length={4} onChange={handleChange} value="" />);

    await userEvent.type(cell(0), "a");

    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("walks back to the previous cell on Backspace in an empty one", async () => {
    const handleChange = vi.fn();
    render(<OtpInput length={4} onChange={handleChange} value="48" />);

    await userEvent.click(cell(2));
    await userEvent.keyboard("{Backspace}");

    expect(handleChange).toHaveBeenCalledWith("4");
    expect(cell(1)).toHaveFocus();
  });

  it("moves between cells with the arrow keys", async () => {
    render(<OtpInput length={4} value="4821" />);

    await userEvent.click(cell(2));
    await userEvent.keyboard("{ArrowLeft}");
    expect(cell(1)).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(cell(2)).toHaveFocus();
  });

  it("gives a filled cell the brand border and leaves an empty one thin", () => {
    render(<OtpInput length={4} value="4" />);
    expect(cell(0)).toHaveClass("border-brand-primary");
    expect(cell(1)).not.toHaveClass("border-brand-primary");
  });

  it.each([
    ["error", "border-(--field-border-error)"],
    ["success", "border-(--field-border-success)"],
    ["warning", "border-(--field-border-warning)"],
  ] as const)("outranks the filled border with the %s status", (status, expected) => {
    render(<OtpInput length={4} message="Check that code." status={status} value="4821" />);
    expect(cell(0)).toHaveClass(expected);
    expect(cell(0)).not.toHaveClass("border-brand-primary");
  });

  it("marks every cell invalid only on the error status", () => {
    const { rerender } = render(
      <OtpInput length={4} message="That code has expired." status="error" value="1234" />
    );
    expect(cell(0)).toHaveAttribute("aria-invalid", "true");

    rerender(<OtpInput length={4} message="Verified." status="success" value="1234" />);
    expect(cell(0)).not.toHaveAttribute("aria-invalid");
  });

  it("replaces the hint with the status message", () => {
    render(
      <OtpInput
        hint="The code lasts 10 minutes."
        length={4}
        message="That code has expired. Send a new one?"
        status="error"
        value="1234"
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("That code has expired.");
    expect(screen.queryByText("The code lasts 10 minutes.")).not.toBeInTheDocument();
  });

  it("takes no typing and keeps a real grey fill when disabled", async () => {
    const handleChange = vi.fn();
    render(<OtpInput length={4} onChange={handleChange} status="disabled" value="48" />);

    await userEvent.type(cell(2), "2");

    expect(cell(2)).toBeDisabled();
    expect(handleChange).not.toHaveBeenCalled();
    expect(cell(0)).toHaveClass("disabled:bg-(--field-bg-disabled)");
    expect(cell(0).className).not.toMatch(/opacity-/);
  });

  it("describes the group with whatever line is showing", () => {
    render(<OtpInput hint="The code lasts 10 minutes." length={4} />);
    const group = screen.getByRole("group", { name: "One-time code" });
    const describedBy = group.getAttribute("aria-describedby");
    expect(describedBy).not.toBeNull();
    expect(screen.getByText("The code lasts 10 minutes.")).toHaveAttribute("id", describedBy);
  });

  it("merges a caller className", () => {
    const { container } = render(<OtpInput className="gap-6" length={4} />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <OtpInput hint="The code lasts 10 minutes." length={4} value="482" />
        <OtpInput
          label="Sign-in code"
          length={4}
          message="That code has expired. Send a new one?"
          status="error"
          value="1234"
        />
        <OtpInput label="Expired code" length={4} status="disabled" value="48" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
