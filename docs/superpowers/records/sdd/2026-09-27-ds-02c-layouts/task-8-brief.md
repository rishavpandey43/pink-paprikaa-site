### Task 8: PostFrame and `POST_FORMATS`

**Files:**

- Create: `packages/design-tokens/tokens/component/post-frame.json`
- Create: `packages/ui/src/layouts/post-frame/{post-formats.ts,post-formats.spec.ts,post-frame.tsx,post-frame-scaler.tsx,post-frame.test.tsx,post-frame.stories.tsx}`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/templates/post-frame/post-frame.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                         | Ruling  | Where / clause                                                                    |
| ------------------------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------- |
| Seven canvases pinned to the `--canvas-*` tokens                                                 | ALREADY | `POST_FORMATS` + `post-formats.spec.ts` (token equality)                          |
| `variant` (default `post`)                                                                       | ALREADY | `format`, required (contracts §4)                                                 |
| `scale` (default 1) through a `--pp-canvas-scale` custom property and arbitrary `calc()` classes | ALREADY | Computed inline geometry (tier rule: the only inline styles); the scaled-box test |
| Reserved box = canvas × scale; `shrink-0 overflow-hidden`                                        | ALREADY | Step 2 first and third tests                                                      |
| `padding` default/tight/none; 20px (`p-5`) on mpu and leaderboard                                | ALREADY | Step 2 padding tests (+ 48px default on landscape, resolution 5)                  |
| Story guides only on `story`, only with `hasSafeArea`                                            | ALREADY | Step 2 guide tests (now `aria-hidden`)                                            |
| Background through `className`                                                                   | ALREADY | `tone` (spec §9.4), sets `data-surface`                                           |
| Test: children render inside the true-pixel canvas                                               | ADD     | Step 2                                                                            |
| Test: caller className merges onto the frame; caller `style` is kept                             | ADD     | Step 2                                                                            |
| Test: axe on a scaled story with guides                                                          | ALREADY | Step 2                                                                            |
| Story `Default`                                                                                  | ALREADY | `Playground`                                                                      |
| Story `Canvases` (seven boards with copy)                                                        | ALREADY | Per-format stories + `AllFormats`                                                 |
| `Canvases`' `wide` board with copy (no per-format story had it)                                  | ADD     | Step 6 `Wide`                                                                     |
| Story `StorySafeArea` (guides off vs on)                                                         | ADD     | Step 6 `SafeAreaGuides`                                                           |
| Story `Padding` (default · tight · none)                                                         | ADD     | Step 6 `Padding`                                                                  |
| Arbitrary `text-[22px]`, `max-w-[13ch]` in board copy                                            | DROP    | Token-only class rule (AUTHORING §6); boards use SocialHeadline / Text steps      |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `--canvas-*` sizes, `--canvas-pad(-tight)`, `--canvas-story-safe-{top,bottom}` and the surfaces (Plan 1); `Stack` (Task 3); in stories, `PatternField`, `SocialHeadline`, `Text`, `Button` and `Logo`.
- Produces:
  - `PostFrame`, `type PostFrameProps`;
  - `POST_FORMATS: Readonly<Record<PostFormat, { width: number; height: number; label: string }>>` and `type PostFormat` (public);
  - `scaledSize` (internal);
  - `PostFrameScaler` (internal client leaf);
  - component tokens `--spacing-{canvas-pad,canvas-pad-tight,story-safe-top,story-safe-bottom}`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/post-frame.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "canvas-pad": {
      "$value": "{canvas.pad}",
      "$description": "PostFrame padding on 1080-wide canvases and the 1920 screen: the 72px safe margin."
    },
    "canvas-pad-tight": {
      "$value": "{canvas.pad-tight}",
      "$description": "PostFrame padding on 1200x628 (48px), and padding=\"tight\" everywhere."
    },
    "story-safe-top": {
      "$value": "{canvas.story-safe-top}",
      "$description": "Story chrome guide: platform UI covers the top 250px."
    },
    "story-safe-bottom": {
      "$value": "{canvas.story-safe-bottom}",
      "$description": "Story chrome guide: platform UI covers the bottom 320px."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, add to `SPACING`:

```ts
  "canvas-pad",
  "canvas-pad-tight",
  "story-safe-top",
  "story-safe-bottom",
```

- [ ] **Step 2: Write the failing specs**

`packages/ui/src/layouts/post-frame/post-formats.spec.ts`:

```ts
import { readFileSync } from "node:fs";

import { POST_FORMATS, scaledSize } from "./post-formats";

interface CatalogueEntry {
  name: string;
  value: unknown;
  surface: string | null;
}

const catalogue = JSON.parse(
  readFileSync(new URL("../../../../design-tokens/dist/tokens.json", import.meta.url), "utf8")
) as CatalogueEntry[];
const tokenValue = (name: string) =>
  catalogue.find((entry) => entry.surface === null && entry.name === name)?.value;

describe("POST_FORMATS", () => {
  it("lists exactly the canvases the tokens define — the only seven", () => {
    const tokenFormats = catalogue
      .filter((entry) => entry.surface === null && /^canvas-[a-z]+-w$/.test(entry.name))
      .map((entry) => entry.name.slice("canvas-".length, -"-w".length));
    expect(Object.keys(POST_FORMATS).sort()).toEqual(tokenFormats.sort());
    expect(tokenFormats).toHaveLength(7);
  });

  it.each(Object.entries(POST_FORMATS))(
    "%s matches its --canvas-* tokens, so the two cannot drift",
    (format, { width, height }) => {
      expect(tokenValue(`canvas-${format}-w`)).toBe(`${String(width)}px`);
      expect(tokenValue(`canvas-${format}-h`)).toBe(`${String(height)}px`);
    }
  );
});

describe("scaledSize", () => {
  it("is the canvas at the display scale", () => {
    expect(scaledSize("story", 0.25)).toEqual({ width: 270, height: 480 });
    expect(scaledSize("leaderboard", 1)).toEqual({ width: 728, height: 90 });
  });

  it.each([0, -0.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects scale=%s instead of drawing an empty or mirrored board",
    (scale) => {
      expect(() => scaledSize("post", scale)).toThrow(RangeError);
    }
  );
});
```

`packages/ui/src/layouts/post-frame/post-frame.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PostFrame } from "./post-frame";

function frameOf(container: HTMLElement): HTMLElement {
  const frame = container.firstElementChild;
  if (!(frame instanceof HTMLElement)) throw new Error("PostFrame rendered nothing");
  return frame;
}

/** The true-pixel canvas is the element that carries the board's surface. */
function canvasOf(container: HTMLElement): HTMLElement {
  const canvas = container.querySelector<HTMLElement>("[data-surface]");
  if (canvas === null) throw new Error("PostFrame rendered no canvas");
  return canvas;
}

describe("PostFrame", () => {
  it("reserves the scaled box and scales the true-pixel canvas into it", () => {
    const { container } = render(
      <PostFrame format="post" scale={0.25}>
        Board
      </PostFrame>
    );
    const canvas = canvasOf(container);
    expect(frameOf(container)).toHaveStyle({ width: "270px", height: "270px" });
    expect(canvas).toHaveStyle({ width: "1080px", height: "1080px" });
    expect(canvas.parentElement).toHaveStyle({ transform: "scale(0.25)" });
    expect(canvas.parentElement).toHaveClass("origin-top-left");
  });

  it("shows the canvas at true size when no scale is given", () => {
    const { container } = render(<PostFrame format="portrait">Board</PostFrame>);
    expect(frameOf(container)).toHaveStyle({ width: "1080px", height: "1350px" });
  });

  // Review Focus 5, pure half — the rendered half is the FitsItsParentAt360 story.
  it("clips the canvas to the reserved box and never shrinks it", () => {
    const { container } = render(
      <PostFrame format="post" scale={0.25}>
        Board
      </PostFrame>
    );
    expect(frameOf(container)).toHaveClass("relative", "shrink-0", "overflow-hidden");
  });

  it.each([
    ["brand", "bg-surface-brand", "brand"],
    ["ink", "bg-surface-inverse", "ink"],
    ["soft", "bg-surface-brand-soft", "soft"],
    ["light", "bg-surface-page", "light"],
    ["alt", "bg-surface-page-alt", "light"],
  ] as const)(
    "tone=%s paints the board %s and sets data-surface=%s",
    (tone, background, surface) => {
      const { container } = render(<PostFrame format="post" tone={tone} />);
      const canvas = canvasOf(container);
      expect(canvas).toHaveAttribute("data-surface", surface);
      expect(canvas).toHaveClass(background);
    }
  );

  it("is a light board by default", () => {
    const { container } = render(<PostFrame format="post" />);
    expect(canvasOf(container)).toHaveAttribute("data-surface", "light");
  });

  it.each([
    ["post", "p-canvas-pad"],
    ["portrait", "p-canvas-pad"],
    ["story", "p-canvas-pad"],
    ["wide", "p-canvas-pad"],
    ["landscape", "p-canvas-pad-tight"],
    ["mpu", "p-5"],
    ["leaderboard", "p-5"],
  ] as const)("pads %s with its safe margin (%s) by default", (format, pad) => {
    const { container } = render(<PostFrame format={format} />);
    expect(canvasOf(container)).toHaveClass(pad);
  });

  it.each([
    ["tight", "p-canvas-pad-tight"],
    ["none", "p-0"],
  ] as const)("padding=%s sets %s on any format", (padding, pad) => {
    const { container } = render(<PostFrame format="post" padding={padding} />);
    expect(canvasOf(container)).toHaveClass(pad);
  });

  it("draws the story chrome guides, hidden from assistive tech", () => {
    const { container } = render(<PostFrame format="story" hasSafeArea tone="brand" />);
    const guides = [...canvasOf(container).querySelectorAll("[aria-hidden='true']")];
    expect(guides).toHaveLength(2);
    expect(guides[0]).toHaveClass("top-0", "h-story-safe-top");
    expect(guides[1]).toHaveClass("bottom-0", "h-story-safe-bottom");
  });

  it("draws no guides outside the story format", () => {
    const { container } = render(<PostFrame format="post" hasSafeArea />);
    expect(canvasOf(container).querySelectorAll("[aria-hidden='true']")).toHaveLength(0);
  });

  it("renders its children inside the true-pixel canvas", () => {
    const { container } = render(
      <PostFrame format="landscape" scale={0.3}>
        <p>One kitchen. One grinder.</p>
      </PostFrame>
    );
    expect(canvasOf(container)).toContainElement(screen.getByText("One kitchen. One grinder."));
  });

  it("merges a consumer className onto the frame and keeps its style, but not over the box", () => {
    const { container } = render(
      <PostFrame format="post" scale={0.25} className="shrink" style={{ marginTop: 8 }} />
    );
    const frame = frameOf(container);
    expect(frame).toHaveClass("shrink");
    expect(frame).not.toHaveClass("shrink-0");
    expect(frame).toHaveStyle({ marginTop: "8px", width: "270px" });
  });

  describe("isFit", () => {
    let frameWidth = 0;
    let report: () => void = () => undefined;

    beforeEach(() => {
      vi.spyOn(Element.prototype, "clientWidth", "get").mockImplementation(() => frameWidth);
      vi.stubGlobal(
        "ResizeObserver",
        class {
          constructor(callback: () => void) {
            report = callback;
          }
          // The real observer reports the initial size as soon as it starts observing.
          observe = vi.fn(() => {
            report();
          });
          unobserve = vi.fn();
          disconnect = vi.fn();
        }
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("fills the parent's width in a box of the canvas's aspect ratio, capped at true size", () => {
      frameWidth = 540;
      const { container } = render(
        <PostFrame format="portrait" isFit>
          Board
        </PostFrame>
      );
      const frame = frameOf(container);
      expect(frame).toHaveClass("w-full");
      expect(frame).toHaveStyle({ maxWidth: "1080px", aspectRatio: "1080 / 1350" });
    });

    it("scales the canvas to the frame's width and re-fits when the frame resizes", () => {
      frameWidth = 540;
      const { container } = render(
        <PostFrame format="post" isFit>
          Board
        </PostFrame>
      );
      const scaler = canvasOf(container).parentElement;
      expect(scaler).toHaveStyle({ transform: "scale(0.5)" });
      expect(scaler).not.toHaveClass("invisible");
      frameWidth = 270;
      act(() => {
        report();
      });
      expect(scaler).toHaveStyle({ transform: "scale(0.25)" });
    });

    it("never scales a canvas above its true size", () => {
      frameWidth = 2000;
      const { container } = render(<PostFrame format="post" isFit />);
      expect(canvasOf(container).parentElement).toHaveStyle({ transform: "scale(1)" });
    });

    it("stays invisible until it has measured", () => {
      vi.stubGlobal(
        "ResizeObserver",
        class {
          observe = vi.fn();
          unobserve = vi.fn();
          disconnect = vi.fn();
        }
      );
      const { container } = render(<PostFrame format="post" isFit />);
      expect(canvasOf(container).parentElement).toHaveClass("invisible");
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PostFrame format="story" scale={0.25} tone="brand" hasSafeArea>
        <h2>Half off, on us.</h2>
      </PostFrame>
    );
    await expectNoA11yViolations(container);
    expect(screen.getByRole("heading", { name: "Half off, on us." })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./post-formats"` / `"./post-frame"`.

- [ ] **Step 4: Implement**

`packages/ui/src/layouts/post-frame/post-formats.ts`:

```ts
/** The seven marketing canvases (readme §4b) — the only sizes an asset may be designed at. */
export type PostFormat =
  "post" | "portrait" | "story" | "landscape" | "wide" | "mpu" | "leaderboard";

/**
 * Canvas sizes in px, mirrored from the `--canvas-*` tokens. `post-formats.spec.ts` asserts they
 * equal the token build, so the two cannot drift. PostFrame needs them as numbers to size its
 * scaled box; the package ships no token payload at runtime.
 */
export const POST_FORMATS: Readonly<
  Record<PostFormat, { width: number; height: number; label: string }>
> = {
  post: { width: 1080, height: 1080, label: "Feed 1:1" },
  portrait: { width: 1080, height: 1350, label: "Feed 4:5" },
  story: { width: 1080, height: 1920, label: "Story 9:16" },
  landscape: { width: 1200, height: 628, label: "Link / OG" },
  wide: { width: 1920, height: 1080, label: "Screen 16:9" },
  mpu: { width: 300, height: 250, label: "MPU" },
  leaderboard: { width: 728, height: 90, label: "Leaderboard" },
};

/**
 * The on-screen box for a canvas shown at `scale`. A zero, negative or non-finite scale throws: an
 * empty or mirrored board is a bug, not a layout.
 */
export function scaledSize(format: PostFormat, scale: number): { width: number; height: number } {
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new RangeError(
      `PostFrame: scale must be a positive, finite number, got ${String(scale)}`
    );
  }
  const { width, height } = POST_FORMATS[format];
  return { width: width * scale, height: height * scale };
}
```

`packages/ui/src/layouts/post-frame/post-frame-scaler.tsx`:

```tsx
"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { componentVariants } from "../../lib/component-variants";

const scaler = componentVariants({
  variants: { isMeasured: { false: "invisible" } },
});

export interface PostFrameScalerProps {
  /** The canvas's true width in px (POST_FORMATS). */
  width: number;
  className?: string;
  children: ReactNode;
}

/**
 * PostFrame's `isFit` leaf — the only client code in the layouts tier. Scales the canvas to the
 * frame's width, never above 1, and re-fits whenever the frame resizes. Invisible until the first
 * measurement, so server HTML never flashes an unscaled canvas; the frame's own box already has
 * the right size and aspect ratio, so nothing shifts when it appears.
 */
export function PostFrameScaler({ width, className, children }: PostFrameScalerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const box = ref.current;
    if (box === null) return undefined;
    // ResizeObserver reports the initial size too, so this is also the first measurement.
    const observer = new ResizeObserver(() => {
      setScale(Math.min(1, box.clientWidth / width));
    });
    observer.observe(box);
    return () => {
      observer.disconnect();
    };
  }, [width]);

  return (
    <div
      ref={ref}
      className={scaler({ isMeasured: scale !== null, className })}
      style={scale === null ? undefined : { transform: `scale(${String(scale)})` }}
    >
      {children}
    </div>
  );
}
```

`packages/ui/src/layouts/post-frame/post-frame.tsx`:

```tsx
import type { ComponentProps, CSSProperties } from "react";

import { componentVariants } from "../../lib/component-variants";
import { POST_FORMATS, type PostFormat, scaledSize } from "./post-formats";
import { PostFrameScaler } from "./post-frame-scaler";

const postFrame = componentVariants({
  slots: {
    // shrink-0 + overflow-hidden: the frame occupies exactly the scaled box and clips the canvas's
    // untransformed 1080px layout box, so nothing leaks into the parent's layout.
    base: "relative shrink-0 overflow-hidden",
    scaler: "origin-top-left",
    canvas: "relative flex flex-col overflow-hidden",
    safeTop:
      "h-story-safe-top pointer-events-none absolute inset-x-0 top-0 outline-2 -outline-offset-2 outline-border-default outline-dashed",
    safeBottom:
      "h-story-safe-bottom pointer-events-none absolute inset-x-0 bottom-0 outline-2 -outline-offset-2 outline-border-default outline-dashed",
  },
  variants: {
    isFit: { true: { base: "w-full" } },
    tone: {
      brand: { canvas: "bg-surface-brand" },
      ink: { canvas: "bg-surface-inverse" },
      soft: { canvas: "bg-surface-brand-soft" },
      light: { canvas: "bg-surface-page" },
      alt: { canvas: "bg-surface-page-alt" },
    },
    padding: { none: { canvas: "p-0" }, default: {}, tight: { canvas: "p-canvas-pad-tight" } },
    format: {
      post: {},
      portrait: {},
      story: {},
      landscape: {},
      wide: {},
      mpu: {},
      leaderboard: {},
    },
  },
  compoundVariants: [
    // Readme §4b safe margins: 72px on 1080 canvases (and the 1920 screen), 48px on 1200×628;
    // display ads take PostFrame.jsx's 20px.
    {
      padding: "default",
      format: ["post", "portrait", "story", "wide"],
      class: { canvas: "p-canvas-pad" },
    },
    { padding: "default", format: "landscape", class: { canvas: "p-canvas-pad-tight" } },
    { padding: "default", format: ["mpu", "leaderboard"], class: { canvas: "p-5" } },
  ],
});

type PostFrameTone = "brand" | "ink" | "soft" | "light" | "alt";

/** The surface each board tone establishes: `alt` (pink-50) is a light field, like `light`. */
const SURFACE = {
  brand: "brand",
  ink: "ink",
  soft: "soft",
  light: "light",
  alt: "light",
} as const satisfies Record<PostFrameTone, "brand" | "ink" | "soft" | "light">;

interface PostFrameBaseProps extends ComponentProps<"div"> {
  /** post 1080² · portrait 1080×1350 · story 1080×1920 · landscape 1200×628 · wide 1920×1080 · mpu 300×250 · leaderboard 728×90. */
  format: PostFormat;
  /** The board's field: brand · ink · soft (pink-100) · light (white) · alt (pink-50). Sets data-surface. */
  tone?: PostFrameTone;
  /** Canvas padding: `default` is the format's safe margin, `tight` 48px, `none` 0. */
  padding?: "none" | "default" | "tight";
  /** Draw the story chrome guides (story format only): keep the top 250px and bottom 320px clear. */
  hasSafeArea?: boolean;
}

/** Either a fixed display `scale` (e.g. 0.32), or `isFit` to scale to the parent's width — never both. */
export type PostFrameProps = PostFrameBaseProps &
  ({ scale?: number; isFit?: false } | { isFit: true; scale?: never });

/**
 * A fixed-pixel marketing artboard (post, story, banner) that scales for preview. Children are
 * authored at true canvas pixels — the canvas type scale, never screen sizes.
 */
export function PostFrame({
  format,
  scale = 1,
  isFit = false,
  tone = "light",
  padding = "default",
  hasSafeArea = false,
  className,
  style,
  children,
  ...props
}: PostFrameProps) {
  const { width, height } = POST_FORMATS[format];
  const slots = postFrame({ format, tone, padding, isFit });
  // A fit frame is fluid (full width, canvas aspect ratio, never wider than the canvas); a scaled
  // frame is exactly the canvas times the scale. Both are computed numbers, so they are inline.
  const frameSize: CSSProperties = isFit
    ? { maxWidth: width, aspectRatio: `${String(width)} / ${String(height)}` }
    : scaledSize(format, scale);

  const canvas = (
    <div data-surface={SURFACE[tone]} className={slots.canvas()} style={{ width, height }}>
      {hasSafeArea && format === "story" ? (
        <>
          <div aria-hidden className={slots.safeTop()} />
          <div aria-hidden className={slots.safeBottom()} />
        </>
      ) : null}
      {children}
    </div>
  );

  return (
    <div className={slots.base({ className })} style={{ ...style, ...frameSize }} {...props}>
      {isFit ? (
        <PostFrameScaler width={width} className={slots.scaler()}>
          {canvas}
        </PostFrameScaler>
      ) : (
        <div className={slots.scaler()} style={{ transform: `scale(${String(scale)})` }}>
          {canvas}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run them to verify they pass**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS (`post-formats.spec.ts` and `post-frame.test.tsx`).

- [ ] **Step 6: Stories — the seven canvases, card parity, and the overflow proof**

The card (`PostFrame.card.html`) rows:

- post at 0.2 on brand, with pattern, headlines, lockup and a 50% OfferSeal;
- portrait at 0.16 on ink;
- story at 0.115 on brand with `safeArea`;
- landscape at 0.28 on pink-100, padding 48;
- leaderboard at 0.46 on brand, padding 0;
- mpu at 0.6 on ink, padding 0.

The guideline card `canvas-formats.card.html` shows the seven to scale.

LogoLockup and OfferSeal are Plan 3b molecules. The boards sign with the `Logo` lockup (the same artwork at the lockup widths) and omit the seal; the parity review lists both.

`packages/ui/src/layouts/post-frame/post-frame.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, waitFor, within } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Logo } from "../../atoms/logo/logo";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { SocialHeadline } from "../../atoms/social-headline/social-headline";
import { Text } from "../../atoms/text/text";
import { Stack } from "../stack/stack";
import { POST_FORMATS, type PostFormat } from "./post-formats";
import { PostFrame } from "./post-frame";

