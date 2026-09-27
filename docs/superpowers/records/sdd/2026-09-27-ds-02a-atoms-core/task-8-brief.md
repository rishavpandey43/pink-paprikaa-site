### Task 8: Tag

**Dev reference:** `git show dev:packages/ui/src/atoms/tag/tag.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                       | Ruling  | Where / reason                                                                                                                  |
| ---------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Always a `<button aria-pressed>`                                                               | DROP    | spec §9.1 (`<button>` with `onClick`, `<span>` without)                                                                         |
| `h-9.5`, `rounded-6`, `text-body2`, `bg-brand-primary`                                         | DROP    | D4; `tag-h` / `text-tag` tokens                                                                                                 |
| Unselected hover also tints the border (`border-brand-soft`)                                   | DROP    | `Tag.jsx` keeps the border; readme §3.8 tints the fill only                                                                     |
| A selected, pressable tag darkens on hover                                                     | ADD     | readme §3.8 ("darken pink one step"); Step 1 `color-tag-selected-hover` (ink-800 on a pink field); Step 4 compound; Step 2 test |
| Press scale (`active:scale`)                                                                   | ADD     | readme §3.8 and `controlStates`' own contract ("interactive Tag"); Step 4 `isInteractive`; Step 2 test                          |
| Tests: pressed state, selected fill, 38px, `onClick`, disabled blocks, grey disabled fill, axe | ALREADY | Step 2                                                                                                                          |
| Test: the glyph is not announced twice                                                         | ADD     | Step 2                                                                                                                          |
| Test: caller className replaces the radius                                                     | ADD     | Step 2                                                                                                                          |
| Stories `Default`, `Selection`, `WithIcons`                                                    | ALREADY | `Playground`, `Selectable`, `WithIcon`                                                                                          |
| Story `Disabled` includes a disabled selected tag                                              | ADD     | Step 6                                                                                                                          |
| Story `CategoryFilterRail` (six categories, wrapping at 360px)                                 | ADD     | Step 6                                                                                                                          |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/Tag.{jsx,d.ts,card.html,prompt.md}`; static tones from the handoff's delivery-zone chips (`design/Contact.dc.html`).

**Visuals:**

- A 38px pill, 16px side padding, a 6px gap to a 16px glyph, DM Sans 500 at 14px with line height 1, no wrap.
- Unselected: white, 1px border-default, ink-700; hover pink-50 when pressable.
- Selected: pink-500 fill and border, white text.
- Static tones: `success` is mint-soft fill, mint border and mint-strong text. `brand` is white fill, pink-200 border and pink-700 text.

**Behaviour:**

- With `onClick` it is `<button type="button" aria-pressed>`; without, a `<span>` (spec §9.1). The zip was always a button.
- Disabled is the grey fill (readme §3.8), not the zip's 50% opacity.
- On a pink field a selected tag would vanish (pink on pink), so the selected fill turns ink there. That is the one surface skin, `color-tag-selected`, with its hover twin `color-tag-selected-hover` (brand-hover pink-600; ink-800 on a pink field).
- A pressable tag presses with the 0.97 scale, and a pressable selected tag darkens one step on hover (readme §3.8; dev parity).

**Files:**

- Create: `packages/design-tokens/tokens/component/tag.json`
- Modify: `tokens/surface/brand.json`, `tokens/surface/light.json`, `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/tag/tag.tsx`, `tag.test.tsx`, `tag.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`, `IconComponent`, `controlStates`; `OnSurfaces`.
- Produces: `Tag`, `interface TagProps extends ComponentProps<"button">` (contracts §2), `tagVariants` (slots `root`, `label`; variants `tone`, `isSelected`, `isInteractive`). ChipGroup and FilterBar (Plan 3b) call it for Radix ToggleGroup items: `tagVariants({ isSelected, isInteractive: true }).root()`. Tokens `spacing-tag-h`, `text-tag`, `color-tag-selected`, `color-tag-selected-hover`.

- [ ] **Step 1: Component tokens, surface skin, contrast pairs**

`packages/design-tokens/tokens/component/tag.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "tag-h": { "$value": "38px", "$description": "Tag height — fixed; tags never wrap." }
  },
  "text": {
    "$type": "typography",
    "tag": {
      "$value": { "fontSize": "14px", "lineHeight": 1, "fontWeight": "{font-weight.medium}" }
    }
  },
  "color": {
    "$type": "color",
    "tag": {
      "selected": {
        "$value": "{color.pink.500}",
        "$description": "Selected fill and border; ink on a pink field, where pink would vanish."
      },
      "selected-hover": {
        "$value": "{color.brand.hover}",
        "$description": "Hover fill and border of a pressable selected tag (readme §3.8); ink-800 on a pink field."
      }
    }
  }
}
```

