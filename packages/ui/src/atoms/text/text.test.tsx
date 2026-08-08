import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Text } from "./text";

describe("Text", () => {
  it("renders body copy as a paragraph by default", () => {
    render(<Text>100% vegetarian kitchen.</Text>);
    const node = screen.getByText("100% vegetarian kitchen.");
    expect(node.tagName).toBe("P");
    expect(node).toHaveClass("text-body1");
  });

  it.each([
    ["h1", "H1"],
    ["h2", "H2"],
    ["h3", "H3"],
  ] as const)("renders %s as its matching heading element", (variant, tag) => {
    render(<Text variant={variant}>Desi at heart.</Text>);
    expect(screen.getByText("Desi at heart.").tagName).toBe(tag);
  });

  it("lets the document outline differ from the visual level", () => {
    render(
      <Text as="h1" variant="h2">
        Desi at heart.
      </Text>
    );
    const node = screen.getByRole("heading", { level: 1 });
    expect(node).toHaveClass("text-h2");
  });

  it("gives each step a sensible default tone", () => {
    render(<Text variant="caption">8am – 11:30pm</Text>);
    expect(screen.getByText("8am – 11:30pm")).toHaveClass("text-text-muted");
  });

  it("lets the caller override the default tone", () => {
    render(
      <Text tone="brand" variant="caption">
        8am – 11:30pm
      </Text>
    );
    const node = screen.getByText("8am – 11:30pm");
    expect(node).toHaveClass("text-text-brand");
    expect(node).not.toHaveClass("text-text-muted");
  });

  it("swaps the fixed size for its fluid twin", () => {
    render(
      <Text isFluid variant="h1">
        Desi at heart.
      </Text>
    );
    const node = screen.getByText("Desi at heart.");
    expect(node).toHaveClass("text-h1-fluid");
    expect(node).not.toHaveClass("text-h1");
  });

  it("leaves steps without a fluid twin at their fixed size", () => {
    render(
      <Text isFluid variant="caption">
        8am – 11:30pm
      </Text>
    );
    expect(screen.getByText("8am – 11:30pm")).toHaveClass("text-caption");
  });

  it("balances headings and keeps running text pretty", () => {
    const { rerender } = render(<Text variant="h2">Desi at heart.</Text>);
    expect(screen.getByText("Desi at heart.")).toHaveClass("text-balance");

    rerender(<Text variant="body1">Desi at heart.</Text>);
    expect(screen.getByText("Desi at heart.")).toHaveClass("text-pretty");
  });

  it("adds neither an alignment nor a line-length class when asked for neither", () => {
    render(<Text>100% vegetarian kitchen.</Text>);
    const node = screen.getByText("100% vegetarian kitchen.");
    expect(node.className).not.toMatch(/\btext-(left|center|right)\b/);
    expect(node.className).not.toMatch(/\bmax-w-/);
  });

  it("caps line length when a measure is set", () => {
    render(<Text measure="prose">We roast our own masala.</Text>);
    expect(screen.getByText("We roast our own masala.")).toHaveClass("max-w-(--measure-prose)");
  });

  it("truncates to the requested number of lines", () => {
    render(<Text lineClamp={2}>Amritsari paneer, burnt chilli mayo, potato brioche.</Text>);
    expect(screen.getByText(/Amritsari paneer/)).toHaveClass("line-clamp-2");
  });

  it("uppercases the overline step", () => {
    render(<Text variant="overline">Menu</Text>);
    expect(screen.getByText("Menu")).toHaveClass("uppercase");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Text variant="h2">Desi at heart. Urban by nature.</Text>
        <Text>100% vegetarian kitchen. Always was.</Text>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
