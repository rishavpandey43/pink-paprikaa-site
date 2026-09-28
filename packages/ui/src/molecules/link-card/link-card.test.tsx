import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LinkCard } from "./link-card";

/** Stands in for next/link: the card must render into it, not around it. */
function RouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

const DOOR = {
  href: "/homely-meals",
  title: "Homely Meals",
  description: "Daily veg meals from ₹120",
  cta: "See plans",
} as const;

describe("LinkCard", () => {
  it("is one link carrying its title, description and call to action", () => {
    render(<LinkCard {...DOOR} />);
    const link = screen.getByRole("link", { name: /Homely Meals/ });
    expect(link).toHaveAttribute("href", "/homely-meals");
    expect(link).toHaveTextContent("Daily veg meals from ₹120");
    expect(link).toHaveTextContent("See plans");
  });

  it("titles the card as a level-3 heading inside the link", () => {
    render(<LinkCard {...DOOR} />);
    expect(screen.getByRole("link")).toContainElement(
      screen.getByRole("heading", { level: 3, name: "Homely Meals" })
    );
  });

  it.each([
    ["default", "light"],
    ["brand", "brand"],
    ["ink", "ink"],
    ["soft", "soft"],
  ] as const)("sets the %s tone's surface to %s", (tone, surface) => {
    render(<LinkCard {...DOOR} tone={tone} />);
    expect(screen.getByRole("link")).toHaveAttribute("data-surface", surface);
  });

  it("puts 88px media beside the text in a row, and full-width media above it in a stack", () => {
    const { rerender } = render(<LinkCard {...DOOR} media={<div data-testid="photo" />} />);
    expect(screen.getByTestId("photo").parentElement).toHaveClass("size-22");
    rerender(<LinkCard {...DOOR} layout="stack" media={<div data-testid="photo" />} />);
    expect(screen.getByTestId("photo").parentElement).toHaveClass("w-full");
  });

  it("renders into the app's router link with asChild", () => {
    render(
      <LinkCard asChild title="Homely Meals">
        <RouterLink href="/homely-meals" />
      </LinkCard>
    );
    const link = screen.getByRole("link", { name: "Homely Meals" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveAttribute("data-surface", "light");
  });

  it("draws the arrow only when there is a call to action", () => {
    const { container, rerender } = render(<LinkCard href="/menu" title="Restaurant Menu" />);
    expect(container.querySelector("svg")).toBeNull();
    rerender(<LinkCard href="/menu" title="Restaurant Menu" cta="Open menu" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it.each([
    ["an <a>", <LinkCard key="a" {...DOOR} target="_blank" />],
    [
      "asChild",
      <LinkCard key="child" asChild title="Homely Meals">
        <RouterLink href="/homely-meals" target="_blank" />
      </LinkCard>,
    ],
  ])("says a new-tab card opens in a new tab (%s)", (_, card) => {
    render(card);
    expect(screen.getByRole("link")).toHaveAccessibleName(/Opens in a new tab/);
  });

  it("keeps a same-tab card's name to its content", () => {
    render(<LinkCard {...DOOR} />);
    expect(screen.getByRole("link")).not.toHaveAccessibleName(/new tab/);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<LinkCard {...DOOR} media={<span>Box</span>} />);
    await expectNoA11yViolations(container);
  });
});
