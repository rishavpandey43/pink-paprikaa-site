import { render, screen } from "@testing-library/react";

import type { AccordionItem } from "../../molecules/accordion/accordion";

import { expectNoA11yViolations } from "../../../vitest.setup";
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
    const { container } = render(<FaqSection title="FAQ" items={ITEMS} isMultiple />);
    for (const answer of container.querySelectorAll("details")) {
      expect(answer).not.toHaveAttribute("name");
    }
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
});
