### Task 9: ActionDock

**Dev reference:** none (handoff component)

**Files:**

- Create: `packages/design-tokens/tokens/component/action-dock.json`
- Create: `packages/ui/src/organisms/action-dock/action-dock.tsx`, `action-dock.test.tsx`, `action-dock.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Button` / `IconButton` (`asChild`), `IconComponent`, `componentVariants`; test and stories: `SiteFooter` (Task 8).
- Produces: `ActionDock`, `ActionDockProps`, `DockAction`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/action-dock.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "action-dock-bottom": {
      "$value": "calc(10px + env(safe-area-inset-bottom, 0px))",
      "$description": "Mobile bar bottom padding: 10px plus the iOS home-indicator inset (handoff). Needs viewport-fit=cover in the app's viewport meta."
    },
    "action-dock-float": {
      "$value": "calc(24px + env(safe-area-inset-bottom, 0px))",
      "$description": "The floating pill's offset from the viewport bottom at md and up."
    }
  }
}
```

Append to `SPACING`:

```ts
  "action-dock-bottom",
  "action-dock-float",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/action-dock/action-dock.test.tsx`:

```tsx
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { MessageCircle, Phone } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SiteFooter } from "../site-footer/site-footer";
import { ActionDock, type DockAction } from "./action-dock";

// R15: a path from import.meta.dirname — Vite rewrites `new URL(…, import.meta.url)` under jsdom.
const theme = readFileSync(
  join(import.meta.dirname, "../../../../design-tokens/dist/theme.css"),
  "utf8"
);

const PRIMARY: DockAction = {
  label: "WhatsApp us",
  href: "https://wa.me/919090704001",
  icon: MessageCircle,
};
const SECONDARY: DockAction = { label: "Call", href: "tel:+919090704001", icon: Phone };

const dockOf = (link: HTMLElement) => link.closest('[data-surface="light"]');

