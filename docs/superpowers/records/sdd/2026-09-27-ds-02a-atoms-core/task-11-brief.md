### Task 11: ImageSlot

**Dev reference:** `git show dev:packages/ui/src/atoms/image-slot/image-slot.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                     | Ruling                        | Where / reason                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `label` defaults to "Dish photo"                                                                             | DROP                          | D9 (no content defaults); a placeholder requires `label` (contracts §2)                         |
| The placeholder is not announced                                                                             | ALREADY                       | the plan names it (`role="img"` + `label`), so the crop brief is not silent                     |
| `alt` defaults to `""`                                                                                       | ALREADY                       | `alt` is required; a decorative photo passes `alt=""` explicitly                                |
| Arbitrary `aspect-[4/3]`; radius `thumb`/`card`/`sheet`; labels pink-400 / pink-700 / ink-500                | DROP                          | AUTHORING §6 (aspect tokens); contracts §2 radius enum (D4); spec §5.3 re-pointing              |
| `isFullHeight` drops the ratio                                                                               | ALREADY                       | `isFill` (`aspect-auto h-full`, exactly one aspect class)                                       |
| The caption is dropped once a photo is given                                                                 | ALREADY                       | the union forbids `label` with `src` (`label?: never`)                                          |
| Native `div` props (`id`, `data-*`, `ref`, `aria-*`) forwarded to the root                                   | ADD, pending a contract delta | contracts §2 `ImageSlotBase` has no native props: 02a audit, proposed delta 1. Not amended here |
| Tests: placeholder, photo + `object-cover`, ratios, no collapse, tones, radii, fill, className override, axe | ALREADY                       | Step 2                                                                                          |
| Stories `Default`, `Tones`, `Radii`, `NamingTheCrop`, `FullHeight`                                           | ALREADY                       | `Playground`, `Tones`, `Radii`, `Label`, `Fill`                                                 |
| Story `Ratios` shows 4:5 and 21:9 too                                                                        | ADD                           | Step 6 `Ratios` (all seven)                                                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/ImageSlot.{jsx,d.ts,card.html,prompt.md}`, readme §3.4 and §3.10 ("images always sit in an `aspect-ratio` box, so a missing photo can't collapse a layout"), spec §9.1.

**Placeholder visuals:**

- A full-width box with an aspect ratio, a md radius, clipped content and a centred label.
- Label: Poppins 700, 10.5px, +0.12em, capitals, balanced, 12px side padding.
- Tones (labels re-pointed for AA, spec §5.3 and contract deviation 5):
  - soft: pink-100 fill, label pink-400 → **pink-700**.
  - strong: pink-200 fill, label pink-700 → **pink-800**.
  - ink: ink-200 fill, label ink-500 → **ink-600**.

**With a photo:** a real `<img>` (the zip used `background-image`) with intrinsic `width`/`height`, `loading="lazy"` by default, `decoding="async"` and `object-cover`, filling the same box.

The props are a discriminated union: a photo requires `alt`, `width` and `height`, while a placeholder requires `label`. A `<picture>` passed as children (the image pipeline, step 2) renders in the same box.

**Files:**

- Create: `packages/design-tokens/tokens/component/image-slot.json`
- Modify: `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/image-slot/image-slot.tsx`, `image-slot.test.tsx`, `image-slot.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `componentVariants`; `aspect-*` (Plan 1 aspect tokens), `rounded-{md,lg,xl}`.
- Produces: `ImageSlot`, `interface ImageSlotBase`, `type ImageSlotProps` (exactly contracts §2); token `text-image-slot-label`.

- [ ] **Step 1: Component token and contrast pairs**

`packages/design-tokens/tokens/component/image-slot.json`:

```json
{
  "text": {
    "$type": "typography",
    "image-slot-label": {
      "$value": {
        "fontSize": "10.5px",
        "letterSpacing": "0.12em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "The placeholder's crop label. Inherits line height, as in the design system."
    }
  }
}
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "image-slot",
  "surface": null,
  "pairs": [
    ["color-pink-700", "color-pink-100"],
    ["color-pink-800", "color-pink-200"],
    ["color-ink-600", "color-ink-200"]
  ],
  "min": 4.5
}
```

(Measured: 5.66, 6.67, 5.22. The design system's pink-400 / pink-700 / ink-500 measure 2.53 / 4.48 / 3.07.)

In `component-variants.ts`, append to `TEXT`: `"image-slot-label",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/image-slot/image-slot.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ImageSlot } from "./image-slot";

