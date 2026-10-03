import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { POST_FORMATS, PostFrame, SocialHeadline } from "@pink-paprikaa-web/ui";

import { cssValue, formatValue, token } from "../../docs-kit/catalogue";
import { TokenTable } from "../../docs-kit/token-table";

/** Live visuals for the Marketing pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Marketing/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Preview scale for the format outlines — the card draws a 1080px side at about 79px. */
const PREVIEW_SCALE = 0.073;

const CANVAS_STEPS = [
  ["overline", "Overline"],
  ["hero", "Hero"],
  ["h1", "Canvas h1"],
  ["h2", "Canvas h2"],
  ["body", "Canvas body — ingredient-led, under 14 words."],
  ["caption", "Caption"],
] as const;

export const CanvasFormats: Story = {
  render: () => (
    <ul role="list" aria-label="Canvas formats" className="flex flex-wrap items-end gap-3.5">
      {Object.entries(POST_FORMATS).map(([format, { width, height, label }]) => (
        <li key={format} className="flex flex-col gap-1">
          <span
            aria-hidden
            className="rounded-xs bg-pink-500"
            style={{
              width: `${String(width * PREVIEW_SCALE)}px`,
              height: `${String(height * PREVIEW_SCALE)}px`,
            }}
          />
          <span className="font-mono text-mono text-text-heading">
            {format} · {label}
          </span>
          <span className="font-mono text-mono text-text-muted">
            {width}×{height}
          </span>
        </li>
      ))}
    </ul>
  ),
  play: async () => {
    for (const [format, { width, height }] of Object.entries(POST_FORMATS)) {
      await expect(`${String(width)}px`).toBe(cssValue(`canvas-${format}-w`));
      await expect(`${String(height)}px`).toBe(cssValue(`canvas-${format}-h`));
    }
  },
};

export const CanvasTokens: Story = {
  render: () => (
    <TokenTable
      caption="Canvas sizes, safe margins and story chrome"
      selection={{ prefix: "canvas-" }}
    />
  ),
};

export const CanvasType: Story = {
  render: () => (
    <div className="w-full max-w-150">
      <PostFrame format="post" surface="page" isFit>
        <div className="flex flex-col gap-6">
          {CANVAS_STEPS.map(([size, sample]) => (
            <SocialHeadline key={size} size={size} as="p">
              {sample} · {formatValue(token(`text-canvas-${size}`).value)}
            </SocialHeadline>
          ))}
        </div>
      </PostFrame>
    </div>
  ),
};

export const CanvasTypeTokens: Story = {
  render: () => <TokenTable caption="Canvas type scale" selection={{ prefix: "text-canvas-" }} />,
};
