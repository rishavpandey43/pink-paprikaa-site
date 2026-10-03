import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { GOOGLE_REVIEWS } from "../story-fixtures";
import { ReviewCarousel } from "./review-carousel";

const HEADING = "Gurgaon eats with us every day.";
const scrollBy = vi.fn();

/** jsdom has no layout: give the track a size and a scroll position, then tell it it scrolled. */
function layOut(track: HTMLElement, { scrollLeft }: { scrollLeft: number }) {
  Object.defineProperties(track, {
    scrollWidth: { configurable: true, value: 3000 },
    clientWidth: { configurable: true, value: 1000 },
    scrollLeft: { configurable: true, writable: true, value: scrollLeft },
  });
  fireEvent.scroll(track);
}

beforeEach(() => {
  scrollBy.mockClear();
  Object.defineProperty(HTMLElement.prototype, "scrollBy", {
    configurable: true,
    writable: true,
    value: scrollBy,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ReviewCarousel", () => {
  it("heads the carousel with its eyebrow and a level-2 heading", () => {
    render(
      <ReviewCarousel
        eyebrow="Verified Google reviews"
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: HEADING })).toBeInTheDocument();
    expect(screen.getByText("Verified Google reviews")).toBeInTheDocument();
  });

  it("renders no eyebrow wrapper for an empty eyebrow", () => {
    render(<ReviewCarousel eyebrow="" heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const titles = screen.getByRole("heading", { name: HEADING }).parentElement;
    expect(titles?.children).toHaveLength(1);
  });

  it("makes the track a keyboard-focusable region named by the heading", () => {
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    expect(track).toHaveAttribute("tabindex", "0");
    expect(track.querySelectorAll("figure")).toHaveLength(GOOGLE_REVIEWS.length);
  });

  it("disables previous at the start and next at the end, keeping both focusable", () => {
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    const previous = screen.getByRole("button", { name: "Previous reviews" });
    const next = screen.getByRole("button", { name: "Next reviews" });

    layOut(track, { scrollLeft: 0 });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(next).toHaveAttribute("aria-disabled", "false");

    layOut(track, { scrollLeft: 900 });
    expect(previous).toHaveAttribute("aria-disabled", "false");
    expect(next).toHaveAttribute("aria-disabled", "false");

    layOut(track, { scrollLeft: 2000 });
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(next).not.toBeDisabled();
  });

  it("pages by 90% of the visible width from the keyboard, and not past an end", async () => {
    const user = userEvent.setup();
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    layOut(track, { scrollLeft: 0 });

    screen.getByRole("button", { name: "Next reviews" }).focus();
    await user.keyboard("{Enter}");
    expect(scrollBy).toHaveBeenCalledWith({ left: 900 });

    scrollBy.mockClear();
    await user.click(screen.getByRole("button", { name: "Previous reviews" }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("honours reduced motion: smooth scrolling is CSS under motion-safe, never forced by script", async () => {
    const user = userEvent.setup();
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    const track = screen.getByRole("region", { name: HEADING });
    expect(track).toHaveClass("motion-safe:scroll-smooth");
    expect(track).not.toHaveClass("scroll-smooth");
    layOut(track, { scrollLeft: 0 });
    await user.click(screen.getByRole("button", { name: "Next reviews" }));
    expect(scrollBy.mock.calls[0]?.[0]).not.toHaveProperty("behavior");
  });

  it("never auto-advances", () => {
    vi.useFakeTimers();
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS} />);
    vi.advanceTimersByTime(60_000);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("shows no controls for one review", () => {
    render(<ReviewCarousel heading={HEADING} reviews={GOOGLE_REVIEWS.slice(0, 1)} />);
    expect(screen.getByRole("region", { name: HEADING })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the empty state and no track when there are no reviews", () => {
    render(
      <ReviewCarousel
        heading={HEADING}
        reviews={[]}
        emptyState={<p>Read our reviews on Google</p>}
      />
    );
    expect(screen.getByText("Read our reviews on Google")).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("links to all the reviews, opening an external link in a new tab", () => {
    render(
      <ReviewCarousel
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
        footerLink={{
          label: "Read all our reviews on Google",
          href: "https://maps.google.com/?q=Pink+Paprikaa",
          isExternal: true,
        }}
      />
    );
    const link = screen.getByRole("link", { name: /Read all our reviews on Google/ });
    expect(link).toHaveAttribute("href", "https://maps.google.com/?q=Pink+Paprikaa");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ReviewCarousel
        eyebrow="Verified Google reviews"
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <ReviewCarousel
        eyebrow="Verified"
        heading={HEADING}
        reviews={GOOGLE_REVIEWS}
        sx={{ mt: 4 }}
        className="italic"
      />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
