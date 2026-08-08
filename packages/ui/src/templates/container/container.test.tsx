import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Container } from "./container";

describe("Container", () => {
  it("renders a div carrying the default cap and the fluid gutter", () => {
    const { container } = render(<Container>Our Story</Container>);
    const node = container.firstElementChild;

    expect(node?.tagName).toBe("DIV");
    expect(node).toHaveClass("max-w-(--layout-container-max)");
    expect(node).toHaveClass("px-(--layout-gutter-fluid)");
    expect(node).toHaveClass("mx-auto");
  });

  it.each([
    ["default", "max-w-(--layout-container-max)"],
    ["wide", "max-w-(--layout-container-wide)"],
    ["prose", "max-w-(--measure-prose)"],
    ["full", "max-w-full"],
  ] as const)("caps the %s size", (size, expected) => {
    render(
      <Container aria-label="Our Story" as="section" size={size}>
        Our Story
      </Container>
    );
    expect(screen.getByRole("region", { name: "Our Story" })).toHaveClass(expected);
  });

  it("drops the gutter when it bleeds", () => {
    render(
      <Container aria-label="Our Story" as="section" isFullBleed>
        Our Story
      </Container>
    );
    const node = screen.getByRole("region", { name: "Our Story" });

    expect(node).toHaveClass("px-0");
    expect(node).not.toHaveClass("px-(--layout-gutter-fluid)");
  });

  it("renders the element the caller asks for", () => {
    render(
      <Container as="ul">
        <li>Small Plates</li>
      </Container>
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("forwards native attributes to the rendered element", () => {
    render(
      <Container aria-label="Our Story" as="section" id="story">
        Our Story
      </Container>
    );
    expect(screen.getByRole("region", { name: "Our Story" })).toHaveAttribute("id", "story");
  });

  it("emits no colour, border or type classes", () => {
    const { container } = render(<Container>Our Story</Container>);
    const className = container.firstElementChild?.className ?? "";

    expect(className).not.toMatch(/\b(bg|border|shadow|text|font)-/);
  });

  it("merges a caller className", () => {
    const { container } = render(<Container className="max-w-full px-0">Our Story</Container>);
    const node = container.firstElementChild;

    expect(node).toHaveClass("max-w-full", "px-0");
    expect(node).not.toHaveClass("max-w-(--layout-container-max)");
    expect(node).not.toHaveClass("px-(--layout-gutter-fluid)");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Container>
        <p>100% vegetarian kitchen.</p>
      </Container>
    );
    await expectNoA11yViolations(container);
  });
});
