import { render, screen } from "@testing-library/react";
import { MapPin, Phone } from "lucide-react";
import { type ComponentProps, createRef } from "react";

import { expectNoA11yViolations } from "#vitest.setup";

import { Fab } from "./fab";

function DemoLink({ children, ...props }: ComponentProps<"a">) {
  return <a {...props}>{children}</a>;
}

describe("Fab", () => {
  it("is named by its label; the label shows only when extended", () => {
    const { rerender } = render(<Fab icon={Phone} label="Call us" />);
    expect(screen.getByRole("button", { name: "Call us" })).toBeInTheDocument();
    expect(screen.queryByText("Call us", { selector: "span:not(.sr-only)" })).toBeNull();
    rerender(<Fab icon={Phone} label="Call us" isExtended />);
    expect(screen.getByRole("button", { name: "Call us" })).toBeInTheDocument();
    expect(screen.getByText("Call us", { selector: "span:not(.sr-only)" })).toBeVisible();
  });

  it("is a button of type button that forwards native props and ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Fab ref={ref} icon={Phone} label="Call us" data-testid="fab" disabled />);
    const button = screen.getByRole("button", { name: "Call us" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-testid", "fab");
    expect(ref.current).toBe(button);
  });

  it.each([
    ["md", "size-fab-md"],
    ["lg", "size-fab-lg"],
  ] as const)("size %s sets the circle", (size, cls) => {
    render(<Fab icon={Phone} label="Call us" size={size} />);
    expect(screen.getByRole("button")).toHaveClass("rounded-pill", cls);
  });

  it("an extended Fab is a pill of the same height", () => {
    render(<Fab icon={Phone} label="Call us" size="lg" isExtended />);
    expect(screen.getByRole("button")).toHaveClass("h-fab-lg", "min-w-fab-lg");
    expect(screen.getByRole("button")).not.toHaveClass("size-fab-lg");
  });

  it("variants paint different fills", () => {
    const { rerender } = render(<Fab icon={Phone} label="Call us" variant="primary" />);
    expect(screen.getByRole("button")).toHaveClass("bg-button-primary-bg");
    rerender(<Fab icon={Phone} label="Call us" variant="secondary" />);
    expect(screen.getByRole("button")).toHaveClass("bg-surface-card", "text-text-brand");
  });

  it("is not positioned by default", () => {
    render(<Fab icon={Phone} label="Call us" />);
    expect(screen.getByRole("button")).not.toHaveClass("fixed");
  });

  it.each([
    ["bottom-end", "end-4"],
    ["bottom-start", "start-4"],
  ] as const)("position %s is fixed on that corner", (position, cls) => {
    render(<Fab icon={Phone} label="Call us" position={position} />);
    expect(screen.getByRole("button")).toHaveClass("fixed", cls, "z-dock");
  });

  it("a fixed Fab clears the mobile action dock", () => {
    render(<Fab icon={Phone} label="Call us" position="bottom-end" />);
    expect(screen.getByRole("button")).toHaveClass("bottom-dock-clearance", "md:bottom-6");
  });

  it("asChild renders a link", () => {
    render(
      <Fab icon={Phone} label="Call us" asChild>
        <DemoLink href="tel:+911244000000" />
      </Fab>
    );
    const link = screen.getByRole("link", { name: "Call us" });
    expect(link).toHaveAttribute("href", "tel:+911244000000");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("merges className and sx", () => {
    render(<Fab icon={Phone} label="Call us" className="uppercase" sx={{ mt: 2 }} />);
    expect(screen.getByRole("button")).toHaveClass("uppercase", "mt-2");
  });

  it("is accessible in both forms", async () => {
    const { container } = render(
      <>
        <Fab icon={Phone} label="Call us" />
        <Fab icon={MapPin} label="Directions" isExtended variant="secondary" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