const FORMATS: PostFormat[] = [
  "post",
  "portrait",
  "story",
  "landscape",
  "wide",
  "mpu",
  "leaderboard",
];

function Caption({ children }: { children: string }) {
  return (
    <Text variant="mono" as="div" tone="subtle" className="pt-2">
      {children}
    </Text>
  );
}

/** The house look: flooded pink, the tiled diamond, overline + headline + signature. */
function OfferBoard() {
  return (
    <>
      <PatternField tone="brand" tile={96} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between">
        <SocialHeadline size="overline" as="p">
          Tonight Only
        </SocialHeadline>
        <SocialHeadline size="hero">Chai first, decisions later.</SocialHeadline>
        <Logo tone="white" className="w-65" />
      </div>
    </>
  );
}

/** The ink alternate, for statements. */
function StatementBoard() {
  return (
    <>
      <PatternField tone="ink" tile={96} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between">
        <SocialHeadline size="overline" as="p" className="text-text-brand">
          Since 2025
        </SocialHeadline>
        <SocialHeadline size="hero">Desi at heart. Urban by nature.</SocialHeadline>
        <Logo tone="white" className="w-60" />
      </div>
    </>
  );
}

const meta = {
  title: "Layouts/PostFrame",
  component: PostFrame,
  args: { format: "post", scale: 0.3, tone: "brand", children: <OfferBoard /> },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Every Instagram post, story, banner or OG image starts here — it fixes the exact pixel canvas so nothing is designed at an invented size. Children are authored at true canvas pixels (the canvas type scale through SocialHeadline, never screen sizes); the frame scales the whole board for preview with `scale`, or `isFit` to fit its parent's width (never above 1). `tone` is the board's one field colour: flooded `brand` (the house look), `ink` (statements), or the light product-led fields `soft` (pink-100), `alt` (pink-50) and `light` (white). `padding` defaults to the format's safe margin (72px on 1080 canvases, 48px on 1200×628, 20px on display ads). `hasSafeArea` draws the story chrome guides. Never design a marketing asset outside the seven `POST_FORMATS`.",
      },
    },
  },
} satisfies Meta<typeof PostFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Post: Story = {
  name: "post 1080×1080 · scale 0.2",
  render: () => (
    <div>
      <PostFrame format="post" scale={0.2} tone="brand">
        <OfferBoard />
      </PostFrame>
      <Caption>post 1080x1080</Caption>
    </div>
  ),
};

