# Batch G — carried fixes 1–4, then Task 17 (tier parity review) — report

Status: **DONE_WITH_CONCERNS**. Base `137ae96`, head `9970d1c`. Seven commits: four carried fixes and three
fixes from the parity review.

## Carried fixes (carried-fixes-G.md)

| # | What | Commit | Evidence |
| --- | --- | --- | --- |
| 1 (Important, R63) | `catalogue.spec.ts`: a new `markerMismatch(marker, uses)` predicate. If a token has a marker, sorted(marker) must equal its library uses once it is used. An unused token may carry a marker. If a token has no marker, its uses must not all be sizes. The R61 `it.each` now asserts through the predicate. The comment above it states the rule, with `bottom-dock-clearance → ["bottom"]` as the example. The predicate has 6 unit cases, including "a marker equal to a non-sizing use". | `196bcd3` | **Probe:** I added a temporary `packages/ui/src/lib/zz-probe.ts` holding the literal `bottom-dock-clearance`, then deleted it. The new spec passed 112/112. The old spec, restored with `git stash`, failed 1 of 106, on spacing-dock-clearance. |
| 2 (Minor) | `shadow-inset` now has a `$description` ("A 1px inner highlight along the top edge; it adds no depth."), so the Elevation ladder caption is no longer empty. I kept it in the ladder instead of excluding it: it is a primitive shadow, and the caption now says it adds no depth. | `205c51f` | tokens test+build green. |
| 3 (Minor) | Rating rounds the score once (`Math.round(value*10)/10`) and uses that value for the accessible name and the visible score, so 4.25 shows "4.3" in both. The fill still uses the raw value, so 4.3 still clips at 30%. A `count` that is not a non-negative integer throws `RangeError`. | `f2f343b` | TDD: 3 new cases were red first (NaN/Infinity were already rejected by `formatCount`). Rating 24/24. |
| 4 (R55 follow-up) | brand.stories: MarkLegibility gets its SpiceLevel/Rating/Spinner rows. DiamondMotif gets heat (SpiceLevel), score (Rating) and loader (Spinner). colors.stories: HeatScale gets its SpiceLevel row. `DietAndHeat` was also unblocked, since DietMark and SpiceLevel both exist, so I built it with its `<Canvas>` on iconography.mdx. I used the plan-5 brief code verbatim and removed the deferral comments. **Only the StepTracker row stays deferred** (plan 3a T19), and it keeps its comment. Prose re-check: pattern.mdx said the specimen showed "heat, step, score, dot, loader". I reworded it to say the order-step marker joins with StepTracker. logo.mdx ("shown at every size they ship") and heat.mdx ("`SpiceLevel` draws it") are now true as written. | `fa9b55b` | Brand + Colors specimens 24/24 in Chromium, axe included. |

## Task 17 — tier parity review

**Method.** I served the zip with `python3 -m http.server 4800` and Storybook on 6006. unpkg was reachable,
so every card rendered. The scripts ran from the scratchpad `pp-parity-2b/`, not from `apps/storybook`:
- `shoot.mjs` took each card or handoff page full-page, and every `Atoms/*` story cropped to `#storybook-root`,
  at 360 and 1280. That is 15 atoms and 112 stories. It built one side-by-side sheet per atom per width, and
  flagged any story whose `scrollWidth` > viewport.
- `probe.mjs` dumped computed box, padding, gap, radius, border, background, font and colour for the form
  controls on both sides.
- `tip.mjs` hovered each trigger, because a Radix tooltip is portaled outside the crop.
- `tip360.mjs` found which element overflows at 360.

I read every sheet with Read. Both servers were stopped at the end. Nothing from the scratchpad is committed.

### Fixes

| Commit | Atom | Defect |
| --- | --- | --- |
| `b2565db` | Select (and Input, via the shared field box) | **Real bug.** `lib/field-control.tsx` keyed the disabled paint on `has-disabled:` (`:has(:disabled)`), and that also matches a select's **disabled placeholder `<option>`**, or any `isDisabled` option. As a result, every placeholder Select (the "placeholder + icon", "error" and all OnSurfaces rows) rendered ink-100 with ink-400 text and **lost its status border**. The card shows a white box with body text. The fix: all disabled variants in the box now read the direct-child control, `has-[>:disabled]:` / `group-has-[>:disabled]/field:`. A disabled `<fieldset>` still reaches it. TDD: a new `play` on the `error` story (placeholder + a disabled option) asserts the box bg = `surface-card`, the border = `status-danger` and the text = `text-body`, in Chromium. It was red first (`rgb(247,243,244)` vs `rgb(255,255,255)`), then green. I re-shot it: it now matches the card. Unit tests were updated to the new class names. |
| `9970d1c` | Tooltip | The `sides` story's trigger row was 416px wide, so the page scrolled sideways at 360. Adding `flex-wrap` gave scrollWidth 360 after the fix. |

### Per-atom parity

"listed (brief)" = the brief's starting accepted list. Font rasterisation and the cards' 128px row-label
column apply to every atom and are not repeated.

