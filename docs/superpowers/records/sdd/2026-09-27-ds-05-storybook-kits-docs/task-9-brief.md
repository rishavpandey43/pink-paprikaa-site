### Task 9: The Marketing foundations, and the 33-card mapping check

Sources: `guidelines/{canvas-formats,canvas-type}.card.html`, readme §4b.

**Files:**

- Create: `apps/storybook/src/foundations/marketing/{marketing.stories.tsx,canvas-formats.mdx,canvas-type.mdx}`

**Dev reference:** none (dev has no Marketing foundations — `git ls-tree -r --name-only dev packages/ui/src/docs` lists five pages, none on canvases)

**Interfaces:**

- Consumes: `TokenTable`, `cssValue`, `formatValue`, `token` (docs-kit); `POST_FORMATS`, `PostFrame`, `SocialHeadline` (ui).
- Produces: `Marketing/Specimens` → `CanvasFormats`, `CanvasTokens`, `CanvasType`, `CanvasTypeTokens`; pages `Marketing/Canvas formats`, `Marketing/Canvas type`.

- [ ] **Step 1: The Marketing specimens**

Create `apps/storybook/src/foundations/marketing/marketing.stories.tsx`:

```tsx
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
    <ul aria-label="Canvas formats" className="flex flex-wrap items-end gap-3.5">
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
    // PostFrame's formats are derived from the canvas tokens — prove they have not drifted.
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
      <PostFrame format="post" tone="light" isFit>
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
```

- [ ] **Step 2: The Marketing pages**

Create `apps/storybook/src/foundations/marketing/canvas-formats.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./marketing.stories";

<Meta title="Marketing/Canvas formats" />

{/* source: guidelines/canvas-formats.card.html */}

# Canvas formats

The only seven artboard sizes, shown to scale. The brand ships far more artwork than product UI,
so canvases are tokens. Never invent a size outside this list — add a canvas token instead.

<Canvas of={Specimens.CanvasFormats} meta={Specimens} sourceState="none" />

| Format        | Use                                            |
| ------------- | ---------------------------------------------- |
| `post`        | Instagram feed 1:1, carousel slides            |
| `portrait`    | Feed 4:5 — the loudest, default for statements |
| `story`       | Stories, Reels covers                          |
| `landscape`   | Link previews, OG images, email headers        |
| `wide`        | In-store screens, menu boards                  |
| `leaderboard` | Display ad                                     |
| `mpu`         | Display ad                                     |

- **Build every asset inside `PostFrame`** — it pins the true pixel canvas and scales for preview,
  so nothing is designed at an arbitrary size.
- **Safe margins:** the canvas pad on 1080px canvases, the tight pad on the 1200 × 628 landscape;
  stories keep the top and bottom story-safe bands clear of platform chrome.
- **One idea per board:** overline, headline, signature. One field colour per board — flooded pink
  with the tiled pattern is the house look; ink for statements; the soft pinks for product-led
  boards.
- **One `OfferSeal` per board**, cornered and allowed to bleed off the edge — but the number stays
  fully inside the canvas. Pass `bleed`; never position the seal by hand.
- **Every board is signed** with `LogoLockup` (or `Logo` on small ad units), white on pink or ink.
- **Display ads** carry the smallest possible message: mark, one line, one button.

<Canvas of={Specimens.CanvasTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/marketing/canvas-type.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./marketing.stories";

<Meta title="Marketing/Canvas type" />

{/* source: guidelines/canvas-type.card.html */}

# Canvas type

The type scale for a 1080px artboard, set through `SocialHeadline` and previewed scaled to fit.

<Canvas of={Specimens.CanvasType} meta={Specimens} sourceState="none" />

Canvas type is its own scale: screen sizes look like fine print on a 1080 canvas and are never used
there. Headlines stay at six words or fewer, balanced, two or three lines at most. Prices on artwork
keep the `₹` rules — no space, no decimals.

<Canvas of={Specimens.CanvasTypeTokens} meta={Specimens} sourceState="none" />
```

- [ ] **Step 3: Every guideline card maps to a page**

Run:

```bash
diff <(ls "zip-files/Pink Paprikaa Design System/guidelines" | sed 's/\.card\.html$//' | sort) \
     <(grep -rhoE 'guidelines/[a-z0-9-]+\.card\.html' apps/storybook/src/foundations | sed -E 's#guidelines/##; s#\.card\.html##' | sort -u) \
  && echo "33 of 33 guideline cards mapped"
find apps/storybook/src/foundations -name '*.mdx' | wc -l
```

Expected: `33 of 33 guideline cards mapped`; `34` MDX pages — 29 pages carry the 33 cards (Logo holds four, Pattern two) and Contrast, Voice & content, Iconography, Utility classes and Section reveal are the other five.

- [ ] **Step 4: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- marketing.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/foundations/marketing
git commit -m "feat(storybook): the Marketing foundation pages

Canvas formats drawn to scale from PostFrame's formats, with a test that they
still equal the canvas tokens, and the canvas type scale set through
SocialHeadline. All 33 guideline cards now map to a foundation page.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

