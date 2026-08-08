import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { AutoGrid } from "./auto-grid";

function Cards() {
  return (
    <>
      <li>Paprikaa Chilli Paneer</li>
      <li>Tandoori Momos</li>
      <li>Masala Cold Brew</li>
    </>
  );
}

describe("AutoGrid", () => {
  it("collapses columns rather than squashing them, at the 260px card floor", () => {
    render(
      <AutoGrid as="ul">
        <Cards />
      </AutoGrid>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass("grid");
    expect(node).toHaveClass("grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))]");
    expect(node).toHaveClass("gap-(--layout-gap-grid)");
  });

  it.each([
    ["narrow", "grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))]"],
    ["card", "grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))]"],
    ["panel", "grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]"],
  ] as const)("drops a column at the %s floor", (size, expected) => {
    render(
      <AutoGrid as="ul" size={size}>
        <Cards />
      </AutoGrid>
    );
    expect(screen.getByRole("list")).toHaveClass(expected);
  });

  it("never leaves a bare 1fr track, which would let a long label overflow the row", () => {
    render(
      <AutoGrid as="ul">
        <Cards />
      </AutoGrid>
    );
    const className = screen.getByRole("list").className;

    expect(className).toMatch(/minmax\(min\(\d+px,100%\),1fr\)/);
  });

  it.each([
    [1, "grid-cols-[repeat(1,minmax(0,1fr))]"],
    [2, "grid-cols-[repeat(2,minmax(0,1fr))]"],
    [3, "grid-cols-[repeat(3,minmax(0,1fr))]"],
    [4, "grid-cols-[repeat(4,minmax(0,1fr))]"],
  ] as const)("freezes at %s columns when asked", (columns, expected) => {
    render(
      <AutoGrid as="ul" columns={columns}>
        <Cards />
      </AutoGrid>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass(expected);
    expect(node).not.toHaveClass("grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))]");
  });

  it("overrides the grid gap token when a step is given", () => {
    render(
      <AutoGrid as="ul" space={8}>
        <Cards />
      </AutoGrid>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass("gap-8");
    expect(node).not.toHaveClass("gap-(--layout-gap-grid)");
  });

  it("keeps every child in the document", () => {
    render(
      <AutoGrid as="ul">
        <Cards />
      </AutoGrid>
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("emits no colour, border or type classes", () => {
    const { container } = render(<AutoGrid>Paprikaa Chilli Paneer</AutoGrid>);
    const className = container.firstElementChild?.className ?? "";

    expect(className).not.toMatch(/\b(bg|border|shadow|text|font)-/);
  });

  it("merges a caller className", () => {
    render(
      <AutoGrid as="ul" className="gap-12">
        <Cards />
      </AutoGrid>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass("gap-12");
    expect(node).not.toHaveClass("gap-(--layout-gap-grid)");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AutoGrid as="ul" size="panel">
        <Cards />
      </AutoGrid>
    );
    await expectNoA11yViolations(container);
  });
});
