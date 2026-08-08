import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Divider } from "./divider";

describe("Divider", () => {
  it("renders a hairline with separator semantics by default", () => {
    render(<Divider />);
    const node = screen.getByRole("separator");
    expect(node).toHaveClass("h-px");
    expect(node).toHaveClass("bg-border-subtle");
  });

  it("centres an ALL CAPS overline when a label is given", () => {
    render(<Divider label="Also Try" />);
    const node = screen.getByText("Also Try");
    expect(node).toHaveClass("uppercase");
    expect(node).toHaveClass("text-overline");
  });

  it("keeps the label readable rather than hiding it inside a separator role", () => {
    render(<Divider label="Also Try" />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(screen.getByText("Also Try")).toBeVisible();
  });

  it("puts a rule on both sides of the label", () => {
    const { container } = render(<Divider label="Also Try" />);
    expect(container.querySelectorAll(".flex-1")).toHaveLength(2);
  });

  it("breaks the section with the brand mark on the diamond variant", () => {
    const { container } = render(<Divider variant="diamond" />);
    const mark = container.querySelector("svg");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveClass("text-text-brand");
  });

  it("ignores a label on the diamond variant", () => {
    render(<Divider label="Also Try" variant="diamond" />);
    expect(screen.queryByText("Also Try")).not.toBeInTheDocument();
  });

  it("flips the hairline to translucent white on a flooded panel", () => {
    render(<Divider on="brand" />);
    expect(screen.getByRole("separator")).toHaveClass("bg-text-on-brand/30");
  });

  it("flips the label and the mark to white on a flooded panel", () => {
    render(<Divider label="Company" on="brand" />);
    expect(screen.getByText("Company")).toHaveClass("text-text-on-brand");

    const { container } = render(<Divider on="brand" variant="diamond" />);
    expect(container.querySelector("svg")).toHaveClass("text-text-on-brand");
  });

  it("merges a caller className", () => {
    render(<Divider className="bg-border-strong" />);
    const node = screen.getByRole("separator");
    expect(node).toHaveClass("bg-border-strong");
    expect(node).not.toHaveClass("bg-border-subtle");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Divider />
        <Divider label="Also Try" />
        <Divider variant="diamond" />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
