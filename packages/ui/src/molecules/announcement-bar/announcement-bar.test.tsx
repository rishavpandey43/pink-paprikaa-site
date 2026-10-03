import { act, render, screen } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { AnnouncementBar } from "./announcement-bar";

const DAY_MS = 86_400_000;
const inDays = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString();

function RouterLink({ children, ...props }: LinkAsProps) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("AnnouncementBar", () => {
  it("shows its message on the brand strip", () => {
    const { container } = render(
      <AnnouncementBar>Launch price: Classic at ₹130 a meal</AnnouncementBar>
    );
    expect(screen.getByText("Launch price: Classic at ₹130 a meal")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-surface", "brand");
  });

  it("makes the whole strip one link when given an href", () => {
    render(
      <AnnouncementBar href="/homely-meals">Launch price: Classic at ₹130 a meal</AnnouncementBar>
    );
    expect(screen.getByRole("link", { name: /Launch price/ })).toHaveAttribute(
      "href",
      "/homely-meals"
    );
  });

  it("renders the link through the app's router link", () => {
    render(
      <AnnouncementBar href="/homely-meals" linkAs={RouterLink}>
        Launch price
      </AnnouncementBar>
    );
    expect(screen.getByRole("link", { name: /Launch price/ })).toHaveAttribute("data-router");
  });

  it("counts down to endsAt", () => {
    const endsAt = inDays(3);
    const { container } = render(<AnnouncementBar endsAt={endsAt}>Launch price</AnnouncementBar>);
    expect(container.querySelector("time")).toHaveAttribute("datetime", endsAt);
  });

  it("stays up, with no countdown, when there is no endsAt", () => {
    const { container } = render(<AnnouncementBar>Launch price</AnnouncementBar>);
    expect(container.querySelector("time")).toBeNull();
    expect(screen.getByText("Launch price")).toBeInTheDocument();
  });

  it("renders nothing once endsAt has passed — no empty strip left above the header", () => {
    const { container } = render(
      <AnnouncementBar endsAt="2025-01-01T00:00:00+05:30" href="/homely-meals">
        Launch price
      </AnnouncementBar>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("disappears the moment it expires while the page is open", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-31T23:59:58+05:30"));
    const { container } = render(
      <AnnouncementBar endsAt="2026-10-31T23:59:59+05:30">Launch price</AnnouncementBar>
    );
    expect(screen.getByText("Launch price")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("rejects an endsAt it cannot read instead of never expiring", () => {
    // A server component is a plain function: call it to see the throw directly.
    expect(() => AnnouncementBar({ endsAt: "end of October", children: "Launch price" })).toThrow(
      RangeError
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AnnouncementBar href="/homely-meals" endsAt={inDays(3)}>
        Launch price: Classic at ₹130 a meal · closes in
      </AnnouncementBar>
    );
    // The message already leads into the countdown, so it is read once.
    expect(screen.getByRole("link").textContent.match(/closes in/g)).toHaveLength(1);
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <AnnouncementBar sx={{ mt: 4 }} className="italic">
        Launch week
      </AnnouncementBar>
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
