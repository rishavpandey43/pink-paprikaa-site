import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { Steps } from "./steps";

const HOW_IT_WORKS = [
  { title: "Pick on the site", description: "Choose a plan or a Dawat. The price is right there." },
  {
    title: "Confirm on WhatsApp",
    description: "Your choices arrive pre-written. We reply and lock it in.",
  },
  { title: "We cook and deliver" },
];

describe("Steps", () => {
  it("is an ordered list with one item per step", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(3);
    // Explicit, so Safari/VoiceOver keeps the list semantics that list-style:none strips.
    expect(screen.getByRole("list")).toHaveAttribute("role", "list");
  });

  it("titles each step as a level-3 heading by default", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Pick on the site",
      "Confirm on WhatsApp",
      "We cook and deliver",
    ]);
  });

  it("uses the heading level the page needs", () => {
    render(<Steps items={HOW_IT_WORKS} headingLevel={4} />);
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(3);
  });

  it("numbers circle steps 1, 2, 3 in pink discs", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    const marker = screen.getByText("1");
    expect(marker).toHaveClass("rounded-pill", "bg-surface-brand");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("numbers rule steps 01, 02, 03 under a brand rule", () => {
    render(<Steps items={HOW_IT_WORKS} variant="rule" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("border-t-3", "border-border-brand");
  });

  it("shows a description only where one is given", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    const [, , last] = screen.getAllByRole("listitem");
    expect(
      screen.getByText("Choose a plan or a Dawat. The price is right there.")
    ).toBeInTheDocument();
    expect(last?.querySelector("p")).toBeNull();
  });

  it.each(["circle", "rule"] as const)("has no accessibility violations (%s)", async (variant) => {
    const { container } = render(<Steps items={HOW_IT_WORKS} variant={variant} />);
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <Steps items={[{ title: "Order" }]} sx={{ m: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("m-4", "italic");
  });
});
