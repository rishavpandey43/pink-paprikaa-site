import { render, screen } from "@testing-library/react";
import { Search } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("names what is missing and says what to do next", () => {
    render(<EmptyState />);
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();
    expect(screen.getByText("Let's fix that.")).toBeInTheDocument();
  });

  it("takes the caller's copy", () => {
    render(<EmptyState body="Try another category." title="Nothing matches that yet." />);
    expect(screen.getByText("Nothing matches that yet.")).toBeInTheDocument();
    expect(screen.getByText("Try another category.")).toBeInTheDocument();
  });

  it("draws the glyph at 32px", () => {
    const { container } = render(<EmptyState icon={Search} />);
    const glyph = container.querySelector("svg");
    expect(glyph).toHaveClass("size-8");
    expect(glyph).toHaveClass("text-pink-300");
  });

  it("swaps the glyph for the brand diamond", () => {
    const { container } = render(<EmptyState hasSymbol />);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["md", "py-10"],
    ["lg", "py-16"],
  ] as const)("breathes more at %s", (size, expected) => {
    const { container } = render(<EmptyState size={size} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("renders exactly one action", () => {
    render(<EmptyState action={<button type="button">Browse the Menu</button>} />);
    expect(screen.getByRole("button", { name: "Browse the Menu" })).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(<EmptyState className="py-2" />);
    const node = container.firstElementChild;
    expect(node).toHaveClass("py-2");
    expect(node).not.toHaveClass("py-10");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <EmptyState action={<button type="button">Browse the Menu</button>} hasSymbol />
    );
    await expectNoA11yViolations(container);
  });
});
