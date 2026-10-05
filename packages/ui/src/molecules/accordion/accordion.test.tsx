import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Accordion, type AccordionItem } from "./accordion";

const FAQ: AccordionItem[] = [
  {
    value: "veg",
    question: "Is everything vegetarian?",
    answer: "Yes. The whole kitchen is pure vegetarian — no meat, no egg.",
  },
  {
    value: "delivery",
    question: "Do you deliver?",
    answer: "Pickup only for now. Delivery starts in 2027.",
  },
  {
    value: "booking",
    question: "Can I book a table?",
    answer: "Yes, up to 6 guests online. Larger groups, give us a call.",
  },
];

function detailsOf(container: HTMLElement): HTMLDetailsElement[] {
  return [...container.querySelectorAll("details")];
}

describe("Accordion", () => {
  it("renders each item as a native disclosure with its question as the summary", () => {
    const { container } = render(<Accordion items={FAQ} />);
    const details = detailsOf(container);
    expect(details).toHaveLength(3);
    expect(details[0]?.querySelector("summary")).toHaveTextContent("Is everything vegetarian?");
  });

  it("keeps every answer in the page, open or closed — find-in-page and search engines see them all", () => {
    render(<Accordion items={FAQ} />);
    for (const item of FAQ) {
      const answer = screen.getByText(item.answer as string);
      expect(answer).toBeInTheDocument();
      expect(answer).not.toHaveAttribute("hidden");
      expect(answer.closest("[hidden]")).toBeNull();
    }
  });

  it("opens nothing by default until defaultOpen names an item", () => {
    const { container, rerender } = render(<Accordion items={FAQ} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([false, false, false]);
    rerender(<Accordion items={FAQ} defaultOpen={["veg"]} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([true, false, false]);
  });

  it("reveals an answer when its question is clicked, and hides it on a second click", async () => {
    const user = userEvent.setup();
    const { container } = render(<Accordion items={FAQ} defaultOpen={[]} />);
    const delivery = detailsOf(container)[1];
    await user.click(screen.getByText("Do you deliver?"));
    expect(delivery?.open).toBe(true);
    await user.click(screen.getByText("Do you deliver?"));
    expect(delivery?.open).toBe(false);
  });

  it("merges a caller className over its own top rule", () => {
    const { container } = render(<Accordion items={FAQ} className="border-t-0" />);
    expect(container.firstElementChild).toHaveClass("border-t-0");
    expect(container.firstElementChild).not.toHaveClass("border-t");
  });

  it("opens the items it is told to, or none", () => {
    const { container, rerender } = render(<Accordion items={FAQ} defaultOpen={["booking"]} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([false, false, true]);
    rerender(<Accordion items={FAQ} defaultOpen={[]} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([false, false, false]);
  });

  it("groups single-open items under one shared name", () => {
    const { container } = render(<Accordion items={FAQ} />);
    const names = new Set(detailsOf(container).map((d) => d.getAttribute("name")));
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
  });

  it("uses the name it is given, so two accordions never share a group", () => {
    const { container } = render(<Accordion items={FAQ} name="faq-home" />);
    for (const details of detailsOf(container)) expect(details).toHaveAttribute("name", "faq-home");
  });

  it("leaves items independent when isMultiple", () => {
    const { container } = render(
      <Accordion items={FAQ} isMultiple defaultOpen={["veg", "delivery"]} />
    );
    for (const details of detailsOf(container)) expect(details).not.toHaveAttribute("name");
    expect(detailsOf(container).map((d) => d.open)).toEqual([true, true, false]);
  });

  it("keeps the questions plain summary text unless a headingLevel is given", () => {
    render(<Accordion items={FAQ} />);
    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });

  it("wraps each question in a heading at headingLevel, inside its summary", async () => {
    const { container } = render(<Accordion items={FAQ} headingLevel={3} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual(
      FAQ.map((item) => item.question)
    );
    for (const heading of headings) expect(heading.closest("summary")).not.toBeNull();
    await expectNoA11yViolations(container);
  });

  it("draws a decorative chevron that turns when its item opens", () => {
    const { container } = render(<Accordion items={FAQ} />);
    const chevron = container.querySelector("summary svg.lucide-chevron-down")?.parentElement;
    expect(chevron).toHaveAttribute("aria-hidden", "true");
    expect(chevron).toHaveClass("group-open/accordion-item:rotate-180");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Accordion items={FAQ} />);
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <Accordion
        items={[{ value: "a", question: "Q", answer: "A" }]}
        sx={{ mt: 4 }}
        className="italic"
      />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
