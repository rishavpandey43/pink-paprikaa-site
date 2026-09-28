import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Stack } from "./stack";

describe("Stack", () => {
  it("is a shrinkable one-column grid (minmax(0, 1fr)) with a 16px gap by default", () => {
    render(
      <Stack data-testid="stack">
        <p>Small Plates</p>
      </Stack>
    );
    const stack = screen.getByTestId("stack");
    expect(stack.tagName).toBe("DIV");
    expect(stack).toHaveClass("grid", "grid-cols-1", "min-w-0", "gap-4");
  });

  it.each([
    [0, "gap-0"],
    [0.5, "gap-0.5"],
    [1.5, "gap-1.5"],
    [6, "gap-6"],
    [32, "gap-32"],
  ] as const)("space=%s sets %s", (space, gap) => {
    render(<Stack space={space} data-testid="stack" />);
    expect(screen.getByTestId("stack")).toHaveClass(gap);
  });

  it.each([
    ["start", "justify-items-start"],
    ["center", "justify-items-center"],
    ["end", "justify-items-end"],
    ["stretch", "justify-items-stretch"],
  ] as const)("align=%s sets %s", (align, cls) => {
    render(<Stack align={align} data-testid="stack" />);
    expect(screen.getByTestId("stack")).toHaveClass(cls);
  });

  it.each([
    ["start", "content-start"],
    ["center", "content-center"],
    ["end", "content-end"],
    ["between", "content-between"],
  ] as const)("justify=%s sets %s", (justify, cls) => {
    render(<Stack justify={justify} data-testid="stack" />);
    expect(screen.getByTestId("stack")).toHaveClass(cls);
  });

  it("puts one hidden hairline between rows — never before the first or after the last", () => {
    render(
      <Stack isDivided data-testid="stack">
        <p>Paprikaa Chilli Paneer</p>
        <p>Masala Cold Brew</p>
        <p>Small Plates</p>
      </Stack>
    );
    const rows = [...screen.getByTestId("stack").children];
    expect(rows.map((row) => row.tagName)).toEqual(["P", "DIV", "P", "DIV", "P"]);
    for (const rule of rows.filter((row) => row.tagName === "DIV")) {
      expect(rule).toHaveAttribute("aria-hidden", "true");
      expect(rule).toHaveClass("h-px", "bg-border-subtle");
    }
  });

  it("skips empty children, so a conditional row never leaves a doubled rule", () => {
    render(
      <Stack isDivided data-testid="stack">
        <p>Chai</p>
        {null}
        {false}
        <p>Kulfi</p>
      </Stack>
    );
    expect(screen.getByTestId("stack").children).toHaveLength(3);
  });

  it("keeps a divided list a valid list: its rules are hidden list items", () => {
    render(
      <Stack as="ul" isDivided>
        <li>Chai</li>
        <li>Kulfi</li>
      </Stack>
    );
    const list = screen.getByRole("list");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(list.children).toHaveLength(3);
    expect(list.children[1]?.tagName).toBe("LI");
  });

  it("lets a consumer className replace the gap", () => {
    render(<Stack className="gap-2" data-testid="stack" />);
    const stack = screen.getByTestId("stack");
    expect(stack).toHaveClass("gap-2");
    expect(stack).not.toHaveClass("gap-4");
  });

  it("never spaces with margins", () => {
    render(<Stack isDivided data-testid="stack" />);
    expect(screen.getByTestId("stack").className).not.toMatch(/(^|\s)-?m[trblxy]?-/);
  });

  it("has no accessibility violations as a divided list", async () => {
    const { container } = render(
      <Stack as="ul" isDivided space={3}>
        <li>Chai</li>
        <li>Kulfi</li>
        <li>Bun maska</li>
      </Stack>
    );
    await expectNoA11yViolations(container);
  });
});
