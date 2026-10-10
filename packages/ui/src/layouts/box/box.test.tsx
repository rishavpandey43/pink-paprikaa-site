import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { expectNoA11yViolations } from "#vitest.setup";

import { SURFACE_BG, SURFACE_DATA } from "../../lib/common-props";
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

  it("renders the chosen element with sx on it", () => {
    render(
      <Box as="section" aria-label="Offers" sx={{ p: 6, radius: "lg", border: true }}>
        x
      </Box>
    );
    const box = screen.getByRole("region", { name: "Offers" });
    expect(box).toHaveClass("p-6", "rounded-lg", "border-default", "border-border-default");
  });

  it.each(["page", "alt", "sunken", "soft", "brand", "ink"] as const)(
    "surface %s sets the ground and data-surface",
    (surface) => {
      render(
        <Box data-testid="b" surface={surface}>
          x
        </Box>
      );
      const b = screen.getByTestId("b");
      expect(b).toHaveClass(SURFACE_BG[surface]);
      expect(b).toHaveAttribute("data-surface", SURFACE_DATA[surface]);
    }
  );

  it("sets no data-surface without a surface", () => {
    render(<Box data-testid="b">x</Box>);
    expect(screen.getByTestId("b")).not.toHaveAttribute("data-surface");
  });

  it("forwards native props and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Box ref={ref} id="hero" data-x="1">
        x
      </Box>
    );
    expect(ref.current).toHaveAttribute("id", "hero");
    expect(ref.current).toHaveAttribute("data-x", "1");
  });

  it("lets a consumer className replace an sx class", () => {
    render(
      <Box sx={{ p: 4 }} className="p-2" data-testid="box">
        x
      </Box>
    );
    const box = screen.getByTestId("box");
    expect(box).toHaveClass("p-2");
    expect(box).not.toHaveClass("p-4");
  });

  it("has no accessibility violations on every surface", async () => {
    const { container } = render(
      <>
        {(["page", "alt", "sunken", "soft", "brand", "ink"] as const).map((surface) => (
          <Box key={surface} as="section" aria-label={surface} surface={surface} sx={{ p: 6 }}>
            <p>Pure veg, since day one.</p>
          </Box>
        ))}
      </>
    );
    await expectNoA11yViolations(container);
  });
});
