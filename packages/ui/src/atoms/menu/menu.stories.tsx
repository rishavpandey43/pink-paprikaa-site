import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Download,
  Flag,
  LogOut,
  MapPin,
  MoreVertical,
  Phone,
  Printer,
  Share2,
  User,
} from "lucide-react";
import { useState } from "react";
import { expect, fn, screen, waitFor } from "storybook/test";

import { DemoIconTrigger, DemoTrigger } from "../../lib/demo-triggers";
import { OnSurfaces } from "../../lib/story-surfaces";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuDivider,
  MenuItem,
  MenuLabel,
  MenuPanel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
  SubMenu,
  SubMenuContent,
  SubMenuTrigger,
} from "./menu";

const meta = {
  title: "Atoms/Menu",
  component: Menu,
  parameters: {
    // Radix hides the page behind an open modal menu while focus is inside it; `aria-hidden-focus`
    // misreads that. A story's `rules` replace the preview's list, so `color-contrast` (owned by the
    // token contrast policy) is switched off again here.
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: false },
          { id: "aria-hidden-focus", enabled: false },
        ],
      },
    },
    docs: {
      story: { inline: false, height: "360px" },
      description: {
        component:
          "MUI's Menu and MenuItem, on Radix DropdownMenu. The trigger is a part (`MenuTrigger`) — the 3-dot `IconButton` or a `Button` — which wires `aria-haspopup` / `aria-expanded`, returns focus on close and gives roving focus, typeahead and Home/End for free. Items close the menu after a select, as MUI does. `isDense` is MUI's `dense` (36px rows over 44px), `isSelected` its `selected`, `hasDivider` its `divider`, `maxHeight` its long menu, and `asChild` its `component={Link}`.",
      },
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const VEG_DISHES = Array.from({ length: 20 }, (_, index) => `Veg dish ${String(index + 1)}`);

/** Pointer: open, choose Share, focus returns to the 3-dot button. */
export const ThreeDotMenu: Story = {
  args: { children: null },
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <DemoIconTrigger icon={MoreVertical} label="More options" />
      </MenuTrigger>
      <MenuContent aria-label="Outlet actions" align="start">
        <MenuItem icon={Share2}>Share outlet</MenuItem>
        <MenuItem icon={Phone}>Call Sector 57</MenuItem>
        <MenuItem icon={MapPin} disabled>
          Directions (opening soon)
        </MenuItem>
        <MenuDivider />
        <MenuItem icon={Flag} color="danger">
          Report a problem
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "More options" });
    await userEvent.click(trigger);
    await expect(await screen.findByRole("menu", { name: "Outlet actions" })).toBeVisible();
    await userEvent.click(screen.getByRole("menuitem", { name: "Share outlet" }));
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const BasicMenu: Story = {
  args: { children: null },
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <DemoTrigger>Account</DemoTrigger>
      </MenuTrigger>
      <MenuContent aria-label="Account" align="start">
        <MenuItem>My orders</MenuItem>
        <MenuItem>Saved addresses</MenuItem>
        <MenuItem>Sign out</MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Account" }));
    await expect(await screen.findAllByRole("menuitem")).toHaveLength(3);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Account" })).toHaveFocus();
  },
};

export const IconMenu: Story = {
  args: { children: null },
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <DemoTrigger>Menu card</DemoTrigger>
      </MenuTrigger>
      <MenuContent aria-label="Menu card" align="start">
        <MenuItem icon={Download} shortcut="⌘S">
          Download PDF
        </MenuItem>
        <MenuItem icon={Printer} shortcut="⌘P" description="A4, black and white">
          Print
        </MenuItem>
        <MenuItem icon={Share2}>Share</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const DenseMenu: Story = {
  args: { children: null },
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <DemoTrigger>Dense</DemoTrigger>
      </MenuTrigger>
      <MenuContent aria-label="Dense" align="start" isDense>
        <MenuItem>My orders</MenuItem>
        <MenuItem>Saved addresses</MenuItem>
        <MenuItem>Sign out</MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dense" }));
    const rows = await screen.findAllByRole("menuitem");
    for (const row of rows) await expect(row.getBoundingClientRect().height).toBeLessThan(44);
  },
};

