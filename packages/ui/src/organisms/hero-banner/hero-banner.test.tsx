import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { HeroBanner } from "./hero-banner";

const TITLE = "Desi at heart. Urban by nature.";
const META = ["Est. 2025", "Sector 57, Gurgaon", "Open till 11:30pm"];

const patternLayer = (container: HTMLElement) =>
  container.querySelector('section > [aria-hidden="true"]');

describe("HeroBanner", () => {
  it("renders its title as the page's h1 by default", () => {
    render(<HeroBanner title={TITLE} />);
    expect(screen.getByRole("heading", { level: 1, name: TITLE })).toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<HeroBanner title={TITLE} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: TITLE })).toBeInTheDocument();
  });

  it("sets the title in the fluid display-1 step by default, so it never overflows", () => {
    render(<HeroBanner title={TITLE} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-display-1-fluid");
  });

  it("renders the badges, overline, body and actions it is given — and nothing else", () => {
    const { container } = render(
      <HeroBanner
        badges={<span>Pure Veg</span>}
        overline="Homely Meals"
        title={TITLE}
        body="Pure veg lunch and dinner."
        actions={<a href="#plans">See plans</a>}
        pattern="none"
      />
    );
    expect(screen.getByRole("link", { name: "See plans" })).toBeInTheDocument();
    expect(container.textContent).toBe(
      `Pure VegHomely Meals${TITLE}Pure veg lunch and dinner.See plans`
    );
  });

  it("renders no wrapper for an empty badges, overline, body, actions or media slot", () => {
    const { container } = render(
      <HeroBanner badges="" overline="" title={TITLE} body="" actions="" media="" pattern="none" />
    );
    const inner = container.querySelector("section > div");
    expect(inner?.children).toHaveLength(1);
    expect(inner?.firstElementChild?.children).toHaveLength(1);
  });

  it("renders the wrapper for a 0 badges, overline, body, actions or media — a number is content", () => {
    const { container } = render(
      <HeroBanner
        badges={0}
        overline={0}
        title={TITLE}
        body={0}
        actions={0}
        media={0}
        pattern="none"
      />
    );
    const inner = container.querySelector("section > div");
    expect(inner?.children).toHaveLength(2);
    expect(inner?.firstElementChild?.children).toHaveLength(5);
  });

  it("lists the meta facts with a decorative diamond between each pair", () => {
    render(<HeroBanner title={TITLE} meta={META} />);
    const list = screen.getByRole("list");
    // Safari drops list semantics under `list-style: none` unless the role is explicit.
    expect(list).toHaveAttribute("role", "list");
    const facts = within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(facts).toEqual(META);
    // SymbolMark is a masked `<span>`, not an svg.
    expect(list.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it("skips an empty meta fact — no bare item, no stray diamond — and a list of none", () => {
    const { rerender } = render(
      <HeroBanner title={TITLE} meta={["Est. 2025", "", "Sector 57, Gurgaon"]} />
    );
    const list = screen.getByRole("list");
    const facts = within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(facts).toEqual(["Est. 2025", "Sector 57, Gurgaon"]);
    expect(list.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    rerender(<HeroBanner title={TITLE} meta={["", null]} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("puts the media slot in a positioned column for overlays such as an OfferSeal", () => {
    render(
      <HeroBanner
        title={TITLE}
        media={<img src="hero.jpg" alt="A Homely Meals box" width={400} height={300} />}
      />
    );
    expect(screen.getByRole("img", { name: "A Homely Meals box" }).parentElement).toHaveClass(
      "relative",
      "min-w-0"
    );
  });

  it.each([
    ["brand", "brand"],
    ["ink", "ink"],
    ["soft", "soft"],
    ["alt", "light"],
  ] as const)("tone %s sets the %s surface", (tone, surface) => {
    const { container } = render(<HeroBanner title={TITLE} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", surface);
  });

  it.each(["brand", "ink", "soft"] as const)(
    "carries the diamond on the %s field by default",
    (tone) => {
      const { container } = render(<HeroBanner title={TITLE} tone={tone} />);
      expect(patternLayer(container)).toBeInTheDocument();
    }
  );

  it("carries no diamond on the alt tint unless asked, nor on a flooded field with pattern=none", () => {
    const { container, rerender } = render(<HeroBanner title={TITLE} tone="alt" />);
    expect(patternLayer(container)).not.toBeInTheDocument();
    rerender(<HeroBanner title={TITLE} tone="alt" pattern="faint" />);
    expect(patternLayer(container)).toBeInTheDocument();
    rerender(<HeroBanner title={TITLE} tone="brand" pattern="none" />);
    expect(patternLayer(container)).not.toBeInTheDocument();
  });

  it("hands the faint density to the diamond", () => {
    const { container, rerender } = render(<HeroBanner title={TITLE} tone="ink" pattern="faint" />);
    const tint = () => patternLayer(container)?.firstElementChild;
    expect(tint()).toHaveClass("pattern-opacity-faint");
    rerender(<HeroBanner title={TITLE} tone="ink" />);
    expect(tint()).toHaveClass("pattern-opacity-default");
  });

  it("sets the split media beside the copy from lg and stacks it below; center has one column", () => {
    const { container, rerender } = render(<HeroBanner title={TITLE} pattern="none" />);
    const inner = () => container.querySelector("section > div");
    expect(inner()).toHaveClass("grid", "lg:grid-cols-2");
    expect(inner()?.className).not.toMatch(/(^|\s)grid-cols-/);
    rerender(<HeroBanner title={TITLE} layout="center" pattern="none" />);
    expect(inner()).not.toHaveClass("lg:grid-cols-2");
  });

  it("uses the display-2 ramp for a long headline", () => {
    render(
      <HeroBanner
        title="Feeding thirty people? It has to be right the first time."
        titleSize="display-2"
      />
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-display-2-fluid");
  });

  it("centres everything with layout=center", () => {
    const { container } = render(<HeroBanner title={TITLE} layout="center" pattern="none" />);
    expect(container.querySelector("section > div")).toHaveClass("text-center");
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(<HeroBanner title={TITLE} className="bg-surface-page" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-brand");
    expect(patternLayer(container)).toHaveClass("bg-transparent");
    expect(patternLayer(container)).not.toHaveClass("bg-surface-brand");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <HeroBanner
        overline="India's First Desi Urban Café"
        title={TITLE}
        meta={META}
        actions={<a href="#order">Order Now</a>}
        media={<img src="hero.jpg" alt="Chilli paneer" width={400} height={500} />}
      />
    );
    await expectNoA11yViolations(container);
  });
});