describe("ActionDock", () => {
  it("offers the primary action as a labelled link", () => {
    render(<ActionDock primary={PRIMARY} secondary={SECONDARY} />);
    expect(screen.getByRole("link", { name: "WhatsApp us" })).toHaveAttribute("href", PRIMARY.href);
  });

  it("offers the secondary action as an icon link on phones only", () => {
    render(<ActionDock primary={PRIMARY} secondary={SECONDARY} />);
    const call = screen.getByRole("link", { name: "Call" });
    expect(call).toHaveAttribute("href", SECONDARY.href);
    expect(call).toHaveClass("md:hidden");
  });

  it("renders only the primary action when there is no secondary", () => {
    render(<ActionDock primary={PRIMARY} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("pins to the viewport bottom on the dock layer, above the header and below overlays", () => {
    render(<ActionDock primary={PRIMARY} />);
    const dock = dockOf(screen.getByRole("link", { name: "WhatsApp us" }));
    expect(dock).toHaveClass("fixed", "bottom-0", "z-dock");
    expect(dock).toHaveClass("md:right-6", "md:inset-x-auto");
  });

  it("pads for the iOS home indicator on phones and floats clear of it from md", () => {
    render(<ActionDock primary={PRIMARY} />);
    const dock = dockOf(screen.getByRole("link", { name: "WhatsApp us" }));
    expect(dock).toHaveClass("pb-action-dock-bottom", "md:bottom-action-dock-float");
    expect(theme).toContain(
      "--spacing-action-dock-bottom: calc(10px + env(safe-area-inset-bottom, 0px));"
    );
    expect(theme).toContain(
      "--spacing-action-dock-float: calc(24px + env(safe-area-inset-bottom, 0px));"
    );
  });

  it("never covers the footer's last links: the footer pads clear of the dock", () => {
    render(
      <>
        <SiteFooter
          columns={[
            { heading: "Eat with us", items: [{ label: "Homely Meals", href: "#homely" }] },
          ]}
          policies={[{ label: "Privacy Policy", href: "#privacy" }]}
          hasDockClearance
        />
        <ActionDock primary={PRIMARY} secondary={SECONDARY} />
      </>
    );
    expect(screen.getByRole("contentinfo")).toHaveClass("pb-site-footer-dock-clearance");
    // 110px + inset clears the tallest dock: phone bar 10 + 48 + 10 (+ inset), desktop pill 24 + 54 (+ inset).
    expect(theme).toContain(
      "--spacing-site-footer-dock-clearance: calc(110px + env(safe-area-inset-bottom, 0px));"
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ActionDock primary={PRIMARY} secondary={SECONDARY} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- action-dock 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./action-dock`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/action-dock/action-dock.tsx`:

```tsx
import type { ComponentProps } from "react";

import type { IconComponent } from "../../atoms/icon/icon";

import { Button } from "../../atoms/button/button";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants } from "../../lib/component-variants";

export interface DockAction {
  label: string;
  /** A `https://wa.me/…` or `tel:` link — the app builds it. */
  href: string;
  icon: IconComponent;
}

const actionDock = componentVariants({
  slots: {
    root: "pb-action-dock-bottom md:bottom-action-dock-float fixed inset-x-0 bottom-0 z-dock flex gap-2 border-t border-border-subtle bg-surface-card px-3 pt-2.5 shadow-4 md:inset-x-auto md:right-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none",
    secondary: "md:hidden",
    primary: "min-w-0 flex-1 shadow-brand md:flex-none",
  },
});

export interface ActionDockProps extends ComponentProps<"div"> {
  primary: DockAction;
  /** Phones only, as an icon beside the primary pill (the handoff's Call). */
  secondary?: DockAction | undefined;
}

/**
 * The page's always-there action. Below md: a white bar fixed to the bottom with the secondary
 * icon and the primary pill, padded for the iOS home indicator. From md: the primary pill alone,
 * floating bottom-right. Pair it with `SiteFooter hasDockClearance` so it never covers the footer.
 */
export function ActionDock({ primary, secondary, className, ...props }: ActionDockProps) {
  const slots = actionDock();
  return (
    <div data-surface="light" className={slots.root({ className })} {...props}>
      {secondary ? (
        <IconButton
          asChild
          icon={secondary.icon}
          label={secondary.label}
          variant="secondary"
          size="lg"
          className={slots.secondary()}
        >
          <a href={secondary.href} aria-label={secondary.label} />
        </IconButton>
      ) : null}
      <Button asChild size="lg" icon={primary.icon} className={slots.primary()}>
        <a href={primary.href}>{primary.label}</a>
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- action-dock 2>&1 | tail -8`
Expected: PASS (7 tests).

- [ ] **Step 6: Stories (handoff PPFooter's mobile bar and desktop pill)**

Each story renders in its own iframe (the dock is `position: fixed`; inline docs would stack every dock at the bottom of one page).

`packages/ui/src/organisms/action-dock/action-dock.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Phone } from "lucide-react";

import { SiteFooter } from "../site-footer/site-footer";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { ActionDock } from "./action-dock";

const meta = {
  title: "Organisms/ActionDock",
  component: ActionDock,
  args: {
    primary: { label: "WhatsApp us", href: BRAND.whatsappHref, icon: MessageCircle },
    secondary: { label: "Call", href: BRAND.phoneHref, icon: Phone },
  },
  decorators: [
    (Story) => (
      <>
        <div className="container-page h-200 py-10">
          <div className="h-full rounded-lg bg-surface-page-alt" />
        </div>
        <SiteFooter
          tone="ink"
          hasDockClearance
          columns={[
            {
              heading: "Eat with us",
              items: [
                { label: "Homely Meals", href: "#homely-meals" },
                { label: "Catering & Bulk Orders", href: "#catering" },
              ],
            },
          ]}
          legal={<span>{BRAND.copyright}</span>}
          policies={[
            { label: "Privacy Policy", href: "#privacy" },
            { label: "Refund & Cancellation", href: "#refunds" },
          ]}
        />
        <Story />
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      description: {
        component:
          "The handoff's always-there WhatsApp action. Below md: a white bar fixed to the bottom — Call icon + WhatsApp pill — padded for the iOS home indicator. From md: the WhatsApp pill alone, floating bottom-right. Scroll to the bottom: with `SiteFooter hasDockClearance` the dock never covers the legal links.",
      },
    },
  },
} satisfies Meta<typeof ActionDock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Handoff mobile bar. */
export const Mobile: Story = { globals: VIEWPORT_360 };

export const Tablet: Story = { globals: VIEWPORT_768 };

/** Handoff desktop floating pill. */
export const Desktop: Story = { globals: VIEWPORT_1280 };

export const PrimaryOnly: Story = { args: { secondary: undefined }, globals: VIEWPORT_360 };
```

- [ ] **Step 7: Export**

```ts
export {
  ActionDock,
  type ActionDockProps,
  type DockAction,
} from "./organisms/action-dock/action-dock";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/action-dock packages/design-tokens/tokens/component/action-dock.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/action-dock.json packages/ui/src/organisms/action-dock packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): ActionDock organism

The handoff's fixed WhatsApp action as one element restyled by CSS: a white
bottom bar with the call icon on phones, a floating pill from md. Both
offsets include the iOS safe-area inset, and the test pins that
SiteFooter's dock clearance keeps the legal links uncovered.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

