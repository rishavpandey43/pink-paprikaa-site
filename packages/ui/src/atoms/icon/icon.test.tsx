import { render, screen } from "@testing-library/react";
import { ShoppingBag } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Icon } from "./icon";

describe("Icon", () => {
  it("hides a decorative icon from assistive technology", () => {
    const { container } = render(<Icon icon={ShoppingBag} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("exposes a labelled icon as an image", () => {
    render(<Icon icon={ShoppingBag} label="Order now" />);
    expect(screen.getByRole("img", { name: "Order now" })).toBeInTheDocument();
  });

  it.each([
    ["xs", "size-3.5"],
    ["sm", "size-4"],
    ["md", "size-5"],
    ["lg", "size-6"],
    ["xl", "size-8"],
  ] as const)("renders the %s size", (size, expected) => {
    const { container } = render(<Icon icon={ShoppingBag} size={size} />);
    expect(container.querySelector("svg")).toHaveClass(expected);
  });

  it("thickens the stroke on the two smallest sizes so weight reads evenly", () => {
    const { container: small } = render(<Icon icon={ShoppingBag} size="sm" />);
    const { container: large } = render(<Icon icon={ShoppingBag} size="xl" />);
    expect(small.querySelector("svg")).toHaveAttribute("stroke-width", "2");
    expect(large.querySelector("svg")).toHaveAttribute("stroke-width", "1.75");
  });

  it("merges a caller className", () => {
    const { container } = render(<Icon className="size-8" icon={ShoppingBag} size="md" />);
    expect(container.querySelector("svg")).toHaveClass("size-8");
    expect(container.querySelector("svg")).not.toHaveClass("size-5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Icon icon={ShoppingBag} label="Order now" />);
    await expectNoA11yViolations(container);
  });
});
