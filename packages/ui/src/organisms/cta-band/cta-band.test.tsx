import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Button } from "../../atoms/button/button";
import { CtaBand } from "./cta-band";

const ACTION = (
  <Button on="brand" size="lg">
    Apply to Franchise
  </Button>
);

describe("CtaBand", () => {
  it("renders the overline, heading and body copy", () => {
    render(
      <CtaBand
        body="Six outlets on one playbook. Applications open for 2027."
        overline="Franchise"
        title="Bring Pink Paprikaa to your city"
      />
    );

    expect(screen.getByText("Franchise")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Bring Pink Paprikaa to your city" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Six outlets on one playbook. Applications open for 2027.")
    ).toBeInTheDocument();
  });

  it("renders the heading at the requested outline level", () => {
    render(<CtaBand headingLevel={3} title="Bring Pink Paprikaa to your city" />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Bring Pink Paprikaa to your city" })
    ).toBeInTheDocument();
  });

  it("renders the action and keeps it clickable", async () => {
    const handleClick = vi.fn();
    render(
      <CtaBand
        action={<Button onClick={handleClick}>Apply to Franchise</Button>}
        title="Bring Pink Paprikaa to your city"
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Apply to Franchise" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("renders nothing extra when there is no action", () => {
    render(<CtaBand title="Bring Pink Paprikaa to your city" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["ink", "bg-surface-inverse"],
    ["brand", "bg-surface-brand"],
    ["soft", "bg-surface-brand-soft"],
  ] as const)("floods the %s ground", (tone, expected) => {
    const { container } = render(<CtaBand title="Bring Pink Paprikaa to your city" tone={tone} />);

    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("sits the action beside the heading when split", () => {
    render(<CtaBand action={ACTION} align="split" title="Bring Pink Paprikaa to your city" />);

    expect(screen.getByRole("button", { name: "Apply to Franchise" }).parentElement).toHaveClass(
      "shrink-0"
    );
  });

  it("stacks the action under the heading when centred", () => {
    render(<CtaBand action={ACTION} align="center" title="Bring Pink Paprikaa to your city" />);

    expect(screen.getByRole("button", { name: "Apply to Franchise" }).parentElement).toHaveClass(
      "justify-center"
    );
  });

  it("inverts the type on a flooded ground and keeps it dark on soft", () => {
    const { rerender } = render(<CtaBand title="Order before you leave the house" tone="brand" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-text-on-brand");

    rerender(<CtaBand title="Order before you leave the house" tone="soft" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-text-heading");
  });

  it("merges a caller className", () => {
    const { container } = render(
      <CtaBand className="rounded-5" title="Bring Pink Paprikaa to your city" />
    );

    expect(container.firstElementChild).toHaveClass("rounded-5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CtaBand
        action={ACTION}
        body="Six outlets on one playbook. Applications open for 2027."
        overline="Franchise"
        title="Bring Pink Paprikaa to your city"
      />
    );
    await expectNoA11yViolations(container);
  });
});
