import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Stack } from "./stack";

function Rows() {
  return (
    <>
      <li>Small Plates</li>
      <li>All Day</li>
      <li>Sweets</li>
    </>
  );
}

describe("Stack", () => {
  it("renders a grid at the default 16px step", () => {
    render(
      <Stack as="ul">
        <Rows />
      </Stack>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass("grid");
    expect(node).toHaveClass("gap-4");
    expect(node).toHaveClass("min-w-0");
  });

  it.each([
    [0, "gap-0"],
    [0.5, "gap-0-5"],
    [1.5, "gap-1-5"],
    [3, "gap-3"],
    [6, "gap-6"],
    [16, "gap-16"],
  ] as const)("maps step %s onto its 4px multiple", (space, expected) => {
    render(
      <Stack as="ul" space={space}>
        <Rows />
      </Stack>
    );
    expect(screen.getByRole("list")).toHaveClass(expected);
  });

  it.each([
    ["start", "justify-items-start"],
    ["center", "justify-items-center"],
    ["end", "justify-items-end"],
    ["stretch", "justify-items-stretch"],
  ] as const)("aligns children to %s", (align, expected) => {
    render(
      <Stack align={align} as="ul">
        <Rows />
      </Stack>
    );
    expect(screen.getByRole("list")).toHaveClass(expected);
  });

  it.each([
    ["start", "content-start"],
    ["center", "content-center"],
    ["end", "content-end"],
    ["between", "content-between"],
  ] as const)("distributes rows %s", (justify, expected) => {
    render(
      <Stack as="ul" justify={justify}>
        <Rows />
      </Stack>
    );
    expect(screen.getByRole("list")).toHaveClass(expected);
  });

  it("draws hairline rules between children only when asked", () => {
    const { rerender } = render(
      <Stack as="ul">
        <Rows />
      </Stack>
    );
    expect(screen.getByRole("list")).not.toHaveClass("divide-y");

    rerender(
      <Stack as="ul" hasDivider>
        <Rows />
      </Stack>
    );
    expect(screen.getByRole("list")).toHaveClass("divide-y", "divide-border-subtle");
  });

  it("keeps every child in the document", () => {
    render(
      <Stack as="ul" hasDivider>
        <Rows />
      </Stack>
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("never spaces with margins", () => {
    const { container } = render(<Stack>Small Plates</Stack>);
    const className = container.firstElementChild?.className ?? "";

    expect(className).not.toMatch(/(^|\s)-?m[trblxy]?-/);
  });

  it("merges a caller className", () => {
    render(
      <Stack as="ul" className="gap-12">
        <Rows />
      </Stack>
    );
    const node = screen.getByRole("list");

    expect(node).toHaveClass("gap-12");
    expect(node).not.toHaveClass("gap-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Stack as="ul" hasDivider space={6}>
        <Rows />
      </Stack>
    );
    await expectNoA11yViolations(container);
  });
});
