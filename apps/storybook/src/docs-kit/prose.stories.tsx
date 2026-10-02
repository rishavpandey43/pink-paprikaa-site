import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, waitFor, within } from "storybook/test";

import { ProseTable } from "./prose";

/** Contract tests for the docs prose overrides. Hidden from the sidebar; run by storybook:test. */
const meta = {
  title: "Introduction/Docs prose",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A markdown table at 360px (the Introduction page's layer table): it scrolls inside its own named
 * region, so the page never scrolls sideways. The inline-code half of the docs-prose fix is a rule
 * on Storybook's own docs class (`.storybook/styles.css`), so it is probed on the docs pages, not
 * here.
 */
export const ProseTableScrollsAt360: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <ProseTable>
      <thead>
        <tr>
          <th>Layer</th>
          <th>What lives there</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>@pink-paprikaa-web/design-tokens</code>
          </td>
          {/* A column that cannot narrow, as a GFM table's often cannot. */}
          <td className="whitespace-nowrap">
            Every value, authored as DTCG JSON and compiled by Style Dictionary
          </td>
        </tr>
      </tbody>
    </ProseTable>
  ),
  play: async ({ canvas }) => {
    const region = await canvas.findByRole("region", { name: "Scrollable table" });
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    const page = document.documentElement;
    await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
  },
};

/** Prose for a table that cannot narrow at 360px, so it scrolls. */
function WideRows() {
  return (
    <tbody>
      <tr>
        <td>
          <code>@pink-paprikaa-web/design-tokens</code>
        </td>
        <td className="whitespace-nowrap">
          Every value, authored as DTCG JSON and compiled by Style Dictionary
        </td>
      </tr>
    </tbody>
  );
}

/**
 * Each scrolling table is named apart: by its caption, else the nearest heading above it, with
 * "table 2" when a heading heads two (axe landmark-unique).
 */
export const ProseTablesNamedApart: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <div>
      <h2>Layers</h2>
      <ProseTable>
        <WideRows />
      </ProseTable>
      <ProseTable>
        <caption>Build outputs</caption>
        <WideRows />
      </ProseTable>
      <h2>Packages</h2>
      <ProseTable>
        <WideRows />
      </ProseTable>
      <ProseTable>
        <WideRows />
      </ProseTable>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("region", { name: "Layers" })).toBeInTheDocument();
    await expect(canvas.getByRole("region", { name: "Build outputs" })).toBeInTheDocument();
    await expect(canvas.getByRole("region", { name: "Packages" })).toBeInTheDocument();
    await expect(canvas.getByRole("region", { name: "Packages table 2" })).toBeInTheDocument();
    const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
    await expect(new Set(ids).size).toBe(ids.length);
  },
};

/** The names of the page's scrolling-table regions, in document order (labelledby, else label). */
function regionNames(canvasElement: HTMLElement) {
  return within(canvasElement)
    .queryAllByRole("region")
    .map((region) => {
      const ids = region.getAttribute("aria-labelledby")?.split(" ") ?? [];
      return ids.length === 0
        ? region.getAttribute("aria-label")
        : ids.map((id) => document.getElementById(id)?.textContent.trim()).join(" ");
    });
}

/**
 * Two different headings with the same words (rehype-slug ids `examples`, `examples-1`) still
 * name their tables apart, and a table that starts scrolling later (a resize) renumbers the
 * others instead of repeating a name.
 */
export const ProseTableNamesStayUnique: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <div>
      <h2 id="examples">Examples</h2>
      <ProseTable>
        <WideRows />
      </ProseTable>
      <h2 id="examples-1">Examples</h2>
      <ProseTable>
        <WideRows />
      </ProseTable>
      <h2>Packages</h2>
      <ProseTable data-testid="fits-at-first">
        <tbody>
          <tr>
            <td>Fits</td>
          </tr>
        </tbody>
      </ProseTable>
      <ProseTable>
        <WideRows />
      </ProseTable>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole("region", { name: "Packages" });
    await expect(regionNames(canvasElement)).toEqual(["Examples", "Examples table 2", "Packages"]);
    // The first Packages table widens past the page and starts scrolling: it takes the bare name,
    // and the one after it becomes "table 2".
    canvas.getByTestId("fits-at-first").style.width = "600px";
    await waitFor(async () => {
      await expect(regionNames(canvasElement)).toEqual([
        "Examples",
        "Examples table 2",
        "Packages",
        "Packages table 2",
      ]);
    });
  },
};

/** A markdown table that fits is a plain table: no region, no extra tab stop. */
export const ProseTableThatFitsAddsNoTabStop: Story = {
  render: () => (
    <ProseTable>
      <tbody>
        <tr>
          <td>Fits</td>
        </tr>
      </tbody>
    </ProseTable>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("table")).toBeInTheDocument();
    await expect(canvas.queryByRole("region")).not.toBeInTheDocument();
    await expect(canvas.getByRole("table").parentElement).not.toHaveAttribute("tabindex");
  },
};
