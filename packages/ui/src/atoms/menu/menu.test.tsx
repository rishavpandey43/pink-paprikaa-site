import { render, screen, within } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { Flag, MapPin, MoreVertical, Phone, Share2 } from "lucide-react";
import { createRef, useState } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { DemoIconTrigger, DemoTrigger } from "../../lib/demo-triggers";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuDivider,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
  SubMenu,
  SubMenuContent,
  SubMenuTrigger,
} from "./menu";

function OutletMenu({ onSelect = vi.fn() }: { onSelect?: () => void }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <DemoIconTrigger icon={MoreVertical} label="More options" />
      </MenuTrigger>
      <MenuContent aria-label="Outlet actions">
        <MenuItem icon={Share2} onSelect={onSelect}>
          Share outlet
        </MenuItem>
        <MenuItem icon={Phone} shortcut="Call">
          Call Sector 57
        </MenuItem>
        <MenuItem icon={MapPin} disabled>
          Directions (opening soon)
        </MenuItem>
        <MenuDivider />
        <MenuItem icon={Flag} color="danger">
          Report a problem
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

const MORE = { name: "More options" };

describe("Menu", () => {
  it("the 3-dot IconButton opens the menu with aria wiring (MUI basic menu)", async () => {
    const user = userEvent.setup();
    render(<OutletMenu />);
    const trigger = screen.getByRole("button", MORE);
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).toBeNull();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: "Outlet actions" })).toBeVisible();
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
  });

  it("selecting an item fires onSelect, closes the menu and returns focus to the trigger (MUI onClose)", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<OutletMenu onSelect={onSelect} />);
    await user.click(screen.getByRole("button", MORE));
    await user.click(screen.getByRole("menuitem", { name: "Share outlet" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("button", MORE)).toHaveFocus();
  });

  it("keyboard: Enter opens on the first item, arrows skip disabled, Home/End, typeahead, Escape closes", async () => {
    const user = userEvent.setup();
    render(<OutletMenu />);
    screen.getByRole("button", MORE).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menuitem", { name: "Share outlet" })).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    // skipped the disabled one
    expect(screen.getByRole("menuitem", { name: "Report a problem" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Share outlet" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Report a problem" })).toHaveFocus();
    await user.keyboard("{Home}c");
    expect(screen.getByRole("menuitem", { name: /Call Sector 57/ })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("button", MORE)).toHaveFocus();
  });

  it("ArrowUp from the first item wraps to the last (loop)", async () => {
    const user = userEvent.setup();
    render(<OutletMenu />);
    screen.getByRole("button", MORE).focus();
    await user.keyboard("{Enter}{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Report a problem" })).toHaveFocus();
  });

  it("clicking outside closes it (MUI backdrop click)", async () => {
    // Radix makes the page behind a modal menu pointer-events: none, which is the point.
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    render(<OutletMenu />);
    await user.click(screen.getByRole("button", MORE));
    expect(screen.getByRole("menu")).toBeVisible();
    await user.click(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("disabled items are aria-disabled and do not fire onSelect", async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Account</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Account">
          <MenuItem disabled onSelect={onSelect}>
            Saved addresses
          </MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Account" }));
    const item = screen.getByRole("menuitem", { name: "Saved addresses" });
    expect(item).toHaveAttribute("aria-disabled", "true");
    await user.click(item);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeVisible();
  });

  it("isSelected marks the row with pink-700 + brand diamond; danger colours the text", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Sort by</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Sort">
          <MenuItem isSelected>Popular</MenuItem>
          <MenuItem>Newest</MenuItem>
          <MenuItem color="danger">Clear</MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Sort by" }));
    const selected = screen.getByRole("menuitem", { name: "Popular" });
    expect(selected).toHaveClass("text-pink-700", "font-semibold");
    expect(selected).not.toHaveClass("bg-surface-brand-soft");
    expect(selected).toHaveAttribute("data-selected");
    expect(selected).toHaveAttribute("aria-current", "true");
    expect(selected.querySelector("[aria-hidden='true']")).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Newest" })).not.toHaveAttribute("data-selected");
    expect(screen.getByRole("menuitem", { name: "Clear" })).toHaveClass("text-text-danger");
  });

  it("hasDivider adds a hairline under the item", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu">
          <MenuItem hasDivider>First</MenuItem>
          <MenuItem>Second</MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("menuitem", { name: "First" })).toHaveClass(
      "border-b",
      "border-border-subtle"
    );
    expect(screen.getByRole("menuitem", { name: "Second" })).not.toHaveClass("border-b");
  });

  it("rows are 44px tap targets; isDense uses 36px rows", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<OutletMenu />);
    await user.click(screen.getByRole("button", MORE));
    expect(screen.getByRole("menuitem", { name: "Share outlet" })).toHaveClass(
      "min-h-hit",
      "px-3",
      "py-2",
      "text-control",
      "rounded-sm",
      "data-highlighted:bg-state-hover",
      "active:bg-state-press"
    );
    unmount();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu" isDense>
          <MenuItem>Dense row</MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const row = screen.getByRole("menuitem", { name: "Dense row" });
    expect(row).toHaveClass("min-h-9", "py-1.5");
    expect(row).not.toHaveClass("min-h-hit");
  });

  it("maxHeight makes a long menu scroll inside (MUI long menu)", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoIconTrigger icon={MoreVertical} label="Dishes" />
        </MenuTrigger>
        <MenuContent aria-label="Dishes" maxHeight="sm">
          {Array.from({ length: 20 }, (_, index) => (
            <MenuItem key={index}>{`Dish ${String(index + 1)}`}</MenuItem>
          ))}
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Dishes" }));
    expect(screen.getByRole("menu")).toHaveClass("max-h-menu-max-sm", "overflow-y-auto");
    expect(screen.getAllByRole("menuitem")).toHaveLength(20);
  });

  it.each([
    ["md", "max-h-menu-max-md"],
    ["lg", "max-h-menu-max-lg"],
  ] as const)("maxHeight %s", (maxHeight, cls) => {
    render(
      <Menu defaultOpen>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu" maxHeight={maxHeight}>
          <MenuItem>One</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(screen.getByRole("menu")).toHaveClass(cls, "overflow-y-auto");
  });

  it("draws the panel from tokens and passes side and align", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu" side="top" align="end" sx={{ mt: 2 }}>
          <MenuItem>One</MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const menu = screen.getByRole("menu");
    expect(menu).toHaveClass(
      "bg-surface-card",
      "border-default",
      "border-border-subtle",
      "rounded-md",
      "shadow-3",
      "z-overlay",
      "mt-2"
    );
    expect(menu.querySelector('[class*="animate-pop-in"]')).not.toBeNull();
    expect(menu).toHaveAttribute("data-side", "top");
    expect(menu).toHaveAttribute("data-align", "end");
  });

  it("portals into the given container", async () => {
    const user = userEvent.setup();
    const frame = document.createElement("div");
    document.body.append(frame);
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu" portalContainer={frame}>
          <MenuItem>One</MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(frame).toContainElement(screen.getByRole("menu"));
    frame.remove();
  });

  it("renders a leading icon, a description and a shortcut in the row", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu">
          <MenuItem icon={Share2} shortcut="⌘P" description="Send a link">
            Share
          </MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const item = screen.getByRole("menuitem");
    expect(item.querySelector("svg")).not.toBeNull();
    expect(within(item).getByText("Send a link")).toHaveClass(
      "text-control-description",
      "text-text-muted"
    );
    expect(within(item).getByText("⌘P")).toHaveClass("ms-auto", "font-mono", "text-caption");
  });

  it("labels group items and dividers are separators", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu">
          <MenuLabel>Signed in</MenuLabel>
          <MenuItem>Profile</MenuItem>
          <MenuDivider />
          <MenuItem>Sign out</MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Signed in")).toBeVisible();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("radio and checkbox items expose menuitemradio/menuitemcheckbox with aria-checked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Options</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Options">
          <MenuCheckboxItem checked onCheckedChange={onCheckedChange}>
            Jain
          </MenuCheckboxItem>
          <MenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Gluten-free
          </MenuCheckboxItem>
          <MenuDivider />
          <MenuRadioGroup value="popular" onValueChange={onValueChange}>
            <MenuRadioItem value="popular">Popular</MenuRadioItem>
            <MenuRadioItem value="newest">Newest</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Options" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "Jain" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("menuitemcheckbox", { name: "Gluten-free" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
    expect(screen.getByRole("menuitemradio", { name: "Popular" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("menuitemradio", { name: "Newest" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
    await user.click(screen.getByRole("menuitemradio", { name: "Newest" }));
    expect(onValueChange).toHaveBeenCalledWith("newest");
    await user.click(screen.getByRole("button", { name: "Options" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Gluten-free" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("a checkbox item can keep the menu open by preventing the select", async () => {
    const user = userEvent.setup();
    function Filters() {
      const [isJain, setIsJain] = useState(false);
      return (
        <Menu>
          <MenuTrigger asChild>
            <DemoTrigger>Diet</DemoTrigger>
          </MenuTrigger>
          <MenuContent aria-label="Diet">
            <MenuCheckboxItem
              checked={isJain}
              onCheckedChange={setIsJain}
              onSelect={(event) => {
                event.preventDefault();
              }}
            >
              Jain
            </MenuCheckboxItem>
          </MenuContent>
        </Menu>
      );
    }
    render(<Filters />);
    await user.click(screen.getByRole("button", { name: "Diet" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Jain" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "Jain" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("a submenu opens with ArrowRight and closes with ArrowLeft", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Outlet</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Outlet">
          <MenuItem>Overview</MenuItem>
          <SubMenu>
            <SubMenuTrigger>Switch outlet</SubMenuTrigger>
            <SubMenuContent aria-label="Outlets">
              <MenuItem>Sector 57</MenuItem>
              <MenuItem>MKM Market</MenuItem>
            </SubMenuContent>
          </SubMenu>
        </MenuContent>
      </Menu>
    );
    screen.getByRole("button", { name: "Outlet" }).focus();
    await user.keyboard("{Enter}{ArrowDown}");
    const trigger = screen.getByRole("menuitem", { name: "Switch outlet" });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger.querySelector("svg")).not.toBeNull();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("menu", { name: "Outlets" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Sector 57" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.queryByRole("menu", { name: "Outlets" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Switch outlet" })).toHaveFocus();
  });

  it("asChild renders a link item", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu">
          <MenuItem asChild icon={MapPin} shortcut="↗">
            <a href="/menu">Full menu</a>
          </MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const link = screen.getByRole("menuitem", { name: /Full menu/ });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/menu");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link).toHaveClass("min-h-hit");
  });

  it("is controlled by open and reports onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Menu open onOpenChange={onOpenChange}>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu">
          <MenuItem>One</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(screen.getByRole("menu")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("menu")).toBeVisible();
  });

  it("calls onClose when the menu closes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Menu defaultOpen onClose={onClose}>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu">
          <MenuItem>One</MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledWith("dismiss");
  });

  it("inline minWidth renders the panel in flow", () => {
    render(
      <Menu defaultOpen>
        <MenuContent aria-label="Menu" inline minWidth={240}>
          <MenuItem>One</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(screen.getByRole("menuitem", { name: "One" })).toBeVisible();
    expect(screen.getByRole("menu")).toHaveStyle({ minWidth: "240px" });
  });

  it("opens on mount with defaultOpen", () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu">
          <MenuItem>One</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(screen.getByRole("menu", { name: "Menu" })).toBeVisible();
  });

  it("an item takes native props, ref and sx", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu">
          <MenuItem ref={ref} data-section="share" sx={{ mt: 2 }}>
            Share
          </MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const item = screen.getByRole("menuitem", { name: "Share" });
    expect(ref.current).toBe(item);
    expect(item).toHaveAttribute("data-section", "share");
    expect(item).toHaveClass("mt-2");
  });

  it("is accessible open", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoIconTrigger icon={MoreVertical} label="More options" />
        </MenuTrigger>
        <MenuContent aria-label="Outlet actions">
          <MenuLabel>Sector 57</MenuLabel>
          <MenuItem icon={Share2} shortcut="⌘P" description="Send a link">
            Share outlet
          </MenuItem>
          <MenuItem icon={MapPin} disabled>
            Directions
          </MenuItem>
          <MenuDivider />
          <MenuCheckboxItem checked onCheckedChange={vi.fn()}>
            Jain
          </MenuCheckboxItem>
          <MenuRadioGroup value="a" onValueChange={vi.fn()}>
            <MenuRadioItem value="a">A</MenuRadioItem>
            <MenuRadioItem value="b">B</MenuRadioItem>
          </MenuRadioGroup>
          <SubMenu>
            <SubMenuTrigger>More</SubMenuTrigger>
            <SubMenuContent aria-label="More">
              <MenuItem>Deep</MenuItem>
            </SubMenuContent>
          </SubMenu>
          <MenuItem icon={Flag} color="danger">
            Report a problem
          </MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", MORE));
    // Radix hides the rest of the page (aria-hidden) while the modal menu has focus.
    await expectNoA11yViolations(screen.getByRole("menu"));
  });

  it("Tab closes the menu so focus can leave (Review Focus 4)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <OutletMenu />
        <button type="button">After menu</button>
      </>
    );
    await user.click(screen.getByRole("button", MORE));
    expect(screen.getByRole("menu")).toBeVisible();
    await user.tab();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("sheet=true renders a bottom sheet with handle, title and 52px rows", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <DemoTrigger>Spice</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Spice" sheet title="How spicy?">
          <MenuItem>Mild</MenuItem>
          <MenuItem>Hot</MenuItem>
        </MenuContent>
      </Menu>
    );
    await user.click(screen.getByRole("button", { name: "Spice" }));
    expect(screen.getByText("How spicy?")).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Mild" })).toHaveClass("min-h-13");
    expect(document.querySelector('[class*="animate-sheet-in"]')).not.toBeNull();
    expect(document.querySelector(".h-1.w-10.rounded-pill")).not.toBeNull();
  });

  it("danger rows use danger-soft hover and state-press-danger", () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger asChild>
          <DemoTrigger>Open</DemoTrigger>
        </MenuTrigger>
        <MenuContent aria-label="Menu">
          <MenuItem color="danger">Cancel order</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(screen.getByRole("menuitem", { name: "Cancel order" })).toHaveClass(
      "data-highlighted:bg-status-danger-soft",
      "active:bg-state-press-danger"
    );
  });
});
