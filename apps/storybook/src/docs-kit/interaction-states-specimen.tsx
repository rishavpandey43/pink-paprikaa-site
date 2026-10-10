import { Heart } from "lucide-react";

import {
  Button,
  IconButton,
  Link,
  PageButton,
  Tag,
  TextButton,
  Typography,
} from "@pink-paprikaa-web/ui";

import { token } from "./catalogue";

type ForceState = "rest" | "hover" | "press" | "focus" | "disabled";

const STATES = [
  "rest",
  "hover",
  "press",
  "focus",
  "disabled",
] as const satisfies readonly ForceState[];

function controlProps(state: ForceState): { "data-pressed"?: ""; disabled?: true } {
  if (state === "press") return { "data-pressed": "" };
  if (state === "disabled") return { disabled: true };
  return {};
}

const MATRIX = [
  {
    prefix: "btn-primary",
    label: "Button",
    note: "primary",
    onBrand: false,
    render: (state: ForceState) => (
      <Button size="sm" {...controlProps(state)}>
        Order Now
      </Button>
    ),
  },
  {
    prefix: "btn-secondary",
    label: "Button",
    note: "secondary",
    onBrand: false,
    render: (state: ForceState) => (
      <Button size="sm" variant="secondary" {...controlProps(state)}>
        See Menu
      </Button>
    ),
  },
  {
    prefix: "btn-ghost",
    label: "Button",
    note: "ghost",
    onBrand: false,
    render: (state: ForceState) => (
      <Button size="sm" variant="ghost" {...controlProps(state)}>
        Find Us
      </Button>
    ),
  },
  {
    prefix: "text",
    label: "TextButton",
    note: "toast / inline actions",
    onBrand: false,
    render: (state: ForceState) => <TextButton {...controlProps(state)}>Edit</TextButton>,
  },
  {
    prefix: "text-brand",
    label: "TextButton",
    note: "caps on brand",
    onBrand: true,
    render: (state: ForceState) => (
      <TextButton isCaps size="sm" {...controlProps(state)}>
        View Cart
      </TextButton>
    ),
  },
  {
    prefix: "icon",
    label: "IconButton",
    note: "secondary",
    onBrand: false,
    render: (state: ForceState) => (
      <IconButton
        icon={Heart}
        label="Save"
        variant="secondary"
        size="sm"
        {...controlProps(state)}
      />
    ),
  },
  {
    prefix: "link",
    label: "Link",
    note: "",
    onBrand: false,
    render: (state: ForceState) => (
      <Link href="#outlets" isDisabled={state === "disabled"} {...controlProps(state)}>
        Outlets
      </Link>
    ),
  },
  {
    prefix: "tag",
    label: "Tag",
    note: "",
    onBrand: false,
    render: (state: ForceState) => (
      <Tag onClick={() => undefined} {...controlProps(state)}>
        Sweets
      </Tag>
    ),
  },
  {
    prefix: "page",
    label: "Pagination",
    note: "PageButton",
    onBrand: false,
    render: (state: ForceState) => <PageButton {...controlProps(state)}>3</PageButton>,
  },
] as const;

export const INTERACTION_STATE_PSEUDO = {
  hover: MATRIX.flatMap((row) => [
    `#${row.prefix}-hover button`,
    `#${row.prefix}-hover a`,
    `#${row.prefix}-hover [role='button']`,
  ]),
  focusVisible: MATRIX.flatMap((row) => [
    `#${row.prefix}-focus button`,
    `#${row.prefix}-focus a`,
    `#${row.prefix}-focus [role='button']`,
  ]),
};

const TOKEN_SWATCHES = [
  ["color-state-hover", "pink-50 · hover on light"],
  ["color-state-press", "pink-100 · press on light"],
  ["color-state-hover-neutral", "ink-100 · neutral hover"],
  ["color-state-press-neutral", "ink-200 · neutral press"],
  ["color-state-hover-on-color", "white 16% · on pink/ink/status"],
  ["color-state-press-on-color", "white 28% · on pink/ink/status"],
  ["color-state-hover-tint", "ink 6% · inherits parent colour"],
  ["color-state-press-tint", "ink 12% · inherits parent colour"],
  ["color-state-press-danger", "danger press"],
  ["color-state-disabled-fill", "ink-100 · disabled fill"],
  ["color-brand-hover", "pink-600 · filled pink hover"],
  ["color-brand-active", "pink-700 · filled pink press"],
] as const;

/** Five-state matrix + the 12 `--state-*` / brand hover swatches from `states.card.html`. */
export function InteractionStatesSpecimen() {
  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-text-measure-prose text-body text-text-body">
        Anything a guest can press has <strong>five states</strong>. Hover darkens one step (pointer
        only, never on touch). Press darkens a second step and scales to 0.97 in 80ms; Space/Enter
        show it too. Focus is keyboard-only: a 2px ring, white on coloured surfaces. Disabled is a
        real grey, never just opacity. All components read one hook, <code>usePress</code>, and the
        tokens below.
      </p>
      {MATRIX.map((row) => (
        <div key={row.prefix} className="flex flex-col gap-3">
          <Typography variant="overline" color="subtle" as="p">
            {row.label}
            {row.note === "" ? null : <span className="font-body font-regular"> · {row.note}</span>}
          </Typography>
          <div
            className={row.onBrand ? "rounded-md bg-surface-brand p-4" : undefined}
            data-surface={row.onBrand ? "brand" : undefined}
          >
            <div className="flex flex-wrap items-end gap-6">
              {STATES.map((state) => (
                <div
                  key={state}
                  id={`${row.prefix}-${state}`}
                  className="grid justify-items-center gap-1.5"
                >
                  {row.render(state)}
                  <span className="font-mono text-caption text-text-subtle">{state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
        {TOKEN_SWATCHES.map(([name, note]) => {
          const swatch = token(name);
          return (
            <div key={name} className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden
                className="h-7 w-11 shrink-0 rounded-sm border-default border-border-subtle"
                style={{ background: `var(${swatch.cssVar})` }}
              />
              <span className="grid min-w-0">
                <code className="font-mono text-mono text-text-heading">{swatch.cssVar}</code>
                <span className="text-caption text-text-muted">{note}</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-body-sm text-text-muted">
        hover/colour <code className="font-mono text-mono text-text-heading">--duration-fast</code>{" "}
        140ms · press{" "}
        <code className="font-mono text-mono text-text-heading">--duration-instant</code> 80ms ·{" "}
        <code className="font-mono text-mono text-text-heading">--ease-out</code> · never fade a
        control on hover.
      </p>
    </div>
  );
}
