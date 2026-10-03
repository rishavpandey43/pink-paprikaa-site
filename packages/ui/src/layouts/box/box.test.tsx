import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Box } from "./box";

describe("Box", () => {
  it("is a plain div by default, with no classes of its own", () => {
    render(<Box data-testid="box">Small Plates</Box>);
    const box = screen.getByTestId("box");
    expect(box.tagName).toBe("DIV");
    expect(box).not.toHaveAttribute("data-surface");
  });

  it.each([
    "section",
    "article",
    "aside",
    "header",
    "footer",
    "main",
    "nav",
    "span",
    "li",
  ] as const)("renders as %s", (as) => {
    render(<Box as={as} data-testid="box" />);
    expect(screen.getByTestId("box").tagName).toBe(as.toUpperCase());
  });

  it("renders a real list as ul", () => {
    render(
      <Box as="ul">
        <Box as="li">Chai</Box>
      </Box>
    );
    expect(screen.getByRole("list")).toContainElement(screen.getByRole("listitem"));
  });

  it.each([
    [{ padding: 4 }, "p-4"],
    [{ padding: 0.5 }, "p-0.5"],
    [{ paddingX: 6 }, "px-6"],
    [{ paddingY: 12 }, "py-12"],
  ] as const)("%o sets %s", (props, cls) => {
    render(<Box {...props} data-testid="box" />);
    expect(screen.getByTestId("box")).toHaveClass(cls);
  });

  it("keeps a side padding beside the all-round one", () => {
    render(<Box padding={4} paddingX={8} data-testid="box" />);
    expect(screen.getByTestId("box")).toHaveClass("p-4", "px-8");
  });

  it.each([
    ["light", "bg-surface-page"],
    ["soft", "bg-surface-brand-soft"],
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
  ] as const)("surface=%s sets data-surface and %s", (surface, cls) => {
    render(<Box surface={surface} data-testid="box" />);
    const box = screen.getByTestId("box");
    expect(box).toHaveAttribute("data-surface", surface);
    expect(box).toHaveClass(cls);
  });

  it.each([
    ["none", "rounded-none"],
    ["sm", "rounded-sm"],
    ["md", "rounded-md"],
    ["lg", "rounded-lg"],
    ["xl", "rounded-xl"],
    ["pill", "rounded-pill"],
  ] as const)("radius=%s sets %s", (radius, cls) => {
    render(<Box radius={radius} data-testid="box" />);
    expect(screen.getByTestId("box")).toHaveClass(cls);
  });

  it("draws the default border", () => {
    render(<Box hasBorder data-testid="box" />);
    expect(screen.getByTestId("box")).toHaveClass("border-default", "border-border-default");
  });

  it.each([1, 2, 3, 4] as const)("shadow=%s sets shadow-%s", (shadow) => {
    render(<Box shadow={shadow} data-testid="box" />);
    expect(screen.getByTestId("box")).toHaveClass(`shadow-${String(shadow)}`);
  });

  it("lets a consumer className replace a prop's class", () => {
    render(<Box padding={4} className="p-2" data-testid="box" />);
    const box = screen.getByTestId("box");
    expect(box).toHaveClass("p-2");
    expect(box).not.toHaveClass("p-4");
  });

  it("has no accessibility violations on every surface", async () => {
    const { container } = render(
      <>
        {(["light", "soft", "brand", "ink"] as const).map((surface) => (
          <Box key={surface} as="section" aria-label={surface} surface={surface} padding={6}>
            <p>Pure veg, since day one.</p>
          </Box>
        ))}
      </>
    );
    await expectNoA11yViolations(container);
  });
});
