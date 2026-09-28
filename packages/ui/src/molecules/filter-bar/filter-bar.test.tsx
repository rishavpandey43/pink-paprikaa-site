import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Clock, Flame } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { FilterBar } from "./filter-bar";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "small-plates", label: "Small Plates" },
  { value: "all-day", label: "All Day" },
  { value: "sweets", label: "Sweets" },
];

describe("FilterBar", () => {
  it("is a named radio group with the first option chosen by default", () => {
    render(<FilterBar label="Menu category" options={CATEGORIES} />);
    expect(screen.getByRole("radiogroup", { name: "Menu category" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute("aria-checked", "true");
  });

  it("chooses a filter on click and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FilterBar label="Menu category" options={CATEGORIES} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("radio", { name: "Sweets" }));
    expect(screen.getByRole("radio", { name: "Sweets" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("sweets");
  });

  it("keeps exactly one filter chosen when the chosen one is pressed again", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <FilterBar
        label="Menu category"
        options={CATEGORIES}
        defaultValue="sweets"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("radio", { name: "Sweets" }));
    expect(screen.getByRole("radio", { name: "Sweets" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("moves with the arrow keys and chooses with Space", async () => {
    const user = userEvent.setup();
    render(<FilterBar label="Menu category" options={CATEGORIES} />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "All" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Small Plates" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Small Plates" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("follows a controlled value", () => {
    const { rerender } = render(
      <FilterBar label="Menu category" options={CATEGORIES} value="all-day" />
    );
    expect(screen.getByRole("radio", { name: "All Day" })).toHaveAttribute("aria-checked", "true");
    rerender(<FilterBar label="Menu category" options={CATEGORIES} value="sweets" />);
    expect(screen.getByRole("radio", { name: "Sweets" })).toHaveAttribute("aria-checked", "true");
  });

  it("scrolls on one line by default and wraps on request", () => {
    const { container, rerender } = render(
      <FilterBar label="Menu category" options={CATEGORIES} />
    );
    // The group scrolls, not the root, so the note and the trailing slot stay pinned in view.
    expect(screen.getByRole("radiogroup")).toHaveClass("overflow-x-auto", "flex-nowrap");
    expect(container.firstElementChild).not.toHaveClass("overflow-x-auto");
    rerender(<FilterBar label="Menu category" options={CATEGORIES} isWrapping />);
    expect(container.firstElementChild).toHaveClass("flex-wrap");
  });

  it("pins the statement badge and the trailing slot after the filters", () => {
    render(
      <FilterBar
        label="Menu category"
        options={CATEGORIES}
        note="100% Vegetarian"
        trailing={<button type="button">Search</button>}
      />
    );
    expect(screen.getByText("100% Vegetarian")).toBeInTheDocument();
    // A standing statement, never a filter: still exactly one radio per option.
    expect(screen.getAllByRole("radio")).toHaveLength(CATEGORIES.length);
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("lets a caller className replace its own gap", () => {
    const { container } = render(
      <FilterBar label="Menu category" options={CATEGORIES} className="gap-1" />
    );
    expect(container.firstElementChild).toHaveClass("gap-1");
    expect(container.firstElementChild).not.toHaveClass("gap-2.5");
  });

  it("has no accessibility violations with icons, note and trailing", async () => {
    const { container } = render(
      <FilterBar
        label="Dietary and speed filters"
        options={[
          { value: "spicy", label: "Hot", icon: Flame },
          { value: "quick", label: "Under 15 min", icon: Clock },
        ]}
        note="100% Vegetarian"
        isWrapping
      />
    );
    await expectNoA11yViolations(container);
  });
});
