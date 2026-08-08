import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Button } from "../../atoms/button/button";
import { Dialog } from "./dialog";

const TITLE = "Remove this item?";
const BODY = "Chilli Paneer will come off your order.";

describe("Dialog", () => {
  it("stays closed until the trigger is used", async () => {
    render(
      <Dialog title={TITLE} trigger={<Button>Remove</Button>}>
        {BODY}
      </Dialog>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
  });

  it("takes its accessible name from the title", () => {
    render(
      <Dialog isDefaultOpen title={TITLE}>
        {BODY}
      </Dialog>
    );
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
  });

  it("wires a description to the dialog", () => {
    render(
      <Dialog description={BODY} isDefaultOpen title={TITLE}>
        <p>Body</p>
      </Dialog>
    );
    expect(screen.getByRole("dialog", { description: BODY })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog isDefaultOpen onOpenChange={handleOpenChange} title={TITLE}>
        {BODY}
      </Dialog>
    );

    await userEvent.keyboard("{Escape}");

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes from the close glyph", async () => {
    render(
      <Dialog isDefaultOpen title={TITLE}>
        {BODY}
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("drops the close glyph when the decision must be answered", () => {
    render(
      <Dialog hasCloseButton={false} isDefaultOpen title={TITLE}>
        {BODY}
      </Dialog>
    );
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("moves focus into the dialog when it opens", async () => {
    render(
      <Dialog isDefaultOpen title={TITLE}>
        {BODY}
      </Dialog>
    );

    await userEvent.tab();

    expect(screen.getByRole("dialog")).toContainElement(
      document.activeElement as HTMLElement | null
    );
  });

  it("renders its footer actions", async () => {
    const handleConfirm = vi.fn();
    render(
      <Dialog
        footer={
          <>
            <Button variant="ghost">Keep It</Button>
            <Button onClick={handleConfirm}>Remove</Button>
          </>
        }
        isDefaultOpen
        title={TITLE}
      >
        {BODY}
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(handleConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Keep It" })).toBeInTheDocument();
  });

  it("respects a controlled open state", async () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog isOpen onOpenChange={handleOpenChange} title={TITLE}>
        {BODY}
      </Dialog>
    );

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("rounds only the top corners as a sheet, and adds a grab handle", () => {
    render(
      <Dialog isDefaultOpen title={TITLE} variant="sheet">
        {BODY}
      </Dialog>
    );

    const node = screen.getByRole("dialog");
    expect(node).toHaveClass("rounded-t-5");
    expect(node).not.toHaveClass("rounded-5");
    expect(node.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it.each([
    ["sm", "max-w-82"],
    ["md", "max-w-115"],
    ["lg", "max-w-160"],
  ] as const)("renders the %s width", (size, expected) => {
    render(
      <Dialog isDefaultOpen size={size} title={TITLE}>
        {BODY}
      </Dialog>
    );
    expect(screen.getByRole("dialog")).toHaveClass(expected);
  });

  it("anchors to a positioned ancestor rather than the viewport when asked", () => {
    render(
      <Dialog isDefaultOpen position="container" title={TITLE}>
        {BODY}
      </Dialog>
    );

    const node = screen.getByRole("dialog");
    expect(node).toHaveClass("absolute");
    expect(node).not.toHaveClass("fixed");
  });

  it("lays a scrim over everything behind it", () => {
    render(
      <Dialog isDefaultOpen title={TITLE}>
        {BODY}
      </Dialog>
    );
    expect(document.querySelector(".bg-surface-overlay")).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    render(
      <Dialog className="rounded-1" isDefaultOpen title={TITLE}>
        {BODY}
      </Dialog>
    );

    const node = screen.getByRole("dialog");
    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-5");
  });

  it("has no accessibility violations", async () => {
    render(
      <Dialog
        description="It will come off your order."
        footer={
          <>
            <Button variant="ghost">Keep It</Button>
            <Button>Remove</Button>
          </>
        }
        isDefaultOpen
        title={TITLE}
      >
        <p>{BODY}</p>
      </Dialog>
    );

    await expectNoA11yViolations(document.body);
  });
});
