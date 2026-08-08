import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type AccordionItem } from "../../molecules/accordion/accordion";
import { FaqSection } from "./faq-section";

const ITEMS: AccordionItem[] = [
  {
    question: "Is everything vegetarian?",
    answer: "Yes — 100% vegetarian kitchen. A few bakes contain egg and are marked.",
  },
  { question: "Do you deliver?", answer: "Pickup and dine-in for now. Delivery starts in 2027." },
  { question: "Can I book a table?", answer: "Up to six guests online. Larger groups, call us." },
];

describe("FaqSection", () => {
  it("renders the section heading, lede and every question", () => {
    render(
      <FaqSection
        items={ITEMS}
        lede="Everything guests ask us at the counter."
        overline="Questions"
        title="The things people ask"
      />
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "The things people ask" })
    ).toBeInTheDocument();
    expect(screen.getByText("Questions")).toBeInTheDocument();
    expect(screen.getByText("Everything guests ask us at the counter.")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(ITEMS.length);
  });

  it("opens the first answer on arrival", () => {
    render(<FaqSection items={ITEMS} title="The things people ask" />);

    expect(screen.getByRole("button", { name: "Is everything vegetarian?" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("region", { name: "Is everything vegetarian?" })).toHaveTextContent(
      "100% vegetarian kitchen"
    );
  });

  it("opens the questions named in defaultOpen instead", () => {
    render(
      <FaqSection defaultOpen={["Do you deliver?"]} items={ITEMS} title="The things people ask" />
    );

    expect(screen.getByRole("button", { name: "Do you deliver?" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("button", { name: "Is everything vegetarian?" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("opens none when defaultOpen is empty", () => {
    render(<FaqSection defaultOpen={[]} items={ITEMS} title="The things people ask" />);

    for (const trigger of screen.getAllByRole("button")) {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("swaps the open answer when another question is clicked", async () => {
    render(<FaqSection items={ITEMS} title="The things people ask" />);

    await userEvent.click(screen.getByRole("button", { name: "Do you deliver?" }));

    expect(screen.getByRole("button", { name: "Is everything vegetarian?" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });

  it("keeps several answers open when isMultiple is set", async () => {
    render(<FaqSection isMultiple items={ITEMS} title="The things people ask" />);

    await userEvent.click(screen.getByRole("button", { name: "Do you deliver?" }));

    expect(screen.getAllByRole("region")).toHaveLength(2);
  });

  it("sits the questions exactly one level below the section heading", () => {
    const { rerender } = render(<FaqSection items={ITEMS} title="The things people ask" />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(ITEMS.length);

    rerender(<FaqSection headingLevel={3} items={ITEMS} title="The things people ask" />);
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(ITEMS.length);
  });

  it("stacks the two columns on an auto-fit grid that survives 360px", () => {
    const { container } = render(<FaqSection items={ITEMS} title="The things people ask" />);

    expect(container.firstElementChild?.firstElementChild).toHaveClass(
      "grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]"
    );
  });

  it("merges a caller className", () => {
    const { container } = render(
      <FaqSection className="py-0" items={ITEMS} title="The things people ask" />
    );

    expect(container.firstElementChild).toHaveClass("py-0");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <FaqSection
        items={ITEMS}
        lede="Everything guests ask us at the counter."
        overline="Questions"
        title="The things people ask"
      />
    );
    await expectNoA11yViolations(container);
  });
});