#### Input
| difference | fixed / listed | reason |
| --- | --- | --- |
| Label, hint and message rows absent | listed (brief) | Owned by Field (plan 3a), spec §8.2 |
| Value text 16px at every size (card sm 14 / md–lg 15) | listed | **R21, intentional:** iOS Safari zooms a focused field below 16px, and the handoff fields use 16px |
| Suffix colour ink-600 (card ink-500) | listed | AA re-pointing of `text-subtle` (spec §5.3). Same ruling as plan 2a Task 15 |
| Trailing "Check" is a native stand-in | listed (brief) | Atoms may not import atoms |
| Loading glyph is the pulsing mark (the card's img is broken) | listed | The card's Spinner image path 404s. The system's loader is the mark |
| Stories capped at `max-w-text-measure-prose` at 1280 (card is full width) | listed | Story frame only. The box is `w-full` |
| Box 48px, 0/14px padding, 10px gap, 10px radius, 1px `border-default`, white | matches | probe |

#### Select
| difference | fixed / listed | reason |
| --- | --- | --- |
| Placeholder / disabled-option Select painted disabled and lost its status border | **fixed** `b2565db` | See above: `:has(:disabled)` matched the `<option>` |
| Text 16px (card 15px) | listed | R21 (shared field chrome) |
| Text clears a leading icon at 44px, not 42px | listed (brief) | One field chrome with Input |
| Read-only shows the lock, not the chevron | listed (brief) | form-states guideline. R64: disabled+readOnly shows the chevron |
| Label/message rows absent | listed (brief) | Field |
| `long option label at 360px` scrolls a 360 viewport by 16px | listed | The story frames a 360px box (`w-90`) inside the padded layout, on purpose. Its play measures the box |

#### Checkbox
| difference | fixed / listed | reason |
| --- | --- | --- |
| Error message beside the box (card's `error` prop) | listed (brief) | Status messages belong to Field (spec §8.2). The atom has `isInvalid` |
| Disabled uses real fills, not 50% opacity | listed (brief) | readme §3.8 |
| Rows shrink to content in single stories (card rows fill the column, price flush right) | listed | Storybook's centred layout. The row is `flex` and flushes the price right at full width, as the add-on list story shows |
| Checked box invisible on the **brand** ground in OnSurfaces (pink on pink) | listed | Controller ruling: "No on-brand variants for Checkbox/Radio/Switch/Slider (none designed) — YAGNI". See concerns |
| Label 15px / 500, description 13px muted, price Poppins 14/700 heading, gap 12 | matches | probe. R57: choice labels stay `text-control` 15px |

#### Radio
| difference | fixed / listed | reason |
| --- | --- | --- |
| Disabled uses a real fill, not opacity | listed (brief) | readme §3.8 |
| Checked ring invisible on the brand ground (only the white dot shows) | listed | Same ruling as Checkbox |
| OnSurfaces at 360: the second radio wraps under the ground label | listed | Story layout only (two loose radios in the helper's `flex-wrap` row). No card row |
| Group status / message, horizontal, states stories have no card row | listed | Contract deviation 2 (`RadioGroup.message`) and plan-added states |

#### Switch
| difference | fixed / listed | reason |
| --- | --- | --- |
| On-track invisible on the brand ground | listed | Same ruling as Checkbox |
| Disabled uses a real fill | listed (brief) | readme §3.8 |
| Single stories sit flush to the frame edge | listed | Storybook layout. No component value involved |
| `isLabelHidden` story | listed | Contract deviation 4 |

#### Slider (handoff DawatCalculator)
| difference | fixed / listed | reason |
| --- | --- | --- |
| None: native range, full width, 32px, `accent-pink-500`, same thumb and track | matches | The handoff's `style="width:100%;accent-color:var(--pink-500);height:32px"` |
| Disabled story greys natively | listed | Browser rendering of a disabled range. Not in the handoff |

#### Spinner
| difference | fixed / listed | reason |
| --- | --- | --- |
| Sizes 24/36/52, brand/ink tones, inverse on pink | matches | — |
| Extra inverse-on-ink tile | listed | Story addition. The card shows pink only |

#### Skeleton
| difference | fixed / listed | reason |
| --- | --- | --- |
| Line pitch 24px (16 + 8 gap), block, circle and card shape | matches | — |
| Card-shape line widths are proportional, not the card's fixed px | listed | Fills the story's wider frame. Same shape |

#### ProgressBar
| difference | fixed / listed | reason |
| --- | --- | --- |
| Default (brand) tone on the **brand** ground: pink segments vanish | listed | Spec §9 gives ProgressBar an explicit `tone` (brand/mint/inverse), and the card's "inverse" row is the pink-panel answer. D5 remaps the label text, not the tone prop. See concerns (the OnSurfaces story's brand row shows the wrong use) |
| Label 13.5px muted | matches | probe |
| `six stamps at 360px` scrolls 16px | listed | A deliberate 360px frame inside the padded layout (as Select) |
| Bars without a visible label | listed | Contract deviation 3, `isLabelHidden` |

#### Rating
| difference | fixed / listed | reason |
| --- | --- | --- |
| Rows spaced wider than the card | listed | Story spacing |
| Brand ground: pink diamonds on pink (only the marks read) | listed | Batch E review: Rating OnSurfacesStory justified |
| Extra 0.0 row, the `hasValue={false}` count sample, outlet-card story | listed | Plan-added stories (0 draws no fill yet is named) |
| Sizes 12/16/24, partial fill in screen space, symbol variant | matches | — |

#### SpiceLevel
| difference | fixed / listed | reason |
| --- | --- | --- |
| `sm` is 12px (card's smallest sample 10px) | listed (brief) | The menu call sites use 12 |
| Heat colours, labels MILD…EXTRA HOT, empty diamond pink-mark on ink-200 | matches | — |

#### DietMark
| difference | fixed / listed | reason |
| --- | --- | --- |
| No egg row; `lg` 20px (card 26px) | listed (brief) | Spec C10, pure veg |
| Veg square and dot, in-context row | matches | — |

#### PriceTag
| difference | fixed / listed | reason |
| --- | --- | --- |
| Struck price ink-600 (card ink-500) | listed | `text-subtle` AA re-pointing (spec §5.3) |
| `canvas` size and a 1,25,000 sample | listed | Contract deviation 6. Indian grouping sample |
| Brand tone pink-600, inverse on pink, en-dash range | matches | — |

#### Tooltip
| difference | fixed / listed | reason |
| --- | --- | --- |
| `sides` story overflowed 360 | **fixed** `9970d1c` | `flex-wrap` |
| **Fades with no slide** | listed (matches card) | The card's Tooltip.jsx animates `opacity` only (`transition: opacity var(--dur-fast)`), with no transform. Ours is the same, so this is parity, not a gap |
| Line-height 18.1px (card 1.4 = 17.5px) | listed | Uses the shared caption text token. Sub-pixel, with the pill 30.1 vs 29.5px tall |
| Long hints wrap at 224px (card `nowrap`) | listed | A plan story ("long hint"). A 360 screen cannot hold an unbounded nowrap pill |
| Bordered round native triggers (card: ghost IconButton) | listed (brief) | Atoms may not import atoms |
| z 90 (card 40); opens with `delayDuration={0}` | listed | `z-tooltip` token. Controller amendment accepts delay 0 |
| Pill ink-900, white 12.5px/400, padding 6/10, radius 6, shadow-2 | matches | hover probe on both sides |

#### Countdown (handoff PPHeader)
| difference | fixed / listed | reason |
| --- | --- | --- |
| Pill and launch-bar row match at 360 and 1280 (Space Mono, ink pill, tabular) | matches | — |
| **Dark pill on an ink section = ink on ink** | listed | The pill is a surface-invariant ink colour, and the handoff uses Countdown only on the pink launch bar. There is no ink call site, so I added no surface token (YAGNI). If a Countdown ever lands on an ink section, give the pill a component token with an ink-surface override. No OnSurfaces story, because it is not surface-aware |
| Story shows a fixed remaining time | listed | Deterministic story clock |

## Gates

- `pnpm nx format:check` ✓, `pnpm nx sync:check` ✓ (all files up to date).
- `pnpm nx run-many -t typecheck lint test build --skip-nx-cache`: **Successfully ran 4 targets for 12
  projects**. Tests: ui 610, storybook 403 (Chromium, axe on every story, including the new Select play),
  tokens 234, plus the smaller suites (20, 18, 1, 1).
- `git status --short` is clean. No `parity.tmp.mjs` in `apps/storybook`.

## Commits

`196bcd3` R63 marker spec · `205c51f` inset shadow description · `f2f343b` Rating rounding + count ·
`fa9b55b` plan 5 specimens · `b2565db` Select disabled-option paint · `9970d1c` Tooltip sides wrap.

## Deviations

- Carried fix 4 also built `DietAndHeat` (fold-list item 3 deferred it on DietMark + SpiceLevel, and both now
  exist). The dispatch named only DiamondMotif, HeatScale and MarkLegibility.
- The parity scripts differ from the brief's: per-story crops and sheets instead of whole docs pages, plus
  probes, placed in the scratchpad per the controller amendment.

## Concerns

1. **Choice controls and ProgressBar are invisible on the brand ground in their own OnSurfaces stories.**
   Checkbox, Radio and Switch are covered by the "no on-brand variants" ruling, and ProgressBar by its
   explicit `tone`. Still, those docs rows show a combination that fails in product. The options are to drop
   the brand row from those stories, render `tone="inverse"` there for ProgressBar, or design on-brand
   skins. The controller should decide.
2. `b2565db` changes the shared field box that plan 3a's SearchField / OtpInput will use. Any new control
   rendered inside `FieldControl` must be a **direct child** of the box for the disabled paint to apply.
   The field-control doc comment says so.
