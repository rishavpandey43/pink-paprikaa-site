import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, spyOn, waitFor } from "storybook/test";

import { Button, RevealObserver } from "@pink-paprikaa-web/ui";

import { CopyChips } from "../../docs-kit/copy";
import { requireElement } from "../../docs-kit/dom";
import { MotionDemo } from "../../docs-kit/motion-demo";
import { TokenTable } from "../../docs-kit/token-table";

/** Live visuals for the Motion pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Motion/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const REVEAL_SECTIONS = [1, 2, 3, 4, 5, 6];

/**
 * The design system's seven keyframes (packages/ui styles.css), by the utility that runs each.
 * Animations are stylesheet `@theme` entries, not tokens, so this list is the one place they are
 * named; the play fails a renamed utility or keyframe (fold list item 9).
 */
const ANIMATIONS = [
  ["animate-rotate", "Button isLoading"],
  ["animate-mark-pulse", "Spinner, loading fields"],
  ["animate-spin-pulse", "the diamond pulse"],
  ["animate-dot-pulse", "StatusDot isPulsing"],
  ["animate-skeleton", "Skeleton blocks"],
  ["animate-sheet-in", "sheets, dialogs, snackbars — once"],
  ["animate-toast-pop", "Toast isPop — once"],
] as const;

export const Durations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MotionDemo ease="out" duration="instant" use="press" />
      <MotionDemo ease="out" duration="fast" use="hovers" />
      <MotionDemo ease="out" duration="base" use="state changes" />
      <MotionDemo ease="out" duration="slow" use="sheets, page transitions, section reveal" />
    </div>
  ),
};

export const Easings: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MotionDemo ease="out" duration="fast" use="hovers and anything entering" />
      <MotionDemo ease="in-out" duration="base" use="moves and state changes" />
      <MotionDemo ease="entrance" duration="slow" use="sheets" />
      <MotionDemo ease="pop" duration="base" use="add-to-cart and rewards only" />
    </div>
  ),
};

export const Animations: Story = {
  render: () => (
    <ul aria-label="Animations" className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {ANIMATIONS.map(([utility, use]) => (
        <li key={utility} className="flex flex-col items-center gap-2 text-center">
          <span
            aria-hidden
            data-animation={utility}
            className={`size-10 rounded-md bg-pink-500 ${utility}`}
          />
          <CopyChips values={[utility]} />
          <span className="text-caption text-text-subtle">{use}</span>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    // A renamed utility or keyframe would leave its block still; fail instead.
    for (const [utility] of ANIMATIONS) {
      const block = requireElement(canvasElement, `[data-animation="${utility}"]`);
      await expect(getComputedStyle(block).animationName).toBe(utility.replace("animate-", "pp-"));
    }
    // R56: each animation's chip copies its utility.
    const write = spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    await userEvent.click(canvas.getByRole("button", { name: "animate-mark-pulse" }));
    await expect(write).toHaveBeenLastCalledWith("animate-mark-pulse");
    write.mockRestore();
  },
};

export const MotionTokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption="Durations" selection={{ prefix: "duration-" }} />
      <TokenTable caption="Easings" selection={{ prefix: "ease-" }} />
      <TokenTable caption="Press, lift and reveal" selection={{ prefix: "motion-" }} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Order Now</Button>
      <Button variant="secondary">See Full Menu</Button>
      <Button disabled>Order Now</Button>
    </div>
  ),
};

export const StateTokens: Story = {
  render: () => (
    <TokenTable
      caption="Hover, press and disabled"
      selection={{
        names: [
          "color-brand-hover",
          "color-brand-active",
          "motion-press-scale",
          "duration-instant",
          "duration-fast",
          "color-ink-200",
          "color-ink-400",
        ],
      }}
    />
  ),
};

// Deferred (fold list item 3): `FormStates` — every status on a real Field (Plan 3a T2); an Input
// without its Field has no label and fails axe.

function RevealDemo() {
  return (
    <div data-reveal-demo className="flex flex-col gap-4">
      <RevealObserver selector="[data-reveal-demo] > section" />
      {REVEAL_SECTIONS.map((index) => (
        <section
          key={index}
          aria-label={`Section ${String(index)}`}
          className="flex h-60 items-center justify-center rounded-lg bg-surface-page-alt"
        >
          <span className="font-display text-h3 text-text-heading">Section {index}</span>
        </section>
      ))}
    </div>
  );
}

export const SectionReveal: Story = {
  render: () => <RevealDemo />,
  play: async ({ canvasElement }) => {
    const first = requireElement(canvasElement, "[data-reveal-demo] > section:first-of-type");
    const last = requireElement(canvasElement, "[data-reveal-demo] > section:last-of-type");
    // Below the fold: hidden until it scrolls in. Above the fold: never touched (no LCP cost).
    await waitFor(() => expect(last).toHaveAttribute("data-pp-reveal"));
    await expect(first).not.toHaveAttribute("data-pp-reveal");
    last.scrollIntoView();
    await waitFor(() => expect(last).toHaveAttribute("data-pp-revealed"));
  },
};
