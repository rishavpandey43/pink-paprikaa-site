import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import type { AccordionItem } from "../../molecules/accordion/accordion";
import { FaqSection } from "./faq-section";

const ITEMS: AccordionItem[] = [
  {
    value: "veg",
    question: "Is it really pure vegetarian?",
    answer: "One kitchen, pure vegetarian, no exceptions. No egg, no meat, ever.",
  },
  {
    value: "pause",
    question: "Can I pause or skip a day?",
    answer: "Yes. Tell us by 9pm the day before.",
  },
  { value: "gst", question: "Do I get a GST bill?", answer: "Yes, for every order." },
];

describe("FaqSection", () => {
  it("heads the section with overline, a level-2 title and the lede", () => {
    render(
      <FaqSection
        overline="Questions"
        title="Before you order"
        lede="The things people ask us most."
        items={ITEMS}
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: "Before you order" })).toBeInTheDocument();
    expect(screen.getByText("Questions")).toBeInTheDocument();
    expect(screen.getByText("The things people ask us most.")).toBeInTheDocument();
  });

  it("makes each question a heading one level below the title", () => {
    render(<FaqSection title="FAQ" items={ITEMS} />);
    const questions = screen.getAllByRole("heading", { level: 3 });
    expect(questions.map((question) => question.textContent)).toEqual(
      ITEMS.map((item) => item.question)
    );
    for (const question of questions) expect(question.closest("summary")).not.toBeNull();
  });

  it("takes its heading level from headingLevel and steps the questions down with it, to h6 at most", () => {
    const { rerender } = render(<FaqSection title="FAQ" items={ITEMS} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "FAQ" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(ITEMS.length);
    rerender(<FaqSection title="FAQ" items={ITEMS} headingLevel={6} />);
    expect(screen.getAllByRole("heading", { level: 6 })).toHaveLength(ITEMS.length + 1);
  });

  it("opens the first answer by default and keeps one open at a time", () => {
    const { container } = render(<FaqSection title="FAQ" items={ITEMS} />);
    const answers = [...container.querySelectorAll("details")];
    expect(answers).toHaveLength(3);
    expect(answers[0]).toHaveAttribute("open");
    expect(container.querySelectorAll("details[open]")).toHaveLength(1);
    const names = new Set(answers.map((answer) => answer.getAttribute("name")));
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
  });

  it("opens the answers named in defaultOpen instead of the first", () => {
    const { container } = render(<FaqSection title="FAQ" items={ITEMS} defaultOpen={["pause"]} />);
    const answers = [...container.querySelectorAll("details")];
    expect(answers[0]).not.toHaveAttribute("open");
    expect(answers[1]).toHaveAttribute("open");
    expect(container.querySelectorAll("details[open]")).toHaveLength(1);
  });

  it("opens none when defaultOpen is empty", () => {
    const { container } = render(<FaqSection title="FAQ" items={ITEMS} defaultOpen={[]} />);
    expect(container.querySelectorAll("details[open]")).toHaveLength(0);
  });

  it("lets several answers stay open with isMultiple", () => {
    const { container } = render(
      <FaqSection title="FAQ" items={ITEMS} isMultiple defaultOpen={["veg", "pause"]} />
    );
    for (const answer of container.querySelectorAll("details")) {
      expect(answer).not.toHaveAttribute("name");
    }
    expect(container.querySelectorAll("details[open]")).toHaveLength(2);
  });

  it("puts the aside beside the heading in the column that sticks at lg", () => {
    render(<FaqSection title="FAQ" items={ITEMS} aside={<p>Still have a question?</p>} />);
    const lead = screen.getByText("Still have a question?").closest('[class~="lg:sticky"]');
    expect(lead).toContainElement(screen.getByRole("heading", { name: "FAQ" }));
    expect(lead).toHaveClass("lg:top-faq-section-sticky");
  });

  it("merges a caller className", () => {
    const { container } = render(
      <FaqSection title="FAQ" items={ITEMS} className="bg-surface-page-alt" />
    );
    expect(container.firstElementChild).toHaveClass("section-y", "bg-surface-page-alt");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <FaqSection overline="Questions" title="Before you order" items={ITEMS} aside={<p>Help</p>} />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <FaqSection title="FAQ" items={ITEMS} sx={{ mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
