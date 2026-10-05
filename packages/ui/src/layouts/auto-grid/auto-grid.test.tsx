import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { AutoGrid, type AutoGridMin } from "./auto-grid";

interface CatalogueEntry {
  name: string;
  value: unknown;
  surface: string | null;
}

const catalogue = JSON.parse(
  readFileSync(join(import.meta.dirname, "../../../../design-tokens/dist/tokens.json"), "utf8")
) as CatalogueEntry[];
const stylesheet = readFileSync(join(import.meta.dirname, "../../styles.css"), "utf8").replace(
  /\s+/g,
  " "
);

const MIN_STEPS: [AutoGridMin, string][] = [
  ["xs", "140px"],
  ["sm", "200px"],
  ["card", "240px"],
  ["md", "260px"],
  ["lg", "320px"],
  ["xl", "380px"],
  ["2xl", "420px"],
];

describe("AutoGrid", () => {
  it("is an auto-fit grid at the card minimum with the fluid gap by default", () => {
    render(<AutoGrid data-testid="grid" />);
    expect(screen.getByTestId("grid")).toHaveClass("grid", "gap-grid-gap", "autogrid-min-md");
  });

  it.each(MIN_STEPS)("min=%s drops a column below its %s token", (min, width) => {
    render(<AutoGrid min={min} data-testid="grid" />);
    expect(screen.getByTestId("grid")).toHaveClass(`autogrid-min-${min}`);
    const token = catalogue.find(
      (entry) => entry.surface === null && entry.name === `spacing-grid-min-${min}`
    );
    expect(token?.value).toBe(width);
  });

  it.each([1, 2, 3, 4, 5, 6] as const)(
    "columns=%s fixes that many minmax(0, 1fr) tracks and ignores min",
    (columns) => {
      render(<AutoGrid columns={columns} min="lg" data-testid="grid" />);
      const grid = screen.getByTestId("grid");
      expect(grid).toHaveClass(`grid-cols-${String(columns)}`);
      expect(grid.className).not.toMatch(/autogrid-min-/);
    }
  );

  // Review Focus 1, pure half — the rendered half is the LongWordHoldsTracks story.
  it("builds auto-fit tracks on the min(step, 100%) floor, never content", () => {
    expect(stylesheet).toContain(
      "@utility autogrid-min-* { grid-template-columns: repeat(auto-fit, minmax(min(--value(--spacing-grid-min-*), 100%), 1fr)); }"
    );
  });

  it("takes a spacing step in place of the fluid gap", () => {
    render(<AutoGrid space={6} data-testid="grid" />);
    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("gap-6");
    expect(grid).not.toHaveClass("gap-grid-gap");
  });

  it("lets a consumer className replace the gap token", () => {
    render(<AutoGrid className="gap-12" data-testid="grid" />);
    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("gap-12");
    expect(grid).not.toHaveClass("gap-grid-gap");
  });

  it("paints nothing — no colour, border, shadow or type class", () => {
    render(<AutoGrid data-testid="grid" />);
    const classes = screen.getByTestId("grid").className.split(/\s+/);
    expect(classes.filter((name) => /^(bg|border|shadow|text|font)-/.test(name))).toEqual([]);
  });

  it("renders a list when as=ul", () => {
    render(
      <AutoGrid as="ul">
        <li>Chai</li>
      </AutoGrid>
    );
    expect(screen.getByRole("list")).toContainElement(screen.getByRole("listitem"));
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AutoGrid as="ul" min="sm">
        <li>Chai</li>
        <li>Kulfi</li>
        <li>Bun maska</li>
      </AutoGrid>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root", () => {
    render(
      <AutoGrid data-testid="root" sx={{ mt: 6, px: { md: 4 } }}>
        x
      </AutoGrid>
    );
    expect(screen.getByTestId("root")).toHaveClass("mt-6", "md:px-4");
  });
});
