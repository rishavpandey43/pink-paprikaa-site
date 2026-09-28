import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OtpInput } from "./otp-input";

function cells(container: HTMLElement): Element[] {
  return [...container.querySelectorAll("[data-state]")];
}

function cellDigits(container: HTMLElement): string[] {
  return cells(container).map((cell) => cell.textContent);
}

describe("OtpInput", () => {
  it("is one labelled code field that phones can autofill", () => {
    const { container } = render(<OtpInput label="Login code" />);
    const input = screen.getByRole("textbox", { name: "Login code" });
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).not.toHaveAttribute("maxlength");
    expect(cellDigits(container)).toEqual(["", "", "", "", "", ""]);
  });

  it("fills the cells in order as digits are typed, and reports the code", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<OtpInput label="Login code" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("textbox"), "482");
    expect(cellDigits(container)).toEqual(["4", "8", "2", "", "", ""]);
    expect(onValueChange).toHaveBeenLastCalledWith("482");
  });

  it("fills every cell from a pasted code, ignoring spaces and dashes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<OtpInput label="Login code" onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.paste("48-21 93");
    expect(input).toHaveValue("482193");
    expect(cellDigits(container)).toEqual(["4", "8", "2", "1", "9", "3"]);
    expect(onValueChange).toHaveBeenLastCalledWith("482193");
  });

  it("drops digits past the code length from a paste", async () => {
    const user = userEvent.setup();
    render(<OtpInput label="Login code" length={4} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.paste("4821 93");
    expect(input).toHaveValue("4821");
  });

  it("ignores letters and symbols typed into the field", async () => {
    const user = userEvent.setup();
    render(<OtpInput label="Login code" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "4a8$");
    expect(input).toHaveValue("48");
  });

  it("deletes back across the cells with Backspace", async () => {
    const user = userEvent.setup();
    const { container } = render(<OtpInput label="Login code" length={4} />);
    await user.type(screen.getByRole("textbox"), "4821{Backspace}{Backspace}");
    expect(cellDigits(container)).toEqual(["4", "8", "", ""]);
  });

  it("marks the next empty cell active only while the field has focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<OtpInput label="Login code" length={4} />);
    await user.type(screen.getByRole("textbox"), "48");
    expect(cells(container).map((cell) => cell.getAttribute("data-state"))).toEqual([
      "filled",
      "filled",
      "active",
      "empty",
    ]);
    await user.tab();
    expect(cells(container).map((cell) => cell.getAttribute("data-state"))).toEqual([
      "filled",
      "filled",
      "empty",
      "empty",
    ]);
  });

  it("shows the caller's code when controlled and only reports input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<OtpInput label="Login code" value="12" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("textbox"), "3");
    expect(onValueChange).toHaveBeenCalledWith("123");
    expect(screen.getByRole("textbox")).toHaveValue("12");
  });

  it("describes the field with its status message and marks only an error invalid", () => {
    const { rerender } = render(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="1234"
        status="error"
        message="That code has expired. Send a new one?"
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("That code has expired. Send a new one?");
    rerender(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="4821"
        status="success"
        message="Verified. Signing you in."
      />
    );
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription("Verified. Signing you in.");
  });

  it("renders four cells for a four-digit code", () => {
    const { container } = render(<OtpInput label="Login code" length={4} />);
    expect(cells(container)).toHaveLength(4);
  });

  it("gives a filled cell the brand border, and lets a status outrank it", () => {
    const { container, rerender } = render(
      <OtpInput label="Login code" length={4} defaultValue="4" />
    );
    const [first, second] = cells(container);
    expect(first).toHaveClass("border-2", "border-border-brand");
    expect(second).not.toHaveClass("border-border-brand");
    // The whole code is wrong, not one cell: the status colour wins over the filled border.
    rerender(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="4"
        status="error"
        message="That code has expired."
      />
    );
    expect(cells(container)[0]).toHaveClass("border-status-danger");
    expect(cells(container)[0]).not.toHaveClass("border-border-brand");
  });

  it("shows a hint as its message on the default status, describing the field politely", () => {
    render(<OtpInput label="Login code" message="The code lasts 10 minutes." />);
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription("The code lasts 10 minutes.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<OtpInput label="Login code" className="gap-6" />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("keeps the invisible caret at the end, so a digit always lands in the next empty cell", async () => {
    const user = userEvent.setup();
    const { container } = render(<OtpInput label="Login code" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "48");
    await user.keyboard("{ArrowLeft}{ArrowLeft}2");
    expect(cellDigits(container)).toEqual(["4", "8", "2", "", "", ""]);
  });

  it("gives react-hook-form's Controller a name, onBlur and a focusable ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(<OtpInput label="Login code" name="otp" ref={ref} onBlur={onBlur} />);
    const input = screen.getByRole("textbox");
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "otp");
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("takes no typing and greys every cell with a fill, never opacity, when disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <OtpInput
        label="Login code"
        length={4}
        defaultValue="48"
        disabled
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByRole("textbox");
    await user.type(input, "2");
    expect(input).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
    for (const cell of cells(container)) {
      expect(cell).toHaveClass(
        "bg-ink-100",
        "border-border-subtle",
        "text-ink-400",
        "cursor-not-allowed"
      );
      expect(cell).not.toHaveClass("border-border-brand");
      expect(cell.className).not.toMatch(/opacity-/);
    }
  });

  it("has no accessibility violations empty or in error", async () => {
    const { container } = render(
      <>
        <OtpInput label="Login code" />
        <OtpInput
          label="Confirm code"
          length={4}
          defaultValue="1234"
          status="error"
          message="That code has expired. Send a new one?"
        />
        <OtpInput label="Expired code" length={4} defaultValue="48" disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
