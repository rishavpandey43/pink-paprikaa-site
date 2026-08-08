import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Cluster } from "./cluster";

function Tags() {
  return (
    <>
      <li>All</li>
      <li>Small Plates</li>
      <li>Sweets</li>
    </>
  );
}

describe("Cluster", () => {
  it("wraps by default at the 12px step", () => {
    render(
      <Cluster as="ul">
        <Tags />
      </Cluster>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass("flex", "flex-wrap", "gap-3", "min-w-0");
  });

  it.each([
    [0, "gap-0"],
    [1.5, "gap-1-5"],
    [2, "gap-2"],
    [6, "gap-6"],
    [12, "gap-12"],
  ] as const)("maps step %s onto its 4px multiple", (space, expected) => {
    render(
      <Cluster as="ul" space={space}>
        <Tags />
      </Cluster>
    );
    expect(screen.getByRole("list")).toHaveClass(expected);
  });

  it.each([
    ["start", "items-start"],
    ["center", "items-center"],
    ["end", "items-end"],
    ["baseline", "items-baseline"],
  ] as const)("aligns children to %s", (align, expected) => {
    render(
      <Cluster align={align} as="ul">
        <Tags />
      </Cluster>
    );
    expect(screen.getByRole("list")).toHaveClass(expected);
  });

  it.each([
    ["start", "justify-start"],
    ["center", "justify-center"],
    ["end", "justify-end"],
    ["between", "justify-between"],
  ] as const)("distributes children %s", (justify, expected) => {
    render(
      <Cluster as="ul" justify={justify}>
        <Tags />
      </Cluster>
    );
    expect(screen.getByRole("list")).toHaveClass(expected);
  });

  it("stops wrapping when told not to", () => {
    render(
      <Cluster as="ul" isNowrap>
        <Tags />
      </Cluster>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass("flex-nowrap");
    expect(node).not.toHaveClass("flex-wrap");
  });

  it("scrolls sideways instead of wrapping for the category rail", () => {
    render(
      <Cluster as="ul" isScrollable>
        <Tags />
      </Cluster>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass("overflow-x-auto", "flex-nowrap");
    expect(node).not.toHaveClass("flex-wrap");
  });

  it("makes a scrolling rail reachable by keyboard", () => {
    render(
      <Cluster as="ul" isScrollable>
        <Tags />
      </Cluster>
    );
    expect(screen.getByRole("list")).toHaveAttribute("tabindex", "0");
  });

  it("names a scrolling rail as a region once it has a label", () => {
    render(
      <Cluster aria-label="Menu categories" as="ul" isScrollable>
        <Tags />
      </Cluster>
    );
    expect(screen.getByRole("region", { name: "Menu categories" })).toBeInTheDocument();
  });

  it("leaves an unlabelled rail as a plain list rather than an anonymous region", () => {
    render(
      <Cluster as="ul" isScrollable>
        <Tags />
      </Cluster>
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("never makes a wrapping cluster a tab stop", () => {
    render(
      <Cluster as="ul">
        <Tags />
      </Cluster>
    );
    expect(screen.getByRole("list")).not.toHaveAttribute("tabindex");
  });

  it("keeps every child in the document", () => {
    render(
      <Cluster as="ul" isScrollable>
        <Tags />
      </Cluster>
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("never spaces with margins", () => {
    const { container } = render(<Cluster>All</Cluster>);
    const className = container.firstElementChild?.className ?? "";

    expect(className).not.toMatch(/(^|\s)-?m[trblxy]?-/);
  });

  it("merges a caller className", () => {
    render(
      <Cluster as="ul" className="gap-8">
        <Tags />
      </Cluster>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass("gap-8");
    expect(node).not.toHaveClass("gap-3");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Cluster as="ul" justify="between">
        <Tags />
      </Cluster>
    );
    await expectNoA11yViolations(container);
  });
});
