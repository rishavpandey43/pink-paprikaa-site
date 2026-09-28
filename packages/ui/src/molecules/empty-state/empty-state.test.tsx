import { render, screen } from "@testing-library/react";
import { Search } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("titles itself with a level-3 heading by default and says what to do next", () => {
    render(<EmptyState title="Nothing here yet." body="Let's fix that." />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Nothing here yet." })
    ).toBeInTheDocument();
    expect(screen.getByText("Let's fix that.")).toHaveClass(
      "text-text-muted",
      "max-w-text-measure-narrow"
    );
  });

  it("takes the heading level its page needs", () => {
    render(<EmptyState title="No orders yet." headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "No orders yet." })).toBeInTheDocument();
  });

  it("shows the utensils glyph by default, or the glyph it is given, at 32px in its soft tint", () => {
    const { container, rerender } = render(<EmptyState title="Nothing here yet." />);
    expect(container.querySelector("svg.lucide-utensils")).toBeInTheDocument();
    rerender(<EmptyState title="Nothing matches that yet." icon={Search} />);
    const glyph = container.querySelector("svg.lucide-search");
    expect(glyph).toBeInTheDocument();
    expect(glyph?.parentElement).toHaveClass("size-icon-xl", "text-empty-state-icon");
  });

  it("shows the brand diamond, hidden from assistive tech, for the symbol variant", () => {
    const { container } = render(<EmptyState title="Nothing here yet." variant="symbol" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    const symbol = container.querySelector(".mask-symbol");
    expect(symbol).toHaveAttribute("aria-hidden", "true");
    expect(symbol).toHaveClass("text-empty-state-symbol", "size-10");
    expect(container.innerHTML).not.toContain("<path");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders its one action", () => {
    render(<EmptyState title="Nothing here yet." action={<a href="/menu">Browse the Menu</a>} />);
    expect(screen.getByRole("link", { name: "Browse the Menu" })).toBeInTheDocument();
  });

  it("merges a caller className over its padding", () => {
    const { container } = render(<EmptyState title="Nothing here yet." className="py-2" />);
    expect(container.firstElementChild).toHaveClass("py-2");
    expect(container.firstElementChild).not.toHaveClass("py-10");
  });

  it("grows for size lg", () => {
    const { container, rerender } = render(<EmptyState title="No orders yet." variant="symbol" />);
    expect(container.firstElementChild).toHaveClass("py-10");
    rerender(<EmptyState title="No orders yet." size="lg" variant="symbol" />);
    expect(container.firstElementChild).toHaveClass("py-16");
    expect(screen.getByRole("heading")).toHaveClass("text-h3");
    expect(container.querySelector(".mask-symbol")).toHaveClass("size-empty-state-symbol-lg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <EmptyState
        variant="symbol"
        title="Nothing here yet."
        body="Let's fix that."
        action={<a href="/menu">Browse the Menu</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
