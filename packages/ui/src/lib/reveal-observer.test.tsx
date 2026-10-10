import { render } from "@testing-library/react";
import { StrictMode } from "react";

import { RevealObserver } from "./reveal-observer";

type Callback = (entries: Pick<IntersectionObserverEntry, "isIntersecting" | "target">[]) => void;

/** One per `new IntersectionObserver`, so a remount's fresh observer is told apart from the old. */
class ControlledObserver {
  static instances: ControlledObserver[] = [];
  readonly observed = new Set<Element>();

  constructor(
    readonly callback: Callback,
    readonly options?: IntersectionObserverInit
  ) {
    ControlledObserver.instances.push(this);
  }
  observe(el: Element): void {
    this.observed.add(el);
  }
  unobserve(el: Element): void {
    this.observed.delete(el);
  }
  disconnect(): void {
    this.observed.clear();
  }
}

/** The observer the mounted RevealObserver is using now. */
function current(): ControlledObserver {
  const observer = ControlledObserver.instances.at(-1);
  if (!observer) throw new Error("no IntersectionObserver was constructed");
  return observer;
}

function place(el: HTMLElement, top: number): HTMLElement {
  el.getBoundingClientRect = () => ({ top }) as DOMRect;
  document.body.append(el);
  return el;
}

function section(top: number): HTMLElement {
  return place(document.createElement("section"), top);
}

const BELOW_THE_FOLD = window.innerHeight + 200;

/** MutationObserver callbacks are microtasks; let them run. */
async function flushMutations(): Promise<void> {
  await Promise.resolve();
}

beforeEach(() => {
  document.body.innerHTML = "";
  ControlledObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", ControlledObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RevealObserver", () => {
  it("never hides a section that starts above the fold", () => {
    const above = section(0);
    render(<RevealObserver />);
    expect(above).not.toHaveAttribute("data-pp-reveal");
  });

  it("hides a section below the fold until it scrolls into view, then reveals it once", () => {
    const below = section(BELOW_THE_FOLD);
    render(<RevealObserver />);
    expect(below).toHaveAttribute("data-pp-reveal");
    current().callback([{ isIntersecting: true, target: below }]);
    expect(below).toHaveAttribute("data-pp-revealed");
    expect(current().observed.has(below)).toBe(false);
  });

  it("leaves a section hidden and observed while it is still out of view", () => {
    const below = section(BELOW_THE_FOLD);
    render(<RevealObserver />);
    current().callback([{ isIntersecting: false, target: below }]);
    expect(below).not.toHaveAttribute("data-pp-revealed");
    expect(current().observed.has(below)).toBe(true);
  });

  it("reveals 8% into the viewport", () => {
    section(BELOW_THE_FOLD);
    render(<RevealObserver />);
    expect(current().options).toEqual({ rootMargin: "0px 0px -8% 0px" });
  });

  it("does nothing at all where IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const below = section(BELOW_THE_FOLD);
    render(<RevealObserver />);
    expect(below).not.toHaveAttribute("data-pp-reveal");
  });

  it("stops observing when unmounted", () => {
    section(BELOW_THE_FOLD);
    const { unmount } = render(<RevealObserver />);
    unmount();
    expect(current().observed.size).toBe(0);
  });

  it("tags a section added after mount", async () => {
    render(<RevealObserver />);
    const late = section(BELOW_THE_FOLD);
    await flushMutations();
    expect(late).toHaveAttribute("data-pp-reveal");
    expect(current().observed.has(late)).toBe(true);
  });

  it("still observes below-the-fold sections under StrictMode's mount, unmount, mount", () => {
    const below = section(BELOW_THE_FOLD);
    render(
      <StrictMode>
        <RevealObserver />
      </StrictMode>
    );
    expect(ControlledObserver.instances.length).toBeGreaterThan(1);
    expect(current().observed.has(below)).toBe(true);
  });

  it("can still reveal a section after an unmount and a remount", () => {
    const below = section(BELOW_THE_FOLD);
    render(<RevealObserver />).unmount();
    render(<RevealObserver />);
    expect(current().observed.has(below)).toBe(true);
    current().callback([{ isIntersecting: true, target: below }]);
    expect(below).toHaveAttribute("data-pp-revealed");
  });

  it("treats a selector list as one selector, tagging each match once", async () => {
    const below = section(BELOW_THE_FOLD);
    const card = place(document.createElement("div"), BELOW_THE_FOLD);
    card.className = "reveal";
    render(<RevealObserver selector="section, .reveal" />);
    expect(current().observed).toEqual(new Set([below, card]));

    current().callback([
      { isIntersecting: true, target: below },
      { isIntersecting: true, target: card },
    ]);
    document.body.append(document.createElement("p"));
    await flushMutations();
    expect(current().observed.size).toBe(0);
  });
});