describe("ImageSlot", () => {
  it("renders a labelled placeholder that names the crop, announced as an image", () => {
    render(<ImageSlot label="Hero 16:9 — warm, close-cropped" ratio="16:9" />);
    const slot = screen.getByRole("img", { name: "Hero 16:9 — warm, close-cropped" });
    expect(slot).toHaveTextContent("Hero 16:9 — warm, close-cropped");
    expect(slot.firstElementChild).toHaveClass(
      "font-display",
      "text-image-slot-label",
      "uppercase",
      "text-balance",
      "text-center"
    );
  });

  it("keeps its aspect box and full width with no photo (Review Focus 4)", () => {
    render(<ImageSlot label="Dish photo" ratio="16:9" />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass("aspect-16-9", "w-full", "overflow-hidden");
    expect(slot.className.match(/(^|\s)aspect-/g)).toHaveLength(1);
  });

  it.each([
    ["square", "aspect-square"],
    ["4:3", "aspect-4-3"],
    ["3:4", "aspect-3-4"],
    ["4:5", "aspect-4-5"],
    ["16:9", "aspect-16-9"],
    ["16:10", "aspect-16-10"],
    ["wide", "aspect-wide"],
  ] as const)("ratio %s uses %s", (ratio, aspect) => {
    render(<ImageSlot label="Crop" ratio={ratio} />);
    expect(screen.getByRole("img")).toHaveClass(aspect);
  });

  it("defaults to a 4:3 soft slot with the md radius", () => {
    render(<ImageSlot label="Dish photo" />);
    expect(screen.getByRole("img")).toHaveClass("aspect-4-3", "bg-pink-100", "rounded-md");
  });

  it.each([
    ["soft", "bg-pink-100", "text-pink-700"],
    ["strong", "bg-pink-200", "text-pink-800"],
    ["ink", "bg-ink-200", "text-ink-600"],
  ] as const)("tone %s fills %s and labels in %s (AA, spec §5.3)", (tone, fill, label) => {
    render(<ImageSlot label="Kitchen" tone={tone} />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass(fill);
    expect(slot.firstElementChild).toHaveClass(label);
  });

  it.each([
    ["none", "rounded-none"],
    ["md", "rounded-md"],
    ["lg", "rounded-lg"],
    ["xl", "rounded-xl"],
  ] as const)("radius %s uses %s", (radius, radiusClass) => {
    render(<ImageSlot label="Crop" radius={radius} />);
    expect(screen.getByRole("img")).toHaveClass(radiusClass);
  });

  it("fills its parent's height instead of an aspect ratio when isFill — one aspect class (Review Focus 4)", () => {
    render(<ImageSlot label="Full-bleed panel" isFill />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass("h-full", "aspect-auto");
    expect(slot.className.match(/(^|\s)aspect-/g)).toHaveLength(1);
  });

  it("renders a real photo as a lazy, intrinsically sized img covering the box (Review Focus 4)", () => {
    render(
      <ImageSlot
        src="/photos/boxes-packed.avif"
        alt="Freshly packed Homely Meals box"
        width={1200}
        height={900}
      />
    );
    const img = screen.getByRole("img", { name: "Freshly packed Homely Meals box" });
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("width", "1200");
    expect(img).toHaveAttribute("height", "900");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveClass("size-full", "object-cover");
    expect(img.parentElement).toHaveClass("aspect-4-3");
    expect(img.parentElement).not.toHaveAttribute("role");
  });

  it("passes srcSet, sizes and an eager high priority through for the hero", () => {
    render(
      <ImageSlot
        src="/hero-1200.avif"
        srcSet="/hero-600.avif 600w, /hero-1200.avif 1200w"
        sizes="(min-width: 768px) 50vw, 100vw"
        alt="Classic thali"
        width={1200}
        height={1500}
        ratio="4:5"
        loading="eager"
        fetchPriority="high"
      />
    );
    const img = screen.getByRole("img", { name: "Classic thali" });
    expect(img).toHaveAttribute("srcset", "/hero-600.avif 600w, /hero-1200.avif 1200w");
    expect(img).toHaveAttribute("sizes", "(min-width: 768px) 50vw, 100vw");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("renders a <picture> from the image pipeline inside the same box", () => {
    render(
      <ImageSlot label="Thali 4:3" ratio="4:3">
        <picture>
          <source srcSet="/thali.avif" type="image/avif" />
          <img src="/thali.jpg" alt="Classic thali" width={800} height={600} />
        </picture>
      </ImageSlot>
    );
    const img = screen.getByRole("img", { name: "Classic thali" });
    expect(img.closest("picture")?.parentElement).toHaveClass("aspect-4-3");
    expect(screen.queryByRole("img", { name: "Thali 4:3" })).not.toBeInTheDocument();
  });

  it("does not compile a photo without alt, width and height", () => {
    // @ts-expect-error — a real image needs alt (a11y) and intrinsic size (no layout shift)
    render(<ImageSlot src="/photos/thali.jpg" />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("merges a consumer className", () => {
    render(<ImageSlot label="Dish photo" className="w-40" />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass("w-40");
    expect(slot).not.toHaveClass("w-full");
  });

  it("has no accessibility violations as a placeholder and as a photo", async () => {
    const { container } = render(
      <>
        <ImageSlot label="Hero 4:5 — warm, close-cropped" ratio="4:5" />
        <ImageSlot src="/photos/thali.jpg" alt="Classic thali" width={800} height={600} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./image-slot"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/image-slot/image-slot.tsx`:

```tsx
import type { ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";

export interface ImageSlotBase {
  ratio?: "square" | "4:3" | "3:4" | "4:5" | "16:9" | "16:10" | "wide";
  radius?: "none" | "md" | "lg" | "xl";
  /** Placeholder colourway: soft pink-100 · strong pink-200 · ink grey. */
  tone?: "soft" | "strong" | "ink";
  /** Fill the parent's height instead of using an aspect ratio (full-bleed panels). */
  isFill?: boolean;
  className?: string;
  /** A `<picture>` from the image pipeline; its `<img>` should carry `size-full object-cover`. */
  children?: ReactNode;
}

/** A real image (alt and intrinsic size required), or a placeholder that names the crop it needs. */
export type ImageSlotProps = ImageSlotBase &
  (
    | {
        src: string;
        alt: string;
        width: number;
        height: number;
        sizes?: string;
        srcSet?: string;
        loading?: "lazy" | "eager";
        fetchPriority?: "high" | "low" | "auto";
        label?: never;
      }
    | { src?: undefined; label: string }
  );

const imageSlot = componentVariants({
  slots: {
    root: "relative grid w-full place-items-center overflow-hidden",
    image: "size-full object-cover",
    label: "text-image-slot-label px-3 text-center font-display text-balance uppercase",
  },
  variants: {
    ratio: {
      square: { root: "aspect-square" },
      "4:3": { root: "aspect-4-3" },
      "3:4": { root: "aspect-3-4" },
      "4:5": { root: "aspect-4-5" },
      "16:9": { root: "aspect-16-9" },
      "16:10": { root: "aspect-16-10" },
      wide: { root: "aspect-wide" },
    },
    radius: {
      none: { root: "rounded-none" },
      md: { root: "rounded-md" },
      lg: { root: "rounded-lg" },
      xl: { root: "rounded-xl" },
    },
    tone: {
      soft: { root: "bg-pink-100", label: "text-pink-700" },
      strong: { root: "bg-pink-200", label: "text-pink-800" },
      ink: { root: "bg-ink-200", label: "text-ink-600" },
    },
    // Declared after `ratio`, so `aspect-auto` replaces the ratio in the merge.
    isFill: { true: { root: "aspect-auto h-full" } },
  },
  defaultVariants: { ratio: "4:3", radius: "md", tone: "soft", isFill: false },
});

/**
 * Every image in the system. Until real photography lands, a labelled placeholder that names the
 * crop it needs; with `src`, a lazy `<img>` in the same aspect box, so a layout never collapses.
 */
export function ImageSlot(props: ImageSlotProps) {
  const { ratio, radius, tone, isFill, className, children } = props;
  const slots = imageSlot({ ratio, radius, tone, isFill });
  const isPlaceholder = children === undefined && props.src === undefined;
  return (
    <div
      role={isPlaceholder ? "img" : undefined}
      aria-label={isPlaceholder ? props.label : undefined}
      className={slots.root({ className })}
    >
      {children ??
        (props.src === undefined ? (
          <span className={slots.label()}>{props.label}</span>
        ) : (
          <img
            className={slots.image()}
            src={props.src}
            alt={props.alt}
            width={props.width}
            height={props.height}
            sizes={props.sizes}
            srcSet={props.srcSet}
            loading={props.loading ?? "lazy"}
            decoding="async"
            fetchPriority={props.fetchPriority}
          />
        ))}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`ImageSlot.card.html`): `ratio` (square 96px, 4:3 120px, 3:4 80px, 16:9 150px wide; plus 4:5, 16:10 and 21:9 for dev parity), `tone`, `label` ("name the real crop", max 300px). Extras: `src` (a real image, the committed brand symbol), `isFill`, `radius`.

`packages/ui/src/atoms/image-slot/image-slot.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import symbolPink from "../../assets/brand/symbol-pink.svg";
import { ImageSlot } from "./image-slot";

const meta = {
  title: "Atoms/ImageSlot",
  component: ImageSlot,
  args: { label: "Hero 4:5 — warm, close-cropped", ratio: "4:5", className: "w-60" },
  parameters: {
    docs: {
      description: {
        component:
          'Every image in the system. Until real photography lands, it renders a labelled pink placeholder that names the crop needed — always give a specific `label` ("Dish photo" says nothing; "Kitchen portrait 3:4" is what a photographer can act on). With `src` it renders a lazy `<img>` with its intrinsic `width`/`height` inside the same aspect box, so a missing photo never collapses a layout. `isFill` for full-bleed panels; pass a `<picture>` as children for the image pipeline.',
      },
    },
  },
} satisfies Meta<typeof ImageSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Ratios: Story = {
  name: "ratio",
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <ImageSlot ratio="square" label="1:1" className="w-24" />
      <ImageSlot ratio="4:3" label="4:3" className="w-30" />
      <ImageSlot ratio="3:4" label="3:4" className="w-20" />
      <ImageSlot ratio="4:5" label="4:5" className="w-20" />
      <ImageSlot ratio="16:9" label="16:9" className="w-37.5" />
      <ImageSlot ratio="16:10" label="16:10" className="w-37.5" />
      <ImageSlot ratio="wide" label="21:9" className="w-37.5" />
    </div>
  ),
};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex items-start gap-3">
      <ImageSlot tone="soft" label="soft" className="w-30" />
      <ImageSlot tone="strong" label="strong" className="w-30" />
      <ImageSlot tone="ink" label="ink" className="w-30" />
    </div>
  ),
};

export const Label: Story = {
  name: "label (name the real crop)",
  render: () => (
    <ImageSlot
      ratio="16:9"
      label="Hero 16:9 — warm, close-cropped, steam visible"
      className="max-w-75"
    />
  ),
};

export const Photo: Story = {
  name: "src (a real image)",
  render: () => (
    <ImageSlot
      src={symbolPink}
      alt="The Pink Paprikaa diamond symbol"
      width={358}
      height={358}
      ratio="square"
      tone="ink"
      className="w-40"
    />
  ),
};

export const Fill: Story = {
  name: "isFill",
  render: () => (
    <div className="h-40 w-72">
      <ImageSlot isFill radius="xl" label="Full-bleed panel — fills its parent" />
    </div>
  ),
};

export const Radii: Story = {
  name: "radius",
  render: () => (
    <div className="flex items-start gap-3">
      {(["none", "md", "lg", "xl"] as const).map((radius) => (
        <ImageSlot key={radius} radius={radius} label={radius} className="w-30" />
      ))}
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { ImageSlot, type ImageSlotBase, type ImageSlotProps } from "./atoms/image-slot/image-slot";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/image-slot packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/image-slot.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the ImageSlot atom, a real image or a named placeholder

A discriminated union: a photo needs alt and intrinsic size and renders a lazy
img covering the box; a placeholder names the crop it needs. Either way the
box keeps its aspect ratio, so a missing photo cannot collapse a layout.
Placeholder labels are re-pointed to AA-passing steps.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

