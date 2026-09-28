import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Cluster } from "./cluster";

describe("Cluster", () => {
  it("is a wrapping, centred flex row with a 12px gap, and no tab stop, by default", () => {
    render(
      <Cluster data-testid="row">
        <span>Order Now</span>
      </Cluster>
    );
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("DIV");
    expect(row).toHaveClass(
      "flex",
      "min-w-0",
      "flex-wrap",
      "items-center",
      "justify-start",
      "gap-3"
    );
    expect(row).not.toHaveAttribute("tabindex");
  });

  it.each([
    [0.5, "gap-0.5"],
    [1.5, "gap-1.5"],
    [6, "gap-6"],
  ] as const)("space=%s sets %s", (space, gap) => {
    render(<Cluster space={space} data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveClass(gap);
  });

  it.each([
    ["start", "items-start"],
    ["center", "items-center"],
    ["end", "items-end"],
    ["baseline", "items-baseline"],
  ] as const)("align=%s sets %s", (align, cls) => {
    render(<Cluster align={align} data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveClass(cls);
  });

  it.each([
    ["start", "justify-start"],
    ["center", "justify-center"],
    ["end", "justify-end"],
    ["between", "justify-between"],
  ] as const)("justify=%s sets %s", (justify, cls) => {
    render(<Cluster justify={justify} data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveClass(cls);
  });

  it("stops wrapping when isNowrap is set", () => {
    render(<Cluster isNowrap data-testid="row" />);
    const row = screen.getByTestId("row");
    expect(row).toHaveClass("flex-nowrap");
    expect(row).not.toHaveClass("flex-wrap");
  });

  it("renders the element named by as", () => {
    render(
      <Cluster as="nav" aria-label="Order">
        <a href="#menu">Menu</a>
      </Cluster>
    );
    expect(screen.getByRole("navigation", { name: "Order" })).toBeInTheDocument();
  });

  it("never spaces a wrapping row with margins", () => {
    render(<Cluster data-testid="row" />);
    expect(screen.getByTestId("row").className).not.toMatch(/(^|\s)-?m[trblxy]?-/);
  });

  it("lets a consumer className replace the gap", () => {
    render(<Cluster className="gap-8" data-testid="row" />);
    const row = screen.getByTestId("row");
    expect(row).toHaveClass("gap-8");
    expect(row).not.toHaveClass("gap-3");
  });

  it("has no accessibility violations as a list", async () => {
    const { container } = render(
      <Cluster as="ul" justify="between">
        <li>All</li>
        <li>Small Plates</li>
        <li>Sweets</li>
      </Cluster>
    );
    await expectNoA11yViolations(container);
  });

  describe("isScrollable — the mobile rail", () => {
    it("scrolls sideways instead of wrapping, and its items keep their size", () => {
      render(<Cluster isScrollable data-testid="rail" />);
      const rail = screen.getByTestId("rail");
      expect(rail).toHaveClass("flex-nowrap", "overflow-x-auto", "*:shrink-0");
      expect(rail).not.toHaveClass("flex-wrap");
    });

    // Review Focus 3, pure half — the rendered half is the ScrollableRailAt360 story.
    it("is reachable by keyboard, so it can be scrolled without a pointer", async () => {
      const user = userEvent.setup();
      render(
        <Cluster isScrollable role="group" aria-label="Categories">
          <span>All</span>
          <span>Sweets</span>
        </Cluster>
      );
      await user.tab();
      expect(screen.getByRole("group", { name: "Categories" })).toHaveFocus();
    });

    it("keeps 4px of room for focus rings on every side and when an item is scrolled to", () => {
      render(<Cluster isScrollable data-testid="rail" />);
      expect(screen.getByTestId("rail")).toHaveClass("p-1", "-m-1", "scroll-px-1");
    });

    it("gives up its own tab stop when the consumer passes tabIndex={-1}", async () => {
      const user = userEvent.setup();
      render(
        <Cluster isScrollable tabIndex={-1}>
          <button type="button">All</button>
        </Cluster>
      );
      await user.tab();
      expect(screen.getByRole("button", { name: "All" })).toHaveFocus();
    });

    it("keeps a scrolling ul a named list, with every item", async () => {
      const { container } = render(
        <Cluster as="ul" isScrollable aria-label="Categories">
          <li>All</li>
          <li>Small Plates</li>
          <li>Sweets</li>
        </Cluster>
      );
      const rail = screen.getByRole("list", { name: "Categories" });
      expect(rail).toHaveAttribute("tabindex", "0");
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
      await expectNoA11yViolations(container);
    });

    it("has no accessibility violations", async () => {
      const { container } = render(
        <Cluster isScrollable role="group" aria-label="Categories">
          <span>All</span>
          <span>Small Plates</span>
        </Cluster>
      );
      await expectNoA11yViolations(container);
    });
  });
});