export const SelectedMenu: Story = {
  args: { children: null },
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <DemoTrigger>Sort by</DemoTrigger>
      </MenuTrigger>
      <MenuContent aria-label="Sort by" align="start">
        <MenuItem isSelected>Popular</MenuItem>
        <MenuItem>Price: low to high</MenuItem>
        <MenuItem hasDivider>Newest</MenuItem>
        <MenuItem>Rating</MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sort by" }));
    await expect(await screen.findByRole("menuitem", { name: "Popular" })).toHaveAttribute(
      "data-selected"
    );
  },
};

/** MUI's anchorOrigin / transformOrigin: top-end and bottom-start. */
export const PositionedMenu: Story = {
  args: { children: null },
  render: () => (
    <div className="flex gap-6 pt-40">
      {(
        [
          ["top", "end"],
          ["bottom", "start"],
        ] as const
      ).map(([side, align]) => (
        <Menu key={`${side}-${align}`}>
          <MenuTrigger asChild>
            <DemoTrigger>{`${side}-${align}`}</DemoTrigger>
          </MenuTrigger>
          <MenuContent aria-label={`${side}-${align}`} side={side} align={align}>
            <MenuItem>Profile</MenuItem>
            <MenuItem>My account</MenuItem>
            <MenuItem>Logout</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "top-end" }));
    await expect(await screen.findByRole("menu", { name: "top-end" })).toHaveAttribute(
      "data-side",
      "top"
    );
  },
};

/** MUI's long menu: 20 dishes scroll inside the panel. */
export const LongMenu: Story = {
  args: { children: null },
  parameters: {
    // The scroll region is reached with the arrow keys (roving focus scrolls the focused row into
    // view), not Tab, so axe's "scrollable region must be focusable" heuristic does not apply.
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: false },
          { id: "aria-hidden-focus", enabled: false },
          { id: "scrollable-region-focusable", enabled: false },
        ],
      },
    },
  },
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <DemoIconTrigger icon={MoreVertical} label="Dishes" />
      </MenuTrigger>
      <MenuContent aria-label="Dishes" align="start" maxHeight="sm">
        {VEG_DISHES.map((dish) => (
          <MenuItem key={dish}>{dish}</MenuItem>
        ))}
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dishes" }));
    const menu = await screen.findByRole("menu", { name: "Dishes" });
    await expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
  },
};

export const AccountMenu: Story = {
  args: { children: null },
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <button type="button" aria-label="Account" className="inline-flex rounded-pill">
          <span
            className="inline-grid size-avatar-md place-items-center rounded-pill bg-pink-100 font-display text-avatar-md text-pink-700"
            aria-hidden
          >
            AR
          </span>
        </button>
      </MenuTrigger>
      <MenuContent aria-label="Account" align="start">
        <MenuLabel>Signed in as Asha Rao</MenuLabel>
        <MenuItem icon={User}>Profile</MenuItem>
        <MenuItem icon={MapPin}>Saved addresses</MenuItem>
        <MenuDivider />
        <MenuItem icon={LogOut} color="danger">
          Sign out
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Account" }));
    await expect(await screen.findByRole("menuitem", { name: "Sign out" })).toHaveClass(
      "text-text-danger"
    );
  },
};

