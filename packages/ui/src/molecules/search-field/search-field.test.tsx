import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SearchField } from "./search-field";

describe("SearchField", () => {
  it("is a named, empty search box in a pill-shaped light field", () => {
    render(<SearchField label="Search the menu" />);
    const box = screen.getByRole("searchbox", { name: "Search the menu" });
    expect(box).toHaveValue("");
    expect(box.parentElement).toHaveClass("rounded-pill", "px-4");
    expect(box.parentElement).toHaveAttribute("data-surface", "light");
  });

  it.each([
    ["sm", "h-field-sm"],
    ["md", "h-field-md"],
  ] as const)("renders the %s size at its fixed height", (size, height) => {
    render(<SearchField label="Search the menu" size={size} />);
    expect(screen.getByRole("searchbox").parentElement).toHaveClass(height);
  });

  it("keeps and reports what is typed when uncontrolled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchField label="Search the menu" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("searchbox"), "paneer");
    expect(screen.getByRole("searchbox")).toHaveValue("paneer");
    expect(onValueChange).toHaveBeenLastCalledWith("paneer");
  });

  it("shows the caller's value when controlled and only reports keystrokes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchField label="Search the menu" value="chai" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("searchbox"), "s");
    expect(onValueChange).toHaveBeenCalledWith("chais");
    expect(screen.getByRole("searchbox")).toHaveValue("chai");
  });

  it("offers a clear button only when there is something to clear", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search the menu" />);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "kulfi");
    const clear = screen.getByRole("button", { name: "Clear search" });
    // A 24px glyph button with a 40px hit area (dev parity; spec §5.5 floor is 24px).
    expect(clear).toHaveClass("size-6", "before:-inset-2");
  });

  it("names the clear button by clearLabel", () => {
    render(
      <SearchField label="Search the menu" defaultValue="paneer" clearLabel="Clear dish search" />
    );
    expect(screen.getByRole("button", { name: "Clear dish search" })).toBeInTheDocument();
  });

  it("clears, reports, notifies onClear and puts focus back in the box", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    render(
      <SearchField
        label="Search the menu"
        defaultValue="paneer"
        onValueChange={onValueChange}
        onClear={onClear}
      />
    );
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    const box = screen.getByRole("searchbox");
    expect(box).toHaveValue("");
    expect(box).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("is busy, pulses the brand mark and offers no clear button while results load", () => {
    const { container } = render(
      <SearchField label="Search the menu" defaultValue="kulfi" isLoading />
    );
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[class*="animate-mark-pulse"]')).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("turns the hint into a status message with its glyph, and marks an error invalid", () => {
    const { container, rerender } = render(
      <SearchField
        label="Search the menu"
        defaultValue="pizza"
        status="warning"
        hint="Nothing matches that. Try another dish."
      />
    );
    const box = screen.getByRole("searchbox");
    expect(box).toHaveAccessibleDescription("Nothing matches that. Try another dish.");
    expect(box).not.toHaveAttribute("aria-invalid");
    expect(container.querySelectorAll("p svg")).toHaveLength(1);
    // The box raises its border to 2px and hangs the status glyph: glass, glyph and clear X.
    expect(box.parentElement).toHaveClass("border-2", "border-status-warning");
    expect(box.parentElement?.querySelectorAll("svg")).toHaveLength(3);
    rerender(
      <SearchField
        label="Search the menu"
        defaultValue="pizza"
        status="error"
        hint="Search is down. Try again."
      />
    );
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("keeps a caller's own aria-describedby beside the hint", () => {
    render(
      <>
        <p id="scope">Searches the Sector 57 menu.</p>
        <SearchField label="Search the menu" aria-describedby="scope" hint="Try a dish name." />
      </>
    );
    expect(screen.getByRole("searchbox")).toHaveAccessibleDescription(
      "Searches the Sector 57 menu. Try a dish name."
    );
  });

  it("takes no typing and never offers to clear a disabled box, greyed by a fill, not opacity", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SearchField
        label="Search the menu"
        defaultValue="chai"
        disabled
        onValueChange={onValueChange}
      />
    );
    const box = screen.getByRole("searchbox");
    await user.type(box, "paneer");
    expect(box).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(box.parentElement?.className).not.toMatch(/opacity-/);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("never offers to clear a read-only box", () => {
    render(<SearchField label="Search the menu" defaultValue="chai" readOnly />);
    expect(screen.getByRole("searchbox")).toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<SearchField label="Search the menu" className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-1.5");
  });

  it("forwards ref, name and onBlur for react-hook-form's Controller", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(<SearchField label="Search the menu" name="q" ref={ref} onBlur={onBlur} />);
    const box = screen.getByRole("searchbox");
    expect(ref.current).toBe(box);
    expect(box).toHaveAttribute("name", "q");
    await user.click(box);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations empty or with a value and a hint", async () => {
    const { container } = render(
      <>
        <SearchField label="Search the menu" />
        <SearchField
          label="Search outlets"
          size="sm"
          defaultValue="pizza"
          status="warning"
          hint="Nothing matches that."
        />
        <SearchField label="Search unavailable" size="sm" disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