(`color.brand.hover` is not overridden by any surface, so the alias guard holds.)

`tokens/surface/brand.json`: inside `surface-brand.color`, add `"tag": { "selected": { "$value": "{color.ink.900}" }, "selected-hover": { "$value": "{color.ink.800}" } }`.
`tokens/surface/light.json`: inside `surface-light.color`, add `"tag": { "selected": { "$value": "{color.pink.500}" }, "selected-hover": { "$value": "{color.brand.hover}" } }`.

`packages/design-tokens/contrast-pairs.json`: append to `groups`:

```json
{
  "id": "tag",
  "surface": null,
  "pairs": [
    ["color-ink-700", "color-ink-000"],
    ["color-ink-700", "color-pink-50"],
    ["color-pink-700", "color-ink-000"],
    ["color-pink-700", "color-pink-50"],
    ["color-text-success", "color-status-success-soft"],
    ["color-ink-000", "color-tag-selected-hover"]
  ],
  "min": 4.5
},
{
  "id": "tag-selected",
  "surface": null,
  "pairs": [["color-ink-000", "color-tag-selected"]],
  "min": 3,
  "exception": "brand-fill"
},
{
  "id": "tag-selected-on-brand",
  "surface": "brand",
  "pairs": [
    ["color-ink-000", "color-tag-selected"],
    ["color-ink-000", "color-tag-selected-hover"]
  ],
  "min": 4.5
}
```

(Measured: ink-700 on white 11.19, on pink-50 10.48; pink-700 on white 7.19, on pink-50 6.73; mint-strong on mint-soft 5.57; white on ink-900 18.39; white on pink-600 5.18; white on ink-800 16.1.)

In `component-variants.ts`, append to `SPACING`: `"tag-h",`; to `TEXT`: `"tag",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6` → PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/tag/tag.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Clock, Flame, Leaf } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Tag } from "./tag";

const noop = () => undefined;

