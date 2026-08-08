import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Clock, Flame, Leaf } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { FilterBar } from "./filter-bar";

const CATEGORIES = ["All", "Small Plates", "All Day", "Chai & Coffee", "Sweets"];

describe("FilterBar", () => {
  it("renders one pill per category inside a named group", () => {
    render(<FilterBar options={CATEGORIES} value="All" />);

    const group = screen.getByRole("group", { name: "Filter by category" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(CATEGORIES.length);
  });

  it("takes a caller-written group name", () => {
    render(<FilterBar label="Filter the menu by category" options={CATEGORIES} />);

    expect(screen.getByRole("group", { name: "Filter the menu by category" })).toBeInTheDocument();
  });

  it("marks exactly one pill as pressed", () => {
    render(<FilterBar options={CATEGORIES} value="Sweets" />);

    expect(screen.getByRole("button", { name: "Sweets", pressed: true })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(CATEGORIES.length - 1);
  });

  it("reports the pressed pill's value", async () => {
    const handleChange = vi.fn();
    render(<FilterBar onChange={handleChange} options={CATEGORIES} value="All" />);

    await userEvent.click(screen.getByRole("button", { name: "Small Plates" }));

    expect(handleChange).toHaveBeenCalledExactlyOnceWith("Small Plates");
  });

  it("keeps an option's value separate from its label", async () => {
    const handleChange = vi.fn();
    render(
      <FilterBar
        onChange={handleChange}
        options={[
          { value: "jain", label: "Jain", icon: Leaf },
          { value: "spicy", label: "Hot", icon: Flame },
          { value: "quick", label: "Under 15 Min", icon: Clock },
        ]}
        value="jain"
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Under 15 Min" }));

    expect(handleChange).toHaveBeenCalledExactlyOnceWith("quick");
  });

  it("scrolls on one line by default and wraps when asked", () => {
    const { container, rerender } = render(<FilterBar options={CATEGORIES} />);
    expect(container.firstElementChild).toHaveClass("overflow-x-auto");

    rerender(<FilterBar isWrapping options={CATEGORIES} />);
    expect(container.firstElementChild).toHaveClass("flex-wrap");
    expect(container.firstElementChild).not.toHaveClass("overflow-x-auto");
  });

  it("pins the standing statement after the pills as a badge, not a filter", () => {
    render(<FilterBar note="100% Vegetarian Kitchen" options={CATEGORIES} value="All" />);

    expect(screen.getByText("100% Vegetarian Kitchen")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(CATEGORIES.length);
  });

  it("renders a trailing control at the end of the rail", () => {
    render(
      <FilterBar
        options={CATEGORIES}
        trailing={<button type="button">Clear All</button>}
        value="All"
      />
    );

    expect(screen.getByRole("button", { name: "Clear All" })).toBeInTheDocument();
  });

  it("does nothing when no handler is wired", async () => {
    render(<FilterBar options={CATEGORIES} value="All" />);

    await userEvent.click(screen.getByRole("button", { name: "Sweets" }));

    expect(screen.getByRole("button", { name: "All", pressed: true })).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(<FilterBar className="gap-1" options={CATEGORIES} />);

    expect(container.firstElementChild).toHaveClass("gap-1");
    expect(container.firstElementChild).not.toHaveClass("gap-2.5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <FilterBar
        isWrapping
        note="100% Vegetarian Kitchen"
        options={CATEGORIES}
        trailing={<button type="button">Clear All</button>}
        value="All"
      />
    );
    await expectNoA11yViolations(container);
  });
});
