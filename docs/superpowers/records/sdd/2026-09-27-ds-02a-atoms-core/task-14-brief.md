### Task 14: Avatar

**Dev reference:** `git show dev:packages/ui/src/atoms/avatar/avatar.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                              | Ruling  | Where / reason                                                                                                     |
| --------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| Radix `Avatar` + `"use client"`                                       | DROP    | D6/D7 (Radix only for Dialog/Sheet, Tabs, Tooltip, Toast, ToggleGroup and Slot)                                    |
| The initials stay up while the photo loads, and for good if it fails  | ADD     | Step 4: the photo is layered over the initials (`absolute inset-0`, server-safe, no load state); Step 2 photo test |
| The photo carries the name as `alt`                                   | ALREADY | the root is `role="img"` named by `name`; the photo is presentational (`alt=""`)                                   |
| A glyph wins over a name                                              | ALREADY | Step 4 (`icon ? … : initials`); ADD a test for `icon` + `name` (Step 2)                                            |
| Ring as `ring-2 ring-offset-2`, never a border                        | ALREADY | `shadow-avatar-ring` (two box-shadows, no border)                                                                  |
| `size-6…20`, `rounded-6`, `text-h3`                                   | DROP    | D4; `avatar-*` tokens                                                                                              |
| `select-none` on the root                                             | ADD     | Step 4 `root` slot; Step 2 className test                                                                          |
| Tests: one-, two- and three-word initials, sizes, ring, circular, axe | ALREADY | Step 2                                                                                                             |
| Test: caller className replaces the radius                            | ADD     | Step 2                                                                                                             |
| Stories `Default`, `Sizes`, `Initials`, `GlyphFallback`, `Ring`       | ALREADY | `Playground`, `Sizes`, `Initials`, `IconFallback`, `Ring`                                                          |
| Story `Photo` (with the failed-photo fallback)                        | ADD     | Step 6                                                                                                             |
| Story `InAReviewRow`                                                  | ADD     | Step 6 `InAGuestRow` (no review copy: spec §10.1 bars fabricated testimonials)                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Avatar.{jsx,d.ts,card.html,prompt.md}`.

**Visuals:**

- A circle of 24 / 32 / 40 / 56 / 80px (xs–xl), pink-100 fill, pink-700 Poppins 700 initials at −0.01em.
- Initials size is `max(10, round(0.38 × size))`: 10 / 12 / 15 / 21 / 30px.
- Up to two initials, from the first two words.
- The glyph fallback is half the circle (12 / 16 / 20 / 28 / 40px). Its stroke is 2px up to 16px and 1.75px above, the same rule as Icon.
- A photo fills the circle, layered over the initials (or glyph), so they show while it loads and stay if it fails (dev parity, no client code).
- `hasRing`: `0 0 0 2px white, 0 0 0 4px pink-500`.

**Semantics:** with a `name`, `role="img"` named by it (and `title`, as in the zip). The initials and photo inside are presentational. Without a name it is decorative (`aria-hidden`).

**Files:**

