import { act, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Countdown } from "./countdown";

const ENDS_AT = "2026-10-31T23:59:59+05:30";
/** One day and five seconds before ENDS_AT. */
const NOW = new Date("2026-10-30T23:59:54+05:30");

beforeEach(() => {
  // Only the clock is faked: React's scheduler and axe keep their real timers.
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Countdown", () => {
  it("renders a stable placeholder on the server — no time-dependent digits in the HTML", () => {
    const html = renderToString(<Countdown endsAt={ENDS_AT} label="Offer closes in" />);
    expect(html).toMatch(/datetime="2026-10-31T23:59:59\+05:30"/i);
    expect(html).toContain("--d --h --m --s");
    expect(html).not.toMatch(/\d+d \d{2}h/);
  });

  it("hydrates without a mismatch, then shows the real time left", async () => {
    const element = <Countdown endsAt={ENDS_AT} label="Offer closes in" />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const onRecoverableError = vi.fn();

    const root = await act(() => hydrateRoot(container, element, { onRecoverableError }));

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container).toHaveTextContent("Offer closes in 1d 00h 00m 05s");
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("ticks once a second after mount", () => {
    render(<Countdown endsAt={ENDS_AT} />);
    const time = screen.getByText("1d 00h 00m 05s");
    expect(time.tagName).toBe("TIME");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(time).toHaveTextContent("1d 00h 00m 04s");
  });

  it("swaps to the fallback the second the offer ends", () => {
    vi.setSystemTime(new Date("2026-10-31T23:59:57+05:30"));
    render(<Countdown endsAt={ENDS_AT} fallback={<span>Offer closed</span>} />);
    expect(screen.getByText("0d 00h 00m 02s")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("0d 00h 00m 01s")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Offer closed")).toBeInTheDocument();
    expect(document.querySelector("time")).not.toBeInTheDocument();
  });

  it("renders nothing by default once ended — a cached page never shows an expired offer", () => {
    vi.setSystemTime(new Date("2026-11-01T00:00:00+05:30"));
    const { container } = render(<Countdown endsAt={ENDS_AT} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("runs one interval while mounted and clears it on unmount", () => {
    const { unmount } = render(<Countdown endsAt={ENDS_AT} />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reads its label before the time, for assistive tech only", () => {
    render(<Countdown endsAt={ENDS_AT} label="Offer closes in" />);
    const time = document.querySelector("time");
    expect(screen.getByText("Offer closes in")).toHaveClass("sr-only");
    expect(time).toHaveTextContent("Offer closes in 1d 00h 00m 05s");
    expect(time).toHaveAttribute("datetime", ENDS_AT);
  });

  it("reads no label for a blank one (R48)", () => {
    render(<Countdown endsAt={ENDS_AT} label="  " />);
    expect(document.querySelector("time .sr-only")).not.toBeInTheDocument();
    expect(document.querySelector("time")).toHaveTextContent(/^1d 00h 00m 05s$/);
  });

  it("is the handoff's mono ink pill", () => {
    render(<Countdown endsAt={ENDS_AT} />);
    expect(screen.getByText("1d 00h 00m 05s")).toHaveClass(
      "rounded-pill",
      "bg-surface-inverse",
      "font-mono",
      "font-bold",
      "text-text-on-inverse"
    );
  });

  it.each(["2026-10-31T23:59:59", "31 October 2026", ""])(
    "rejects %j — an end time needs an ISO offset",
    (endsAt) => {
      expect(() => renderToString(<Countdown endsAt={endsAt} />)).toThrow(RangeError);
    }
  );

  it("has no accessibility violations", async () => {
    const { container } = render(<Countdown endsAt={ENDS_AT} label="Offer closes in" />);
    await expectNoA11yViolations(container);
  });
});
