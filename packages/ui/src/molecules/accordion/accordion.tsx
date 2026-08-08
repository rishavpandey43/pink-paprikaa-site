"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { ChevronDown } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { Icon } from "../../atoms/icon/icon";
import { Text } from "../../atoms/text/text";
import { componentVariants } from "../../lib/component-variants";

const accordion = componentVariants({
  slots: {
    // Hairline-separated rows, no card: the FAQ is body copy, not a stack of panels.
    root: "w-full min-w-0 border-t border-border-subtle",
    item: "border-b border-border-subtle",
    header: "flex",
    trigger: [
      "group flex min-h-(--layout-hit-min) w-full cursor-pointer items-center justify-between",
      "gap-4 border-0 bg-transparent py-4.5 text-left",
      "font-display font-bold text-subtitle1 tracking-subtitle1 text-text-heading",
      "transition-colors duration-(--duration-fast) ease-out",
      "not-disabled:hover:text-text-brand",
      "data-[state=open]:text-text-brand",
      "disabled:cursor-not-allowed disabled:text-text-subtle",
    ],
    question: "min-w-0",
    chevron: [
      "shrink-0 transition-transform duration-(--duration-base) ease-out",
      "group-data-[state=open]:rotate-180",
    ],
    content: "overflow-hidden data-[state=open]:animate-pp-fade",
    answer: "pb-4.5",
  },
});

/** The element each heading level renders — the questions must sit in the page outline. */
const HEADING_TAG = { 2: "h2", 3: "h3", 4: "h4" } as const;

export interface AccordionItem {
  /** The question, in sentence case, ending in a question mark. */
  question: string;
  /** The answer. Plain text unless it genuinely needs a list or a link. */
  answer: ReactNode;
  /**
   * Stable id for the row, used by `defaultOpen`. Defaults to the question, so pass one only when
   * the wording is likely to change.
   */
  value?: string;
  /** Greys the row out and stops it opening — for a disclosure that is not live yet. */
  isDisabled?: boolean;
}

export interface AccordionProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "defaultValue" | "dir"
> {
  /** The questions, in the order a guest would ask them. */
  items: AccordionItem[];
  /** Lets several answers stay open at once. Off by default: one answer, one focus. */
  isMultiple?: boolean | undefined;
  /** Values (or questions) open on first render. Only the first is used in single mode. */
  defaultOpen?: string[] | undefined;
  /** The heading level the questions render at. Set it to match the section they sit under. */
  headingLevel?: 2 | 3 | 4 | undefined;
}

export function Accordion({
  className,
  items,
  isMultiple = false,
  defaultOpen = [],
  headingLevel = 3,
  ...props
}: AccordionProps) {
  const slots = accordion();
  const Heading = HEADING_TAG[headingLevel];

  const rows = items.map((item) => {
    const value = item.value ?? item.question;
    return (
      <AccordionPrimitive.Item
        className={slots.item()}
        disabled={item.isDisabled ?? false}
        key={value}
        value={value}
      >
        <AccordionPrimitive.Header asChild>
          <Heading className={slots.header()}>
            <AccordionPrimitive.Trigger className={slots.trigger()}>
              <span className={slots.question()}>{item.question}</span>
              <Icon className={slots.chevron()} icon={ChevronDown} size="md" />
            </AccordionPrimitive.Trigger>
          </Heading>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className={slots.content()}>
          <Text as="div" className={slots.answer()} measure="prose" tone="muted" variant="body2">
            {item.answer}
          </Text>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    );
  });

  if (isMultiple) {
    return (
      <AccordionPrimitive.Root
        className={slots.root({ class: className })}
        defaultValue={defaultOpen}
        type="multiple"
        {...props}
      >
        {rows}
      </AccordionPrimitive.Root>
    );
  }

  // Radix declares `defaultValue` without `| undefined` and the workspace runs
  // `exactOptionalPropertyTypes`, so an empty `defaultOpen` has to leave the prop off entirely.
  const singleProps: AccordionPrimitive.AccordionSingleProps = {
    type: "single",
    collapsible: true,
  };
  const first = defaultOpen[0];
  if (first !== undefined) singleProps.defaultValue = first;

  return (
    <AccordionPrimitive.Root
      className={slots.root({ class: className })}
      {...singleProps}
      {...props}
    >
      {rows}
    </AccordionPrimitive.Root>
  );
}
