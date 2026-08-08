import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Section } from "./section";

describe("Section", () => {
  it("renders a section carrying the token vertical rhythm", () => {
    render(<Section aria-label="Our Story">Our Story</Section>);
    const node = screen.getByRole("region", { name: "Our Story" });

    expect(node.tagName).toBe("SECTION");
    expect(node).toHaveClass("py-(--layout-section-y-fluid)");
  });

  it.each([
    ["none", "py-0"],
    ["tight", "py-[clamp(36px,4vw,56px)]"],
    ["default", "py-(--layout-section-y-fluid)"],
    ["loose", "py-[clamp(72px,9vw,128px)]"],
  ] as const)("renders the %s rhythm", (padding, expected) => {
    render(
      <Section aria-label="Our Story" padding={padding}>
        Our Story
      </Section>
    );
    expect(screen.getByRole("region", { name: "Our Story" })).toHaveClass(expected);
  });

  it("wraps its children in a container by default", () => {
    render(<Section aria-label="Our Story">Our Story</Section>);
    const inner = screen.getByRole("region", { name: "Our Story" }).firstElementChild;

    expect(inner).toHaveClass("max-w-(--layout-container-max)");
    expect(inner).toHaveClass("px-(--layout-gutter-fluid)");
  });

  it("passes its size through to that container", () => {
    render(
      <Section aria-label="Our Story" size="prose">
        Our Story
      </Section>
    );
    const inner = screen.getByRole("region", { name: "Our Story" }).firstElementChild;

    expect(inner).toHaveClass("max-w-(--measure-prose)");
  });

  it("skips the container when bare, so the child owns its own width", () => {
    render(
      <Section aria-label="Our Story" bare>
        <p>Our Story</p>
      </Section>
    );
    const inner = screen.getByRole("region", { name: "Our Story" }).firstElementChild;

    expect(inner?.tagName).toBe("P");
  });

  it("renders the element the caller asks for", () => {
    render(
      <Section aria-label="Site footer" as="footer">
        100% vegetarian kitchen.
      </Section>
    );
    expect(screen.getByRole("contentinfo", { name: "Site footer" })).toBeInTheDocument();
  });

  it("emits no colour, border or type classes", () => {
    const { container } = render(<Section>Our Story</Section>);
    const className = container.firstElementChild?.className ?? "";

    expect(className).not.toMatch(/\b(bg|border|shadow|text|font)-/);
  });

  it("merges a caller className", () => {
    render(
      <Section aria-label="Our Story" className="bg-surface-page-alt py-0">
        Our Story
      </Section>
    );
    const node = screen.getByRole("region", { name: "Our Story" });

    expect(node).toHaveClass("bg-surface-page-alt", "py-0");
    expect(node).not.toHaveClass("py-(--layout-section-y-fluid)");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Section aria-label="Our Story">
        <h2>A Kitchen in Sector 57</h2>
        <p>100% vegetarian kitchen.</p>
      </Section>
    );
    await expectNoA11yViolations(container);
  });
});