export const Portrait: Story = {
  name: "portrait 1080×1350 · scale 0.16",
  render: () => (
    <div>
      <PostFrame format="portrait" scale={0.16} tone="ink">
        <StatementBoard />
      </PostFrame>
      <Caption>portrait 1080x1350</Caption>
    </div>
  ),
};

export const StoryWithSafeArea: Story = {
  name: "story 1080×1920 · hasSafeArea",
  render: () => (
    <div>
      <PostFrame format="story" scale={0.115} tone="brand" hasSafeArea>
        <div className="flex h-full flex-col justify-center gap-10">
          <SocialHeadline size="overline" as="p">
            First Order
          </SocialHeadline>
          <SocialHeadline size="h1">Half off, on us.</SocialHeadline>
        </div>
      </PostFrame>
      <Caption>story 1080x1920 + hasSafeArea</Caption>
    </div>
  ),
};

export const Landscape: Story = {
  name: "landscape 1200×628 · the 48px default",
  render: () => (
    <div>
      <PostFrame format="landscape" scale={0.28} tone="soft">
        <div className="flex h-full flex-col justify-between">
          <SocialHeadline size="h2">One kitchen. One grinder.</SocialHeadline>
          <Logo className="w-50" />
        </div>
      </PostFrame>
      <Caption>landscape 1200x628</Caption>
    </div>
  ),
};

