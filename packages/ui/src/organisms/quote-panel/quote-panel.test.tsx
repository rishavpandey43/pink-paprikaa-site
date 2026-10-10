import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { QuotePanel } from "./quote-panel";

/** Handoff PlanCalculator: Classic, Weekday plan, lunch, one person, launch price on. */
const PLAN = {
  title: "Classic · Weekday plan",
  badge: <span>Launch price</span>,
  amount: "₹130",
  unit: "a meal",
  was: "₹140",
  lines: [
    { key: "₹130 × 24 meals", value: "₹3,120" },
    { key: "Offer: free meals (1)", value: "₹0" },
    { key: "GST 5%", value: "₹156" },
    { key: "Meals delivered", value: "25" },
  ],
  total: { label: "Total", value: "₹3,276" },
  note: "Delivery free within 3 km · no packaging or platform fee",
};

describe("QuotePanel", () => {
  it("is a region named by its title, a level-3 heading by default", () => {
    render(<QuotePanel {...PLAN} />);
    expect(screen.getByRole("region", { name: PLAN.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: PLAN.title })).toBeInTheDocument();
  });

  it("shows the amount and unit, and announces the struck price as the old one", () => {
    const { container } = render(<QuotePanel {...PLAN} />);
    expect(screen.getByText("₹130")).toBeInTheDocument();
    expect(screen.getByText("a meal")).toBeInTheDocument();
    expect(container.querySelector("s")).toHaveTextContent("was ₹140");
  });

  it("lists every line as a term and its value, then the total", () => {
    render(<QuotePanel {...PLAN} />);
    const gst = screen.getByText("GST 5%");
    expect(gst.tagName).toBe("DT");
    expect(gst.nextElementSibling).toHaveTextContent("₹156");
    const total = screen.getByText("Total");
    expect(total.tagName).toBe("DT");
    expect(total.nextElementSibling).toHaveTextContent("₹3,276");
  });

  it("picks an emphasised line out in the brand colour, as KeyValueList does", () => {
    render(
      <QuotePanel
        surface="ink"
        title="Your Dawat estimate"
        amount="₹6,269"
        lines={[{ key: "50% to hold the date", value: "₹3,135", isEmphasised: true }]}
      />
    );
    expect(screen.getByText("₹3,135")).toHaveClass("text-text-brand");
  });

  it.each([
    ["brand", "brand", "bg-surface-brand"],
    ["ink", "ink", "bg-surface-inverse"],
    ["page", "light", "bg-surface-card"],
  ] as const)("surface %s sets data-surface %s and its field", (surface, data, background) => {
    render(<QuotePanel {...PLAN} surface={surface} />);
    expect(screen.getByRole("region")).toHaveAttribute("data-surface", data);
    expect(screen.getByRole("region")).toHaveClass(background);
  });

  it("floods only the brand surface with the diamond", () => {
    const { container, rerender } = render(<QuotePanel {...PLAN} surface="brand" />);
    const layer = () => container.querySelector('section > [aria-hidden="true"]');
    expect(layer()).toBeInTheDocument();
    rerender(<QuotePanel {...PLAN} surface="ink" />);
    expect(layer()).not.toBeInTheDocument();
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(<QuotePanel {...PLAN} className="bg-surface-page-alt" />);
    const layer = container.querySelector('section > [aria-hidden="true"]');
    expect(screen.getByRole("region")).toHaveClass("bg-surface-page-alt");
    expect(screen.getByRole("region")).not.toHaveClass("bg-surface-brand");
    expect(layer).toHaveClass("bg-transparent");
    expect(layer).not.toHaveClass("bg-surface-brand");
  });

  it("renders the note, alerts, action and footnote in that order", () => {
    const { container } = render(
      <QuotePanel
        {...PLAN}
        alerts={<p>You save ₹2,880</p>}
        action={<a href="#send">Send this plan on WhatsApp</a>}
        footnote="We confirm within the hour."
      />
    );
    const text = container.textContent;
    const positions = [
      "Delivery free",
      "You save ₹2,880",
      "Send this plan",
      "We confirm within the hour.",
    ].map((fragment) => text.indexOf(fragment));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("renders no wrapper for an empty unit, was, note, alerts, action or footnote", () => {
    const { container } = render(
      <QuotePanel
        surface="ink"
        title="Estimate"
        amount="₹99,792"
        unit=""
        was=""
        note=""
        alerts=""
        action=""
        footnote=""
      />
    );
    const body = container.querySelector("section > div");
    expect(body?.children).toHaveLength(2);
    expect(screen.getByText("₹99,792").parentElement?.children).toHaveLength(1);
  });

  it("renders the wrapper for a 0 unit, was, note, alerts, action or footnote — a number is content", () => {
    const { container } = render(
      <QuotePanel
        surface="ink"
        title="Estimate"
        amount="₹99,792"
        unit={0}
        was={0}
        note={0}
        alerts={0}
        action={0}
        footnote={0}
      />
    );
    const body = container.querySelector("section > div");
    expect(body?.children).toHaveLength(6);
    expect(screen.getByText("₹99,792").parentElement?.children).toHaveLength(3);
  });

  it("renders no summary list without lines or a total", () => {
    const { container } = render(<QuotePanel title="Estimate" amount="₹99,792" />);
    expect(container.querySelector("dl")).not.toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<QuotePanel {...PLAN} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: PLAN.title })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <QuotePanel {...PLAN} action={<a href="#send">Send this plan on WhatsApp</a>} />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(<QuotePanel {...PLAN} sx={{ mt: 4 }} className="italic" />);
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
