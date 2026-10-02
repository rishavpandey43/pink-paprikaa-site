import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CtaBand } from "./cta-band";

const COPY = {
  overline: "Taste it first",
  title: "If you order, the tasting is free.",
  body: "Take one Dawat as a trial at the normal per-head rate.",
};

const patternLayer = (container: HTMLElement) =>
  container.querySelector('section > [aria-hidden="true"]');

describe("CtaBand", () => {
  it("renders the overline, a level-2 title, the body and the action", () => {
    render(<CtaBand {...COPY} action={<a href="#trial">Book a trial Dawat</a>} />);
    expect(screen.getByRole("heading", { level: 2, name: COPY.title })).toBeInTheDocument();
    expect(screen.getByText(COPY.overline)).toBeInTheDocument();
    expect(screen.getByText(COPY.body)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a trial Dawat" })).toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<CtaBand title={COPY.title} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: COPY.title })).toBeInTheDocument();
  });

  it("renders nothing but the title when nothing else is given — no default copy", () => {
    const { container } = render(<CtaBand title={COPY.title} />);
    expect(container.textContent).toBe(COPY.title);
  });

  it("renders no wrapper for an empty overline, body or action", () => {
    const { container } = render(
      <CtaBand title={COPY.title} overline="" body="" action="" pattern="none" />
    );
    const inner = container.querySelector("section > div");
    expect(inner?.children).toHaveLength(1);
    expect(inner?.firstElementChild?.children).toHaveLength(1);
  });

  it("keeps the action clickable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <CtaBand
        title={COPY.title}
        action={
          <button type="button" onClick={onClick}>
            Book a trial Dawat
          </button>
        }
      />
    );
    await user.click(screen.getByRole("button", { name: "Book a trial Dawat" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each([
    ["ink", "bg-surface-inverse"],
    ["brand", "bg-surface-brand"],
    ["soft", "bg-surface-brand-soft"],
  ] as const)("paints the %s field and sets its surface", (tone, background) => {
    const { container } = render(<CtaBand title={COPY.title} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", tone);
    expect(container.firstElementChild).toHaveClass(background);
  });

  it("carries the tiled diamond by default and drops it with pattern=none", () => {
    const { container, rerender } = render(<CtaBand title={COPY.title} />);
    expect(patternLayer(container)).toBeInTheDocument();
    rerender(<CtaBand title={COPY.title} pattern="none" />);
    expect(patternLayer(container)).not.toBeInTheDocument();
  });

  it("sits the action beside the copy with align=split (the default)", () => {
    const { container } = render(
      <CtaBand title={COPY.title} pattern="none" action={<a href="#trial">Book a trial Dawat</a>} />
    );
    expect(container.querySelector("section > div")).toHaveClass("justify-between");
    expect(screen.getByRole("link", { name: "Book a trial Dawat" }).parentElement).toHaveClass(
      "shrink-0"
    );
  });

  it("stacks and centres copy and action with align=center", () => {
    const { container } = render(
      <CtaBand
        title={COPY.title}
        align="center"
        pattern="none"
        action={<a href="#trial">Book a trial Dawat</a>}
      />
    );
    expect(container.querySelector("section > div")).toHaveClass("flex-col", "text-center");
    expect(screen.getByRole("link", { name: "Book a trial Dawat" }).parentElement).toHaveClass(
      "justify-center"
    );
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(<CtaBand title={COPY.title} className="bg-surface-page-alt" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page-alt");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-inverse");
    expect(patternLayer(container)).toHaveClass("bg-transparent");
    expect(patternLayer(container)).not.toHaveClass("bg-surface-inverse");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CtaBand {...COPY} tone="brand" action={<a href="#trial">Book a trial Dawat</a>} />
    );
    await expectNoA11yViolations(container);
  });
});