/** The 16:9 screen and menu board (dev parity). */
export const Wide: Story = {
  name: "wide 1920×1080 · scale 0.16",
  render: () => (
    <div>
      <PostFrame format="wide" scale={0.16} tone="ink">
        <div className="flex h-full flex-col justify-between">
          <SocialHeadline size="hero">100% vegetarian kitchen.</SocialHeadline>
          <Logo tone="white" className="w-65" />
        </div>
      </PostFrame>
      <Caption>wide 1920x1080</Caption>
    </div>
  ),
};

/** The dashed bands are where the platform's own chrome sits: keep type and logos out (dev parity). */
export const SafeAreaGuides: Story = {
  name: "story · hasSafeArea off and on",
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      {([false, true] as const).map((hasSafeArea) => (
        <div key={String(hasSafeArea)}>
          <PostFrame format="story" scale={0.16} tone="brand" hasSafeArea={hasSafeArea}>
            <div className="flex h-full flex-col justify-center gap-10">
              <SocialHeadline size="overline" as="p">
                First Order
              </SocialHeadline>
              <SocialHeadline size="h1">Half off, on us.</SocialHeadline>
            </div>
          </PostFrame>
          <Caption>{hasSafeArea ? "guides on · 250px top, 320px bottom" : "guides off"}</Caption>
        </div>
      ))}
    </div>
  ),
};

