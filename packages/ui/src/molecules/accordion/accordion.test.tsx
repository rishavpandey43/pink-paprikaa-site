import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Accordion, type AccordionItem } from "./accordion";

const ITEMS: AccordionItem[] = [
  {
    question: "Is everything vegetarian?",
    answer: "Yes — 100% vegetarian kitchen. A few bakes contain egg and are marked.",
  },
  { question: "Do you deliver?", answer: "Pickup only for now. Delivery starts in 2027." },
  { question: "Can I book a table?", answer: "Up to six guests online. Larger groups, call us." },
];

describe("Accordion", () => {
  it("renders every question as a collapsed trigger", () => {
    render(<Accordion items={ITEMS} />);

    const triggers = screen.getAllByRole("button");
    expect(triggers).toHaveLength(3);
    for (const trigger of triggers) {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("reveals the answer when the question is clicked", async () => {
    render(<Accordion items={ITEMS} />);

    await userEvent.click(screen.getByRole("button", { name: "Do you deliver?" }));

    expect(screen.getByRole("region", { name: "Do you deliver?" })).toHaveTextContent(
      "Pickup only for now. Delivery starts in 2027."
    );
  });

  it("closes the open answer when its question is clicked again", async () => {
    render(<Accordion items={ITEMS} />);
    const trigger = screen.getByRole("button", { name: "Do you deliver?" });

    await userEvent.click(trigger);
    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps one answer open at a time by default", async () => {
    render(<Accordion items={ITEMS} />);

    await userEvent.click(screen.getByRole("button", { name: "Is everything vegetarian?" }));
    await userEvent.click(screen.getByRole("button", { name: "Do you deliver?" }));

    expect(screen.getByRole("button", { name: "Is everything vegetarian?" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByRole("button", { name: "Do you deliver?" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("keeps several answers open when multiple is set", async () => {
    render(<Accordion isMultiple items={ITEMS} />);

    await userEvent.click(screen.getByRole("button", { name: "Is everything vegetarian?" }));
    await userEvent.click(screen.getByRole("button", { name: "Do you deliver?" }));

    expect(screen.getAllByRole("region")).toHaveLength(2);
  });

  it("opens the questions named in defaultOpen", () => {
    render(<Accordion defaultOpen={[ITEMS[0]?.question ?? ""]} items={ITEMS} />);

    expect(screen.getByRole("button", { name: "Is everything vegetarian?" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("moves between questions with the arrow keys", async () => {
    render(<Accordion items={ITEMS} />);

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");

    expect(screen.getByRole("button", { name: "Do you deliver?" })).toHaveFocus();
  });

  it("does not open a disabled question", async () => {
    render(
      <Accordion
        items={[{ question: "Is franchising open?", answer: "Not yet.", isDisabled: true }]}
      />
    );

    const trigger = screen.getByRole("button", { name: "Is franchising open?" });
    await userEvent.click(trigger);

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders the questions at the requested heading level", () => {
    render(<Accordion headingLevel={2} items={ITEMS} />);

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  });

  it("turns the open question brand pink and rotates its chevron", () => {
    render(<Accordion items={ITEMS} />);

    const trigger = screen.getByRole("button", { name: "Do you deliver?" });
    expect(trigger).toHaveClass("data-[state=open]:text-text-brand");
    expect(trigger.querySelector("svg")).toHaveClass("group-data-[state=open]:rotate-180");
  });

  it("merges a caller className", () => {
    const { container } = render(<Accordion className="border-t-0" items={ITEMS} />);

    expect(container.firstElementChild).toHaveClass("border-t-0");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Accordion defaultOpen={[ITEMS[0]?.question ?? ""]} items={ITEMS} />
    );
    await expectNoA11yViolations(container);
  });
});
