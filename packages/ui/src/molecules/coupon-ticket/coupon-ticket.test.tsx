import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CouponTicket } from "./coupon-ticket";

const TICKET = {
  code: "PAPRIKAA50",
  headline: "50% off your first order",
  terms: "One use per guest. Dine-in and pickup. Till 30 Sep.",
} as const;

afterEach(() => {
  vi.useRealTimers();
});

describe("CouponTicket", () => {
  it("shows the headline, the terms, the code and the logo", () => {
    render(<CouponTicket {...TICKET} />);
    expect(screen.getByText(TICKET.headline)).toBeInTheDocument();
    expect(screen.getByText(TICKET.terms)).toBeInTheDocument();
    expect(screen.getByText(TICKET.code)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ })).toBeInTheDocument();
  });

  it("copies the code from the stub, confirms it, and reports the copied code", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<CouponTicket {...TICKET} onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: /Use code PAPRIKAA50/ }));
    expect(await navigator.clipboard.readText()).toBe(TICKET.code);
    expect(onCopy).toHaveBeenCalledWith(TICKET.code);
    // The label stays "Use code": only the hint flashes, never "Copied PAPRIKAA50 Copied".
    expect(screen.getByRole("button")).toHaveAccessibleName("Use code PAPRIKAA50 Copied");
    // A screen reader hears "Copied" once, from the one live region.
    const live = document.querySelectorAll("[aria-live]");
    expect(live).toHaveLength(1);
    expect(live[0]).toHaveAttribute("aria-live", "polite");
    expect(live[0]).toHaveTextContent(/^Copied$/);
  });

  it("copies from the keyboard", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<CouponTicket {...TICKET} onCopy={onCopy} />);
    await user.tab();
    expect(screen.getByRole("button", { name: /Use code/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(await screen.findAllByText("Copied")).not.toHaveLength(0);
    expect(onCopy).toHaveBeenCalledWith(TICKET.code);
  });

  it("returns to its hint once the confirmation has been seen", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    render(<CouponTicket {...TICKET} />);
    await user.click(screen.getByRole("button", { name: /Use code/ }));
    expect(screen.getAllByText("Copied")).not.toHaveLength(0);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("Tap to copy")).toBeInTheDocument();
    // The reset is silent: the live region empties rather than announcing "Tap to copy".
    expect(document.querySelector("[aria-live]")).toBeEmptyDOMElement();
  });

  it("never claims a copy the browser refused — it selects the code to copy by hand", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    const onCopy = vi.fn();
    render(<CouponTicket {...TICKET} onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: /Use code/ }));
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
    expect(window.getSelection()?.toString()).toBe(TICKET.code);
  });

  it("is plain artwork when not copyable — nothing to tap", () => {
    render(<CouponTicket {...TICKET} isCopyable={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("Tap to copy")).not.toBeInTheDocument();
    expect(screen.getByText(TICKET.code)).toBeInTheDocument();
  });

  it("takes its stub words from props", () => {
    render(<CouponTicket {...TICKET} codeLabel="Code" copyHint="Copy" />);
    expect(screen.getByRole("button", { name: /Code PAPRIKAA50 Copy/ })).toBeInTheDocument();
  });

  it.each([
    ["brand", "brand"],
    ["light", "light"],
  ] as const)("sets the %s surface so its text follows the field", (tone, surface) => {
    const { container } = render(<CouponTicket {...TICKET} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", surface);
  });

  it("colours the punched notches to match the ground behind the ticket", () => {
    const { container } = render(<CouponTicket {...TICKET} notch="brand" />);
    const notches = container.querySelectorAll('[aria-hidden="true"] > .rounded-pill');
    expect(notches).toHaveLength(2);
    for (const notch of notches) expect(notch).toHaveClass("bg-surface-brand");
  });

  it("sets the headline at artwork size for lg", () => {
    render(<CouponTicket {...TICKET} size="lg" />);
    expect(screen.getByText(TICKET.headline)).toHaveClass("text-coupon-ticket-headline-lg");
  });

  it("stacks at phone width and splits from sm; artwork (lg) always splits", () => {
    const { container, rerender } = render(<CouponTicket {...TICKET} />);
    expect(container.firstElementChild).toHaveClass("flex-col", "sm:flex-row");
    rerender(<CouponTicket {...TICKET} size="lg" />);
    expect(container.firstElementChild).not.toHaveClass("flex-col");
  });

  it("lets a caller className replace the ticket radius", () => {
    const { container } = render(<CouponTicket {...TICKET} className="rounded-lg" />);
    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("rounded-xl");
  });

  it("has no accessibility violations, copyable and as print artwork", async () => {
    const { container } = render(
      <>
        <CouponTicket {...TICKET} />
        <CouponTicket
          code="CHAI20"
          headline="20% off all chai, all week"
          terms="Dine-in only. Till 30 Sep."
          tone="light"
          isCopyable={false}
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
