import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Divider } from "./divider";

describe("Divider", () => {
  it("is a hairline separator in the surface's subtle border by default", () => {
    render(<Divider />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("h-px", "w-full", "bg-border-subtle");
    expect(rule).toBeEmptyDOMElement();
    expect(rule).not.toHaveAttribute("aria-orientation");
  });

  it("centres an uppercase overline label between two rules, and names the separator with it", () => {
    render(<Divider label="Also Try" />);
    const rule = screen.getByRole("separator", { name: "Also Try" });
    expect(rule).toHaveClass("flex", "items-center", "gap-3.5");
    expect(within(rule).getByText("Also Try")).toHaveClass(
      "font-display",
      "text-overline",
      "uppercase",
      "text-text-subtle"
    );
    expect(rule.querySelectorAll(".bg-border-subtle")).toHaveLength(2);
  });

  it("breaks a section with the diamond mark in the surface-aware mark colour", () => {
    render(<Divider variant="diamond" />);
    const rule = screen.getByRole("separator");
    const mark = rule.querySelector(".mask-symbol");
    expect(rule).toHaveClass("flex", "gap-3");
    expect(mark).toHaveClass("size-divider-mark", "text-divider-mark", "opacity-90");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(rule.querySelector("svg")).toBeNull();
    expect(rule.querySelectorAll(".bg-border-subtle")).toHaveLength(2);
  });

  it("names a diamond break with its label without printing it", () => {
    render(<Divider variant="diamond" label="Company" />);
    expect(screen.getByRole("separator", { name: "Company" })).toBeInTheDocument();
    expect(screen.queryByText("Company")).not.toBeInTheDocument();
  });

  it("draws a plain vertical rule", () => {
    render(<Divider orientation="vertical" label="Between" />);
    const rule = screen.getByRole("separator", { name: "Between" });
    expect(rule).toHaveAttribute("aria-orientation", "vertical");
    expect(rule).toHaveClass("w-px", "self-stretch", "bg-border-subtle");
    expect(rule).toBeEmptyDOMElement();
  });

  it("merges a consumer className and forwards native props", () => {
    render(<Divider className="my-6" id="rule" />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("my-6", "h-px");
    expect(rule).toHaveAttribute("id", "rule");
  });

  it("lets a consumer className replace the rule colour", () => {
    render(<Divider className="bg-border-strong" />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("bg-border-strong");
    expect(rule).not.toHaveClass("bg-border-subtle");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Divider />
        <Divider label="Also Try" />
        <Divider variant="diamond" />
        <Divider orientation="vertical" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