/** `padding`: default (the format's safe margin, 72px on a post) · tight 48px · none (dev parity). */
export const Padding: Story = {
  name: "padding — default · tight · none",
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      {(["default", "tight", "none"] as const).map((padding) => (
        <div key={padding}>
          <PostFrame format="post" scale={0.2} tone="brand" padding={padding}>
            <div className="size-full outline-2 -outline-offset-2 outline-border-default outline-dashed" />
          </PostFrame>
          <Caption>{`padding="${padding}"`}</Caption>
        </div>
      ))}
    </div>
  ),
};

/** The pink-50 board — light and product-led (the marketing kit's pink-50 feed post). */
export const AltBoard: Story = {
  name: 'post · tone="alt" (pink-50)',
  render: () => (
    <div>
      <PostFrame format="post" scale={0.2} tone="alt">
        <div className="flex h-full flex-col justify-between">
          <SocialHeadline size="overline" as="p" className="text-text-brand">
            New on the menu
          </SocialHeadline>
          <SocialHeadline size="h1">Masala Cold Brew.</SocialHeadline>
          <Logo className="w-60" />
        </div>
      </PostFrame>
      <Caption>post 1080x1080 · tone alt</Caption>
    </div>
  ),
};

export const Leaderboard: Story = {
  name: 'leaderboard 728×90 · padding="none"',
  render: () => (
    <div>
      <PostFrame format="leaderboard" scale={0.46} tone="brand" padding="none">
        <div className="flex h-full items-center gap-4 px-4">
          <Logo tone="white" className="w-21" />
          <Text variant="h4" as="span" weight="black" className="min-w-0 flex-1 truncate">
            50% off your first order
          </Text>
          <Button size="sm">Order Now</Button>
        </div>
      </PostFrame>
      <Caption>leaderboard 728x90</Caption>
    </div>
  ),
};