- Create: `packages/design-tokens/tokens/component/avatar.json`
- Modify: `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/avatar/avatar.tsx`, `avatar.test.tsx`, `avatar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`, `SHADOW`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`, `componentVariants`.
- Produces: `Avatar`, `interface AvatarProps extends ComponentProps<"span">` (contracts §2); tokens `spacing-avatar-{xs,sm,md,lg,xl}`, `text-avatar-{xs,sm,md,lg,xl}`, `shadow-avatar-ring`.

- [ ] **Step 1: Component tokens and contrast pair**

`packages/design-tokens/tokens/component/avatar.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "avatar-xs": { "$value": "24px" },
    "avatar-sm": { "$value": "32px" },
    "avatar-md": { "$value": "40px" },
    "avatar-lg": { "$value": "56px" },
    "avatar-xl": { "$value": "80px" }
  },
  "text": {
    "$type": "typography",
    "avatar-xs": {
      "$value": {
        "fontSize": "10px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Initials: max(10px, 0.38 × the avatar size)."
    },
    "avatar-sm": {
      "$value": {
        "fontSize": "12px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "avatar-md": {
      "$value": {
        "fontSize": "15px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "avatar-lg": {
      "$value": {
        "fontSize": "21px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "avatar-xl": {
      "$value": {
        "fontSize": "30px",
        "lineHeight": 1,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    }
  },
  "shadow": {
    "$type": "shadow",
    "avatar-ring": {
      "$value": "0 0 0 2px {color.ink.000}, 0 0 0 4px {color.pink.500}",
      "$description": "The signed-in guest's halo."
    }
  }
}
```

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "avatar",
  "surface": null,
  "pairs": [["color-pink-700", "color-pink-100"]],
  "min": 4.5
}
```

In `component-variants.ts`, append to `SPACING`: `"avatar-xs", "avatar-sm", "avatar-md", "avatar-lg", "avatar-xl",`; to `TEXT`: the same five names; to `SHADOW`: `"avatar-ring",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "shadow-avatar-ring" packages/design-tokens/dist/theme.css`
Expected: `--shadow-avatar-ring: 0 0 0 2px #FFFFFF, 0 0 0 4px #EE2C68;` (resolved inside `dist/` only, never in source).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/avatar/avatar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { User } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("shows two initials on pink-100 and is an image named by the person", () => {
    render(<Avatar name="Aditi Rao" />);
    const avatar = screen.getByRole("img", { name: "Aditi Rao" });
    expect(avatar).toHaveTextContent("AR");
    expect(avatar).toHaveAttribute("title", "Aditi Rao");
    expect(avatar).toHaveClass(
      "bg-pink-100",
      "text-pink-700",
      "font-display",
      "rounded-pill",
      "overflow-hidden",
      "size-avatar-md",
      "text-avatar-md"
    );
  });

  it.each([
    ["Kabir", "K"],
    ["Meera S Iyer", "MS"],
    ["  aditi   rao  ", "AR"],
    ["प्रिया शर्मा", "पश"],
  ] as const)("derives the initials of %j as %s", (name, initials) => {
    render(<Avatar name={name} />);
    expect(screen.getByRole("img")).toHaveTextContent(initials);
  });

  it("layers a photo over the initials, which stay as the fallback while it loads or if it fails", () => {
    render(<Avatar name="Aditi Rao" src="/guests/aditi.jpg" />);
    const avatar = screen.getByRole("img", { name: "Aditi Rao" });
    const photo = avatar.querySelector("img");
    expect(photo).toHaveAttribute("src", "/guests/aditi.jpg");
    expect(photo).toHaveAttribute("alt", "");
    expect(photo).toHaveClass("absolute", "inset-0", "size-full", "object-cover");
    expect(avatar).toHaveClass("relative");
    expect(avatar).toHaveTextContent("AR");
  });

  it("draws the glyph instead of initials when both are given, still named by the person", () => {
    render(<Avatar name="Aditi Rao" icon={User} />);
    const avatar = screen.getByRole("img", { name: "Aditi Rao" });
    expect(avatar.querySelector("svg")).not.toBeNull();
    expect(avatar).not.toHaveTextContent("AR");
  });

  it("lets a consumer className replace its radius, and never selects its initials", () => {
    render(<Avatar name="Aditi Rao" className="rounded-md" />);
    const avatar = screen.getByRole("img");
    expect(avatar).toHaveClass("rounded-md", "select-none");
    expect(avatar).not.toHaveClass("rounded-pill");
  });

  it("draws a glyph at half its size in place of initials", () => {
    const { container } = render(<Avatar icon={User} size="lg" />);
    const glyph = container.firstElementChild?.firstElementChild;
    expect(glyph).toHaveClass("size-1/2");
    expect(glyph).not.toHaveClass("size-icon-lg");
    expect(glyph?.querySelector("svg")).toHaveAttribute("stroke-width", "1.75");
  });

  it("uses the heavy 2px stroke on the small sizes", () => {
    const { container } = render(<Avatar icon={User} size="xs" />);
    expect(container.querySelector("svg")).toHaveAttribute("stroke-width", "2");
  });

  it.each([
    ["xs", "size-avatar-xs", "text-avatar-xs"],
    ["sm", "size-avatar-sm", "text-avatar-sm"],
    ["md", "size-avatar-md", "text-avatar-md"],
    ["lg", "size-avatar-lg", "text-avatar-lg"],
    ["xl", "size-avatar-xl", "text-avatar-xl"],
  ] as const)("sizes %s with %s and %s", (size, box, type) => {
    render(<Avatar name="Aditi Rao" size={size} />);
    expect(screen.getByRole("img")).toHaveClass(box, type);
  });

  it("marks the signed-in guest with the pink ring", () => {
    render(<Avatar name="Aditi Rao" hasRing />);
    expect(screen.getByRole("img")).toHaveClass("shadow-avatar-ring");
  });

  it("is decorative when it has no name (Review Focus 2)", () => {
    const { container } = render(<Avatar icon={User} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).not.toHaveAttribute("role");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("treats a blank name as no name", () => {
    const { container } = render(<Avatar name="   " />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toBeEmptyDOMElement();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Avatar name="Aditi Rao" hasRing />
        <Avatar name="Kabir" src="/guests/kabir.jpg" />
        <Avatar icon={User} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./avatar"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/avatar/avatar.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { Icon, type IconComponent } from "../icon/icon";

export interface AvatarProps extends ComponentProps<"span"> {
  /** The person's name — the initials, the title and the accessible name. */
  name?: string;
  /** Photo URL; fills the circle. */
  src?: string;
  /** xs 24 · sm 32 · md 40 · lg 56 · xl 80. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** A glyph in place of initials (e.g. a signed-out guest). */
  icon?: IconComponent;
  /** The pink halo of the signed-in guest. */
  hasRing?: boolean;
}

const avatar = componentVariants({
  slots: {
    root: "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-pill bg-pink-100 font-display text-pink-700 select-none",
    // Over the initials: they show while the photo loads, and stay if it fails (alt="" paints nothing).
    image: "absolute inset-0 size-full object-cover",
    // Half the circle; `Icon`'s own size only picks the stroke (2px ≤ 16px, 1.75px above).
    icon: "size-1/2",
  },
  variants: {
    size: {
      xs: { root: "size-avatar-xs text-avatar-xs" },
      sm: { root: "size-avatar-sm text-avatar-sm" },
      md: { root: "size-avatar-md text-avatar-md" },
      lg: { root: "size-avatar-lg text-avatar-lg" },
      xl: { root: "size-avatar-xl text-avatar-xl" },
    },
    hasRing: { true: { root: "shadow-avatar-ring" } },
  },
  defaultVariants: { size: "md", hasRing: false },
});

/** Up to two initials, from the first two words; code-point safe for Devanagari names. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word !== "")
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Circular guest or staff avatar. Falls back to initials on pink-100. */
export function Avatar({
  name,
  src,
  size = "md",
  icon,
  hasRing,
  className,
  ...props
}: AvatarProps) {
  const slots = avatar({ size, hasRing });
  const title = name?.trim() ?? "";
  const hasName = title !== "";
  return (
    <span
      role={hasName ? "img" : undefined}
      aria-label={hasName ? title : undefined}
      aria-hidden={hasName ? undefined : true}
      title={hasName ? title : undefined}
      className={slots.root({ className })}
      {...props}
    >
      {icon ? <Icon icon={icon} size={size} className={slots.icon()} /> : initialsOf(title)}
      {src === undefined ? null : <img src={src} alt="" className={slots.image()} />}
    </span>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Avatar.card.html`): `size` (xs–xl), `initials` (Aditi Rao, Kabir, Meera S Iyer), `icon fallback` (user; user lg), `ring` (→ `hasRing`, lg). Dev parity adds `Photo` (with a failed photo) and `InAGuestRow`. These are sample guest names on a component card, not testimonials (spec §10.1's kit rule).

`packages/ui/src/atoms/avatar/avatar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { User } from "lucide-react";

import symbolPink from "../../assets/brand/symbol-pink.svg";
import { Avatar } from "./avatar";

const meta = {
  title: "Atoms/Avatar",
  component: Avatar,
  args: { name: "Aditi Rao", size: "md" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Circular avatar for guest accounts, reviews and staff credits. No photo → initials in Poppins 700 on pink-100. Never square, never a coloured random-hash background. `hasRing` marks the signed-in guest. With a `name` it is an image named by that name; without one it is decorative.",
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} name="Aditi Rao" size={size} />
      ))}
    </div>
  ),
};

export const Initials: Story = {
  name: "name (initials)",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aditi Rao" />
      <Avatar name="Kabir" />
      <Avatar name="Meera S Iyer" />
    </div>
  ),
};

export const IconFallback: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar icon={User} />
      <Avatar icon={User} size="lg" />
    </div>
  ),
};

export const Ring: Story = {
  name: "hasRing",
  args: { name: "Aditi Rao", size: "lg", hasRing: true },
};

/**
 * With `src` the photo covers the initials once it decodes. The second path is deliberately
 * unresolvable: it is the failed-photo case, where the initials hold the space.
 */
export const Photo: Story = {
  name: "src (and a failed photo)",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aditi Rao" src={symbolPink} size="lg" />
      <Avatar name="Kabir" src="/missing/guest-photo.jpg" size="lg" hasRing />
    </div>
  ),
};

/** In context: a signed-in guest row. */
export const InAGuestRow: Story = {
  name: "in context: a signed-in guest row",
  render: () => (
    <div className="flex max-w-96 items-center gap-3 rounded-lg bg-surface-card p-4 shadow-1">
      <Avatar name="Aditi Rao" size="lg" hasRing />
      <div className="min-w-0">
        <p className="m-0 font-display text-body font-bold text-text-heading">Aditi Rao</p>
        <p className="m-0 font-body text-caption text-text-muted">Signed in · 3 orders</p>
      </div>
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Avatar, type AvatarProps } from "./atoms/avatar/avatar";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/avatar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/avatar.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Avatar atom with initials, photo, glyph and ring

Five sizes with initials sized as the design system computes them, a photo
that fills the circle, a half-size glyph fallback and the signed-in ring.
A named avatar is an image named by the person; an unnamed one is decorative.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

