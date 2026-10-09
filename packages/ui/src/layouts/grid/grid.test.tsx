import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { expectNoA11yViolations } from "#vitest.setup";

import { Grid, GridItem } from "./grid";

describe("Grid", () => {
  it("is a 12-column grid with the default grid gap", () => {
    render(
      <Grid data-testid="g">
        <GridItem>a</GridItem>
      </Grid>
    );
    const grid = screen.getByTestId("g");
    expect(grid.tagName).toBe("DIV");
    expect(grid).toHaveClass("grid", "grid-cols-12", "gap-grid-gap", "min-w-0");
  });

  it.each([
    [6, "grid-cols-6"],
    [4, "grid-cols-4"],
  ] as const)("columns %i", (columns, cls) => {
    render(<Grid data-testid="g" columns={columns} />);
    const grid = screen.getByTestId("g");
    expect(grid).toHaveClass(cls);
    expect(grid).not.toHaveClass("grid-cols-12");
  });

  it("takes sx and a gap step", () => {
    render(<Grid data-testid="g" gap={8} sx={{ mt: 4 }} />);
    const grid = screen.getByTestId("g");
    expect(grid).toHaveClass("gap-8", "mt-4");
    expect(grid).not.toHaveClass("gap-grid-gap");
  });

  it("renders as a real list", () => {
    render(
      <Grid as="ul">
        <GridItem as="li">Paneer Tikka</GridItem>
      </Grid>
    );
    expect(screen.getByRole("list")).toContainElement(screen.getByRole("listitem"));
  });

  it("forwards native props and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref} id="menu" />);
    expect(ref.current).toHaveAttribute("id", "menu");
  });

  it("lets a consumer className replace the columns", () => {
    render(<Grid className="grid-cols-2" data-testid="g" />);
    const grid = screen.getByTestId("g");
    expect(grid).toHaveClass("grid-cols-2");
    expect(grid).not.toHaveClass("grid-cols-12");
  });
});

describe("GridItem", () => {
  it("an item without span is full width (mobile first)", () => {
    render(<GridItem data-testid="i">a</GridItem>);
    expect(screen.getByTestId("i")).toHaveClass("col-span-full", "min-w-0");
  });

  it.each([
    [1, "col-span-1"],
    [6, "col-span-6"],
    [12, "col-span-12"],
    ["full", "col-span-full"],
  ] as const)("span=%s sets %s", (span, cls) => {
    render(<GridItem span={span} data-testid="i" />);
    expect(screen.getByTestId("i")).toHaveClass(cls);
  });

  it("takes a responsive span, full width below its first breakpoint", () => {
    render(<GridItem span={{ sm: 6, lg: 4 }} data-testid="i" />);
    const item = screen.getByTestId("i");
    expect(item).toHaveClass("col-span-full", "sm:col-span-6", "lg:col-span-4");
    expect(item.className).not.toMatch(/(^|\s)(md|xl):/);
  });

  it("maps scalar and responsive span/start to literal classes", () => {
    render(
      <GridItem data-testid="i" span={{ base: 12, md: 6, lg: 4 }} start={{ lg: 2 }}>
        a
      </GridItem>
    );
    expect(screen.getByTestId("i")).toHaveClass(
      "col-span-12",
      "md:col-span-6",
      "lg:col-span-4",
      "lg:col-start-2"
    );
  });

  it("takes every breakpoint of a responsive span", () => {
    render(<GridItem span={{ base: 12, sm: 6, md: 4, lg: 3, xl: 2 }} data-testid="i" />);
    expect(screen.getByTestId("i")).toHaveClass(
      "col-span-12",
      "sm:col-span-6",
      "md:col-span-4",
      "lg:col-span-3",
      "xl:col-span-2"
    );
  });

  it.each([
    [3, ["col-start-3"]],
    [{ md: 5 }, ["md:col-start-5"]],
    [
      { base: 1, sm: 2, md: 3, lg: 9, xl: 12 },
      ["col-start-1", "sm:col-start-2", "md:col-start-3", "lg:col-start-9", "xl:col-start-12"],
    ],
  ] as const)("start=%o sets %o", (start, classes) => {
    render(<GridItem start={start} data-testid="i" />);
    expect(screen.getByTestId("i")).toHaveClass(...classes);
  });

  it("renders the chosen element and takes sx", () => {
    render(
      <GridItem as="article" aria-label="Special" sx={{ p: 4 }}>
        a
      </GridItem>
    );
    expect(screen.getByRole("article", { name: "Special" })).toHaveClass("p-4");
  });

  it("forwards native props and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<GridItem ref={ref} id="cell" />);
    expect(ref.current).toHaveAttribute("id", "cell");
  });

  it("lets a consumer className replace the span", () => {
    render(<GridItem span={6} className="col-span-3" data-testid="i" />);
    const item = screen.getByTestId("i");
    expect(item).toHaveClass("col-span-3");
    expect(item).not.toHaveClass("col-span-6");
  });

  it("has no accessibility violations as a page layout", async () => {
    const { container } = render(
      <Grid as="ul">
        <GridItem as="li" span={{ md: 8 }}>
          Dal Makhani
        </GridItem>
        <GridItem as="li" span={{ md: 4 }}>
          Masala Chaas
        </GridItem>
      </Grid>
    );
    await expectNoA11yViolations(container);
  });
});