function RadioMenuDemo() {
  const [sort, setSort] = useState("popular");
  return (
    <Menu>
      <MenuTrigger asChild>
        <DemoTrigger>{`Sort: ${sort}`}</DemoTrigger>
      </MenuTrigger>
      <MenuContent aria-label="Sort" align="start">
        <MenuLabel>Sort</MenuLabel>
        <MenuRadioGroup value={sort} onValueChange={setSort}>
          <MenuRadioItem value="popular">Popular</MenuRadioItem>
          <MenuRadioItem value="price">Price low to high</MenuRadioItem>
          <MenuRadioItem value="newest">Newest</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

export const RadioMenu: Story = {
  args: { children: null },
  render: () => <RadioMenuDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sort: popular" }));
    await userEvent.click(await screen.findByRole("menuitemradio", { name: "Newest" }));
    await expect(canvas.getByRole("button", { name: "Sort: newest" })).toBeVisible();
  },
};

function CheckboxMenuDemo({ onChange }: { onChange: (diets: string[]) => void }) {
  const [diets, setDiets] = useState<string[]>(["Jain"]);
  const toggle = (diet: string) => (checked: boolean) => {
    const next = checked ? [...diets, diet] : diets.filter((d) => d !== diet);
    setDiets(next);
    onChange(next);
  };
  return (
    <Menu>
      <MenuTrigger asChild>
        <DemoTrigger>Diet</DemoTrigger>
      </MenuTrigger>
      <MenuContent aria-label="Diet" align="start">
        {["Jain", "No onion-garlic", "Gluten-free"].map((diet) => (
          <MenuCheckboxItem
            key={diet}
            checked={diets.includes(diet)}
            onCheckedChange={toggle(diet)}
            onSelect={(event) => {
              event.preventDefault();
            }}
          >
            {diet}
          </MenuCheckboxItem>
        ))}
      </MenuContent>
    </Menu>
  );
}

/** The menu stays open while ticking several (`onSelect` prevents the close). */
export const CheckboxMenu: Story = {
  args: { children: null },
  render: () => <CheckboxMenuDemo onChange={fn()} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Diet" }));
    await userEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Gluten-free" }));
    await expect(screen.getByRole("menuitemcheckbox", { name: "Gluten-free" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await expect(screen.getByRole("menu")).toBeVisible();
  },
};

export const NestedMenu: Story = {
  args: { children: null },
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <DemoTrigger>Outlet</DemoTrigger>
      </MenuTrigger>
      <MenuContent aria-label="Outlet" align="start">
        <MenuItem>Opening hours</MenuItem>
        <SubMenu>
          <SubMenuTrigger icon={MapPin}>Switch outlet</SubMenuTrigger>
          <SubMenuContent aria-label="Outlets">
            <MenuItem>Sector 57</MenuItem>
            <MenuItem>MKM Market</MenuItem>
          </SubMenuContent>
        </SubMenu>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("button", { name: "Outlet" }).focus();
    await userEvent.keyboard("{Enter}{ArrowDown}{ArrowRight}");
    await expect(await screen.findByRole("menu", { name: "Outlets" })).toBeVisible();
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(screen.queryByRole("menu", { name: "Outlets" })).toBeNull());
  },
};

export const OnSurfaces_: Story = {
  name: "OnSurfaces",
  args: { children: null },
  parameters: { docs: { story: { inline: false, height: "520px" } } },
  render: () => (
    <OnSurfaces>
      <Menu>
        <MenuTrigger asChild>
          <DemoIconTrigger icon={MoreVertical} label="More options" />
        </MenuTrigger>
        <MenuContent aria-label="Actions" align="start">
          <MenuItem icon={Share2}>Share</MenuItem>
          <MenuItem icon={Flag} color="danger">
            Report
          </MenuItem>
        </MenuContent>
      </Menu>
    </OnSurfaces>
  ),
};

/** The 3-dot menu at the right edge of a phone stays inside the viewport. */
export const Mobile360: Story = {
  args: { children: null },
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <div className="flex justify-end">
      <Menu>
        <MenuTrigger asChild>
          <DemoIconTrigger icon={MoreVertical} label="More options" />
        </MenuTrigger>
        <MenuContent aria-label="Outlet actions" align="end" sheet={false}>
          <MenuItem icon={Share2} shortcut="Share">
            Share outlet
          </MenuItem>
          <MenuItem icon={Phone}>Call Sector 57</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "More options" }));
    const rect = (await screen.findByRole("menu")).getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
  },
};