export const Mpu: Story = {
  name: 'mpu 300×250 · padding="none"',
  render: () => (
    <div>
      <PostFrame format="mpu" scale={0.6} tone="ink" padding="none">
        <div className="flex h-full flex-col justify-between p-4">
          <Logo tone="white" className="w-19" />
          <SocialHeadline size="caption">Chai first, decisions later.</SocialHeadline>
          <Button size="sm" isFullWidth>
            Order Now
          </Button>
        </div>
      </PostFrame>
      <Caption>mpu 300x250</Caption>
    </div>
  ),
};

/** The guideline card: the only seven canvases, all at one scale so their sizes compare. */
export const AllFormats: Story = {
  name: "POST_FORMATS — the seven canvases to scale",
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      {FORMATS.map((format) => {
        const { width, height, label } = POST_FORMATS[format];
        return (
          <div key={format}>
            <PostFrame format={format} scale={0.1} tone="brand" padding="none" />
            <Caption>{`${format} ${String(width)}x${String(height)} · ${label}`}</Caption>
          </div>
        );
      })}
    </div>
  ),
};

export const FitToParent: Story = {
  name: "isFit — scales to its parent's width",
  render: () => (
    <div className="max-w-120">
      <PostFrame format="post" isFit tone="brand">
        <OfferBoard />
      </PostFrame>
    </div>
  ),
};

