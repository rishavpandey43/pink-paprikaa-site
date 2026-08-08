import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CouponTicket } from "./coupon-ticket";

const HEADLINE = "50% off your first order";
const TERMS = "One use per guest. Dine-in and pickup. Till 30 Sep.";

describe("CouponTicket", () => {
  it("prints the code, the headline and the terms", () => {
    render(<CouponTicket code="PAPRIKAA50" headline={HEADLINE} terms={TERMS} />);

    expect(screen.getByText("PAPRIKAA50")).toBeInTheDocument();
    expect(screen.getByText(HEADLINE)).toBeInTheDocument();
    expect(screen.getByText(TERMS)).toBeInTheDocument();
  });

  it("omits the terms line when there is none", () => {
    render(<CouponTicket code="CHAI20" headline={HEADLINE} />);
    expect(screen.queryByText(TERMS)).not.toBeInTheDocument();
  });

  it("makes the stub a copy button named by its code", () => {
    render(<CouponTicket code="PAPRIKAA50" headline={HEADLINE} />);
    expect(screen.getByRole("button", { name: "Copy code PAPRIKAA50" })).toBeInTheDocument();
  });

  it("writes the code to the clipboard when the stub is pressed", async () => {
    const user = userEvent.setup();
    render(<CouponTicket code="PAPRIKAA50" headline={HEADLINE} />);

    await user.click(screen.getByRole("button", { name: "Copy code PAPRIKAA50" }));

    expect(await navigator.clipboard.readText()).toBe("PAPRIKAA50");
  });

  it("calls onCopy with the code so a Snackbar can confirm it", async () => {
    const user = userEvent.setup();
    const handleCopy = vi.fn();
    render(<CouponTicket code="PAPRIKAA50" headline={HEADLINE} onCopy={handleCopy} />);

    await user.click(screen.getByRole("button", { name: "Copy code PAPRIKAA50" }));

    expect(handleCopy).toHaveBeenCalledOnce();
    expect(handleCopy).toHaveBeenCalledWith("PAPRIKAA50");
  });

  it("flashes the copied state on the stub and announces it", async () => {
    const user = userEvent.setup();
    render(<CouponTicket code="PAPRIKAA50" headline={HEADLINE} />);

    expect(screen.getByText("Use code")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copy code PAPRIKAA50" }));

    expect(screen.queryByText("Use code")).not.toBeInTheDocument();
    expect(screen.getByText("Code PAPRIKAA50 copied.")).toBeInTheDocument();
  });

  it("is reachable from the keyboard", async () => {
    const user = userEvent.setup();
    const handleCopy = vi.fn();
    render(<CouponTicket code="PAPRIKAA50" headline={HEADLINE} onCopy={handleCopy} />);

    await user.tab();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "Copy code PAPRIKAA50" })).toHaveFocus();
    expect(handleCopy).toHaveBeenCalledOnce();
    expect(handleCopy).toHaveBeenCalledWith("PAPRIKAA50");
  });

  it("has nothing tappable on print artwork", () => {
    render(<CouponTicket code="PAPRIKAA50" headline={HEADLINE} isCopyable={false} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("Tap to copy")).not.toBeInTheDocument();
    expect(screen.getByText("PAPRIKAA50")).toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-brand-primary"],
    ["light", "bg-surface-card"],
  ] as const)("renders the %s skin", (tone, expected) => {
    const { container } = render(
      <CouponTicket code="PAPRIKAA50" headline={HEADLINE} tone={tone} />
    );
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it.each([
    ["md", "text-h1"],
    ["lg", "text-display2"],
  ] as const)("steps the headline for the %s ticket", (size, expected) => {
    render(<CouponTicket code="PAPRIKAA50" headline={HEADLINE} size={size} />);
    expect(screen.getByText(HEADLINE)).toHaveClass(expected);
  });

  it("stacks below the sm breakpoint and only splits above it", () => {
    const { container } = render(<CouponTicket code="PAPRIKAA50" headline={HEADLINE} />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("flex-col");
    expect(node).toHaveClass("sm:flex-row");
  });

  it("colours the punched notches to match the surface behind the ticket", () => {
    const { container } = render(
      <CouponTicket code="PAPRIKAA50" headline={HEADLINE} position="sunken" />
    );
    expect(container.querySelectorAll(".bg-surface-sunken")).toHaveLength(2);
  });

  it("merges a caller className", () => {
    const { container } = render(
      <CouponTicket className="rounded-1" code="PAPRIKAA50" headline={HEADLINE} />
    );
    const node = container.firstElementChild;

    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <CouponTicket code="PAPRIKAA50" headline={HEADLINE} terms={TERMS} />
        <CouponTicket
          code="CHAI20"
          headline="20% off all chai, all week"
          isCopyable={false}
          terms="Dine-in only. Till 30 Sep."
          tone="light"
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
