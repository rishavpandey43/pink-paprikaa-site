import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SearchField } from "./search-field";

const NAME = "Search the menu";

describe("SearchField", () => {
  it("renders a named search box with a dish-shaped placeholder", () => {
    render(<SearchField />);
    const control = screen.getByRole("searchbox", { name: NAME });
    expect(control).toHaveAttribute("type", "search");
    expect(control).toHaveAttribute("placeholder", "Search chai, paneer, kulfi");
  });

  it("takes the caller's accessible name", () => {
    render(<SearchField label="Search outlets" />);
    expect(screen.getByRole("searchbox", { name: "Search outlets" })).toBeInTheDocument();
  });

  it("passes what is typed to onChange", async () => {
    const handleChange = vi.fn();
    render(<SearchField onChange={handleChange} />);

    await userEvent.type(screen.getByRole("searchbox", { name: NAME }), "kul");

    expect(handleChange).toHaveBeenCalledTimes(3);
  });

  it("offers a clear button only once there is a query", () => {
    const handleClear = vi.fn();
    const { rerender } = render(<SearchField onClear={handleClear} onChange={vi.fn()} value="" />);
    expect(screen.queryByRole("button", { name: "Clear Search" })).not.toBeInTheDocument();

    rerender(<SearchField onClear={handleClear} onChange={vi.fn()} value="paneer" />);
    expect(screen.getByRole("button", { name: "Clear Search" })).toBeInTheDocument();
  });

  it("calls onClear when the clear button is pressed", async () => {
    const handleClear = vi.fn();
    render(<SearchField onClear={handleClear} onChange={vi.fn()} value="paneer" />);

    await userEvent.click(screen.getByRole("button", { name: "Clear Search" }));

    expect(handleClear).toHaveBeenCalledOnce();
  });

  it("hides the clear button while results are loading", () => {
    render(<SearchField onClear={vi.fn()} onChange={vi.fn()} status="loading" value="kulfi" />);
    expect(screen.queryByRole("button", { name: "Clear Search" })).not.toBeInTheDocument();
  });

  it.each([
    ["sm", "h-10"],
    ["md", "h-(--field-h)"],
  ] as const)("renders the %s size at its fixed height", (size, expected) => {
    render(<SearchField size={size} />);
    expect(screen.getByRole("searchbox").parentElement).toHaveClass(expected);
  });

  it.each([
    ["error", "border-(--field-border-error)"],
    ["success", "border-(--field-border-success)"],
    ["warning", "border-(--field-border-warning)"],
  ] as const)("raises the %s border to 2px and hangs its glyph", (status, expected) => {
    const { container } = render(<SearchField message="Nothing matches that." status={status} />);
    const control = screen.getByRole("searchbox").parentElement;
    expect(control).toHaveClass(expected);
    expect(control).toHaveClass("border-2");
    // The search glass, the trailing status glyph and the same glyph beside the message.
    expect(container.querySelectorAll("svg")).toHaveLength(3);
  });

  it("marks itself invalid only on the error status", () => {
    const { rerender } = render(<SearchField message="Nothing matches that." status="error" />);
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-invalid", "true");

    rerender(<SearchField message="Nothing matches that." status="warning" />);
    expect(screen.getByRole("searchbox")).not.toHaveAttribute("aria-invalid");
  });

  it("replaces the hint with the status message", () => {
    render(
      <SearchField
        hint="34 dishes match."
        message="Nothing matches that. Try another dish."
        status="warning"
      />
    );
    expect(screen.getByText("Nothing matches that. Try another dish.")).toBeInTheDocument();
    expect(screen.queryByText("34 dishes match.")).not.toBeInTheDocument();
  });

  it("describes the control with whatever line is showing", () => {
    render(<SearchField hint="34 dishes match." />);
    const control = screen.getByRole("searchbox");
    const describedBy = control.getAttribute("aria-describedby");
    expect(describedBy).not.toBeNull();
    expect(screen.getByText("34 dishes match.")).toHaveAttribute("id", describedBy);
  });

  it("takes no typing and keeps a real grey fill when the status is disabled", async () => {
    const handleChange = vi.fn();
    render(<SearchField onChange={handleChange} status="disabled" />);

    const control = screen.getByRole("searchbox", { name: NAME });
    await userEvent.type(control, "paneer");

    expect(control).toBeDisabled();
    expect(handleChange).not.toHaveBeenCalled();
    expect(control.parentElement).toHaveClass("bg-(--field-bg-disabled)");
    expect(control.parentElement?.className).not.toMatch(/opacity-/);
  });

  it("hangs the pulsing diamond on the trailing edge while loading", () => {
    const { container } = render(<SearchField onChange={vi.fn()} status="loading" value="kulfi" />);
    expect(container.querySelector(".animate-pp-pulse")).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(<SearchField className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-1-5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <SearchField onChange={vi.fn()} onClear={vi.fn()} value="paneer" />
        <SearchField
          label="Search outlets"
          message="Nothing matches that. Try another dish."
          onChange={vi.fn()}
          status="warning"
          value="pizza"
        />
        <SearchField label="Search unavailable" size="sm" status="disabled" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