/**
 * Review Focus 5: a fixed scale reserves exactly the scaled box, a fit frame fills its parent's
 * width at the canvas's own aspect ratio, and the true-pixel canvas never leaks into any layout.
 */
export const FitsItsParentAt360: Story = {
  name: "360px — a scaled board never overflows its parent",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <Stack space={6}>
      <div data-testid="fixed-parent">
        <PostFrame data-testid="fixed" format="post" scale={0.25} tone="brand">
          <OfferBoard />
        </PostFrame>
      </div>
      <div data-testid="fit-parent" className="max-w-75">
        <PostFrame data-testid="fit" format="portrait" isFit tone="ink">
          <StatementBoard />
        </PostFrame>
      </div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = (id: string) => canvas.getByTestId(id).getBoundingClientRect();
    const { width: postWidth, height: postHeight } = POST_FORMATS.post;
    const { width: portraitWidth, height: portraitHeight } = POST_FORMATS.portrait;

    await expect(box("fixed").width).toBeCloseTo(postWidth * 0.25, 0);
    await expect(box("fixed").height).toBeCloseTo(postHeight * 0.25, 0);

    const fitParent = canvas.getByTestId("fit-parent");
    await waitFor(async () => {
      await expect(box("fit").width).toBeCloseTo(fitParent.clientWidth, 0);
    });
    await expect(box("fit").height).toBeCloseTo(
      (fitParent.clientWidth * portraitHeight) / portraitWidth,
      0
    );

    for (const id of ["fixed-parent", "fit-parent"]) {
      const parent = canvas.getByTestId(id);
      await expect(parent.scrollWidth).toBe(parent.clientWidth);
    }
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
```

- [ ] **Step 7: Export**

Add to `packages/ui/src/index.ts`:

```ts
export { POST_FORMATS, type PostFormat } from "./layouts/post-frame/post-formats";
export { PostFrame, type PostFrameProps } from "./layouts/post-frame/post-frame";
```

(`scaledSize` and `PostFrameScaler` stay internal.)

- [ ] **Step 8: Format, gate, commit**

Run `pnpm exec prettier --write packages/ui/src/layouts/post-frame packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/post-frame.json`, then the gate. Expected: green, including `FitsItsParentAt360`. Paste the summary lines.

```bash
git add packages/design-tokens/tokens/component/post-frame.json packages/ui/src/layouts/post-frame \
  packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): PostFrame layout and the seven canvas formats

POST_FORMATS mirrors the canvas tokens and a spec keeps them equal. The
frame reserves exactly canvas x scale and clips the true-pixel canvas,
so a board never leaks into its parent; isFit is a tiny client leaf that
scales to the frame's width with a ResizeObserver. Padding defaults to
each format's safe margin, and story frames draw the chrome guides.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