describe("Tag", () => {
  it("is a static chip, not a button, when it has no onClick", () => {
    render(<Tag>Static, no onClick</Tag>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const chip = screen.getByText("Static, no onClick").parentElement;
    expect(chip?.tagName).toBe("SPAN");
    expect(chip).not.toHaveAttribute("aria-pressed");
    expect(chip).not.toHaveAttribute("type");
  });

  it("is a toggle button that reports its pressed state when it has onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>Sweets</Tag>);
    const tag = screen.getByRole("button", { name: "Sweets" });
    expect(tag).toHaveAttribute("type", "button");
    expect(tag).toHaveAttribute("aria-pressed", "false");
    await user.click(tag);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("toggles from the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>Sweets</Tag>);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard(" ");
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("floods pink and reports pressed when selected", () => {
    render(
      <Tag isSelected onClick={noop}>
        All
      </Tag>
    );
    const tag = screen.getByRole("button", { name: "All" });
    expect(tag).toHaveAttribute("aria-pressed", "true");
    expect(tag).toHaveClass("bg-tag-selected", "border-tag-selected", "text-ink-000");
  });

  it("shows a static selected chip without claiming to be pressable", () => {
    render(<Tag isSelected>Hot</Tag>);
    const chip = screen.getByText("Hot").parentElement;
    expect(chip).toHaveClass("bg-tag-selected");
    expect(chip).not.toHaveAttribute("aria-pressed");
  });

  it("tints on hover only when it can be pressed and is not already selected", () => {
    render(
      <>
        <Tag onClick={noop}>All</Tag>
        <Tag onClick={noop} isSelected>
          Hot
        </Tag>
        <Tag>Static</Tag>
      </>
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveClass(
      "hover:bg-pink-50",
      "cursor-pointer"
    );
    expect(screen.getByRole("button", { name: "Hot" })).not.toHaveClass("hover:bg-pink-50");
    expect(screen.getByText("Static").parentElement).not.toHaveClass("hover:bg-pink-50");
    expect(screen.getByText("Static").parentElement).not.toHaveClass("cursor-pointer");
  });

  it("presses with the brand scale and darkens a selected tag on hover, only when pressable (readme §3.8)", () => {
    render(
      <>
        <Tag onClick={noop} isSelected>
          Hot
        </Tag>
        <Tag isSelected>Static</Tag>
      </>
    );
    expect(screen.getByRole("button", { name: "Hot" })).toHaveClass(
      "active:press-scale",
      "hover:bg-tag-selected-hover",
      "hover:border-tag-selected-hover"
    );
    const chip = screen.getByText("Static").parentElement;
    expect(chip).not.toHaveClass("active:press-scale");
    expect(chip).not.toHaveClass("hover:bg-tag-selected-hover");
  });

  it("keeps its glyph decorative, so the label alone names it", () => {
    render(
      <Tag icon={Leaf} onClick={noop}>
        Jain
      </Tag>
    );
    const glyphs = screen.getByRole("button", { name: "Jain" }).querySelectorAll("svg");
    expect(glyphs).toHaveLength(1);
    expect(glyphs[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("lets a consumer className replace its radius", () => {
    render(<Tag className="rounded-md">Sweets</Tag>);
    const chip = screen.getByText("Sweets").parentElement;
    expect(chip).toHaveClass("rounded-md");
    expect(chip).not.toHaveClass("rounded-pill");
  });

  it.each([
    ["default", "bg-ink-000", "border-ink-300", "text-ink-700"],
    ["success", "bg-status-success-soft", "border-status-success", "text-text-success"],
    ["brand", "bg-ink-000", "border-pink-200", "text-pink-700"],
  ] as const)("paints the %s tone with %s, %s and %s", (tone, fill, border, text) => {
    render(<Tag tone={tone}>Sector 57</Tag>);
    expect(screen.getByText("Sector 57").parentElement).toHaveClass(fill, border, text);
  });

  it("is a fixed 38px pill in DM Sans that never wraps — a long label truncates (Review Focus 1)", () => {
    const label = "Under 15 minutes, every weekday lunch";
    render(<Tag onClick={noop}>{label}</Tag>);
    const tag = screen.getByRole("button", { name: label });
    expect(tag).toHaveClass(
      "h-tag-h",
      "rounded-pill",
      "font-body",
      "text-tag",
      "whitespace-nowrap",
      "max-w-full",
      "shrink-0"
    );
    expect(screen.getByText(label)).toHaveClass("min-w-0", "truncate");
  });

  it("draws a 16px leading glyph", () => {
    render(<Tag icon={Clock}>Under 15 min</Tag>);
    expect(screen.getByText("Under 15 min").parentElement?.firstElementChild).toHaveClass(
      "size-icon-sm"
    );
  });

  it("disables a pressable tag natively, with the grey fill", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tag disabled onClick={onClick}>
        Breakfast
      </Tag>
    );
    const tag = screen.getByRole("button", { name: "Breakfast" });
    expect(tag).toBeDisabled();
    expect(tag).toHaveClass("disabled:bg-ink-200", "disabled:text-ink-400");
    expect(tag.className).not.toMatch(/opacity/);
    await user.click(tag);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("marks a disabled static chip with aria-disabled", () => {
    render(<Tag disabled>Breakfast</Tag>);
    const chip = screen.getByText("Breakfast").parentElement;
    expect(chip).toHaveAttribute("aria-disabled", "true");
    expect(chip).toHaveClass("aria-disabled:bg-ink-200");
    expect(chip).not.toHaveAttribute("disabled");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Tag onClick={noop} isSelected icon={Flame}>
          Hot
        </Tag>
        <Tag onClick={noop}>All</Tag>
        <Tag tone="success">Sector 57</Tag>
        <Tag disabled>Breakfast</Tag>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./tag"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/tag/tag.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { Icon, type IconComponent } from "../icon/icon";

export interface TagProps extends ComponentProps<"button"> {
  /** Selected tags flood pink (ink on a pink field). Reported as `aria-pressed` when pressable. */
  isSelected?: boolean;
  /** 16px leading glyph. */
  icon?: IconComponent;
  /** Static colourways (the handoff's delivery-zone chips): default · success · brand. */
  tone?: "default" | "success" | "brand";
}

/**
 * The Tag's classes. Exported for ChipGroup and FilterBar, which render Radix ToggleGroup items
 * that must look like tags: `tagVariants({ isSelected, isInteractive: true }).root()`.
 */
export const tagVariants = componentVariants({
  slots: {
    root: [
      controlStates(),
      "h-tag-h text-tag inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-pill border px-4 font-body whitespace-nowrap",
    ],
    label: "min-w-0 truncate",
  },
  variants: {
    tone: {
      default: { root: "border-ink-300 bg-ink-000 text-ink-700" },
      success: { root: "border-status-success bg-status-success-soft text-text-success" },
      brand: { root: "border-pink-200 bg-ink-000 text-pink-700" },
    },
    // Declared after `tone`, so a selected tag's fill, border and text replace the tone's.
    isSelected: { true: { root: "border-tag-selected bg-tag-selected text-ink-000" } },
    isInteractive: { true: { root: "cursor-pointer active:press-scale" } },
  },
  compoundVariants: [
    { isInteractive: true, isSelected: false, class: { root: "hover:bg-pink-50" } },
    // Readme §3.8: a pink fill darkens one step on hover (ink-800 on a pink field).
    {
      isInteractive: true,
      isSelected: true,
      class: { root: "hover:border-tag-selected-hover hover:bg-tag-selected-hover" },
    },
  ],
  defaultVariants: { tone: "default", isSelected: false, isInteractive: false },
});

/** Selectable filter pill used across menu category rails; a static chip without `onClick`. */
export function Tag({
  isSelected = false,
  icon,
  tone,
  disabled = false,
  onClick,
  type = "button",
  className,
  children,
  ...props
}: TagProps) {
  const isInteractive = onClick !== undefined;
  const slots = tagVariants({ tone, isSelected, isInteractive });
  const Component: ElementType = isInteractive ? "button" : "span";
  const state = isInteractive
    ? { type, onClick, disabled, "aria-pressed": isSelected }
    : { "aria-disabled": disabled || undefined };
  return (
    <Component className={slots.root({ className })} {...state} {...props}>
      {icon ? <Icon icon={icon} size="sm" /> : null}
      <span className={slots.label()}>{children}</span>
    </Component>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`Tag.card.html`): `selectable` (one at a time, stateful, with a `play` that presses a tag), `icon`, `disabled` (plus a disabled selected tag). Extras: `tone` (zone chips), `OnSurfaces`, `LongLabel` (Review Focus 1, `play` measures layout), `CategoryFilterRail` (dev parity).

`packages/ui/src/atoms/tag/tag.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Flame, Leaf } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Tag } from "./tag";

const noop = () => undefined;

function SelectableRow({
  labels = ["All", "Small Plates", "Sweets"],
}: {
  labels?: readonly string[] | undefined;
}) {
  const [value, setValue] = useState("All");
  return (
    <div className="flex flex-wrap items-center gap-3">
      {labels.map((label) => (
        <Tag
          key={label}
          isSelected={value === label}
          onClick={() => {
            setValue(label);
          }}
        >
          {label}
        </Tag>
      ))}
    </div>
  );
}

const meta = {
  title: "Atoms/Tag",
  component: Tag,
  args: { children: "Small Plates", isSelected: false },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Tappable filter pill — menu categories, dietary filters, outlet cities. Sentence/Title Case (not caps — that's `Badge`). Selected = flooded pink; unselected = white with a 1px border. With `onClick` it is a toggle button (`aria-pressed`); without, a static chip. Static `tone` success and brand are the delivery-zone chips. Tags are a fixed 38px and never wrap; a label longer than its row ellipsises.",
      },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Selectable: Story = {
  name: "selectable (onClick + isSelected)",
  render: () => <SelectableRow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sweets = canvas.getByRole("button", { name: "Sweets" });
    await userEvent.click(sweets);
    await expect(sweets).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  },
};

export const WithIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag icon={Leaf}>Jain</Tag>
      <Tag icon={Flame} isSelected>
        Hot
      </Tag>
      <Tag icon={Clock}>Under 15 min</Tag>
    </div>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag disabled onClick={noop}>
        Breakfast
      </Tag>
      <Tag disabled isSelected icon={Leaf} onClick={noop}>
        Jain
      </Tag>
      <Tag>Static, no onClick</Tag>
    </div>
  ),
};

/** In context: the menu category rail, one selection at a time. It wraps rather than clips at 360px. */
export const CategoryFilterRail: Story = {
  name: "in context: category rail at 360px",
  render: () => (
    <div className="w-90">
      <SelectableRow
        labels={["All", "Small Plates", "North Indian", "Momos", "Chinese", "Sweets"]}
      />
    </div>
  ),
};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag tone="success">Sector 57</Tag>
      <Tag tone="success">Sector 56</Tag>
      <Tag tone="brand">Sector 58</Tag>
      <Tag tone="brand">Sector 62</Tag>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Tag onClick={noop} isSelected>
        All
      </Tag>
      <Tag onClick={noop}>Sweets</Tag>
    </OnSurfaces>
  ),
};

export const LongLabel: Story = {
  name: "long label at 360px",
  render: () => (
    <div data-testid="frame" className="flex w-90 flex-wrap gap-2">
      <Tag onClick={noop} icon={Clock}>
        Under 15 minutes, every weekday lunch and dinner
      </Tag>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    const tag = canvas.getByRole("button").getBoundingClientRect();
    await expect(tag.right).toBeLessThanOrEqual(frame.right + 0.5);
    await expect(tag.height).toBe(38);
  },
};
```

- [ ] **Step 7: Export**

```ts
export { Tag, type TagProps, tagVariants } from "./atoms/tag/tag";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/tag packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Tag atom, a toggle pill or a static chip

A pressable tag is a type=button with aria-pressed; without onClick it is a
static chip. Static success and brand tones carry the handoff's delivery-zone
chips. The selected fill turns ink on a pink field so it never vanishes, and
tagVariants is exported for ToggleGroup-based molecules.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