const HEAT = [
  { value: "mild", label: "Mild" },
  { value: "medium", label: "Medium" },
  { value: "hot", label: "Hot" },
  { value: "xhot", label: "Extra Hot", disabled: true, description: "Ask at the counter" },
];

/** Card row: listbox — chosen row + disabled. */
export const Listbox: Story = {
  args: { children: null },
  render: function ListboxStory() {
    const [value, setValue] = useState("medium");
    return (
      <MenuPanel
        role="listbox"
        aria-label="How spicy?"
        items={HEAT}
        value={value}
        onSelect={(item) => {
          setValue(item.value);
        }}
      />
    );
  },
  play: async () => {
    await expect(screen.getByRole("option", { name: "Medium" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(screen.getByRole("option", { name: /Extra Hot/ })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  },
};

/** Card row: groups + meta. */
export const GroupsAndMeta: Story = {
  args: { children: null },
  render: function GroupsStory() {
    const [value, setValue] = useState("cp");
    return (
      <MenuPanel
        role="listbox"
        aria-label="Dishes"
        value={value}
        onSelect={(item) => {
          setValue(item.value);
        }}
        items={[
          { group: "Mains" },
          { value: "cp", label: "Chilli Paneer", meta: "₹280" },
          { value: "hn", label: "Hakka Noodles", meta: "₹220" },
          { group: "Drinks" },
          { value: "ch", label: "Masala Chai", meta: "₹60" },
        ]}
      />
    );
  },
  play: async () => {
    await expect(screen.getByText("Mains")).toHaveClass("font-mono");
    await expect(screen.getByText("₹280")).toBeVisible();
  },
};

/** Card row: empty. */
export const Empty: Story = {
  args: { children: null },
  render: () => (
    <MenuPanel
      role="listbox"
      aria-label="Matches"
      items={[]}
      emptyText="No matches. Try a shorter word."
    />
  ),
  play: async () => {
    await expect(screen.getByText("No matches. Try a shorter word.")).toBeVisible();
  },
};

/** ≤640 sheet: handle, title, 52px rows. */
export const Sheet360: Story = {
  args: { children: null },
  globals: { viewport: { value: "floor360", isRotated: false } },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: false },
          { id: "aria-hidden-focus", enabled: false },
          { id: "scrollable-region-focusable", enabled: false },
        ],
      },
    },
  },
  render: () => (
    <Menu defaultOpen>
      <MenuTrigger asChild>
        <DemoTrigger>Spice</DemoTrigger>
      </MenuTrigger>
      <MenuContent aria-label="Spice" sheet title="How spicy?">
        <MenuItem>Mild</MenuItem>
        <MenuItem isSelected>Medium</MenuItem>
        <MenuItem>Hot</MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async () => {
    // Sheet enter keyframe starts at opacity 0 — wait for it to land.
    await waitFor(() => expect(screen.getByText("How spicy?")).toBeVisible());
    await expect(screen.getByRole("menuitem", { name: "Mild" })).toHaveClass("min-h-13");
    await expect(document.querySelector('[class*="animate-sheet-in"]')).not.toBeNull();
  },
};

/** At 641px the panel stays floating (not a sheet). */
export const Floating641: Story = {
  args: { children: null },
  parameters: { viewport: { width: 641, height: 800 } },
  render: () => (
    <Menu defaultOpen>
      <MenuTrigger asChild>
        <DemoTrigger>Open</DemoTrigger>
      </MenuTrigger>
      <MenuContent aria-label="Menu" sheet={false}>
        <MenuItem>One</MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async () => {
    await expect(await screen.findByRole("menu", { name: "Menu" })).toBeVisible();
    await expect(document.querySelector("[class*=animate-pop-in]")).not.toBeNull();
    await expect(document.querySelector(".animate-sheet-in")).toBeNull();
  },
};
