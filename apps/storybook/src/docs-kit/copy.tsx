import { Check, Copy } from "lucide-react";
import { createContext, type ReactNode, use, useState } from "react";

import { Icon } from "@pink-paprikaa-web/ui";

interface CopyState {
  readonly copied: string | null;
  readonly copy: (text: string) => void;
}

const CopyContext = createContext<CopyState | null>(null);

export interface CopyScopeProps {
  children: ReactNode;
  /** Layout of the buttons; defaults to a wrapping row. */
  className?: string | undefined;
}

/**
 * One "Copied …" status line for every copy button inside it — the Swatch pattern, shared by every
 * scale (R56). The status is `role="status"`, so a screen reader hears what reached the clipboard.
 */
export function CopyScope({ children, className }: CopyScopeProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string) => {
    // Absent outside a secure context (a plain-http preview), whatever the DOM type says: copy
    // nothing rather than throw from the click handler.
    const clipboard = navigator.clipboard as Clipboard | undefined;
    if (clipboard === undefined) return;
    clipboard.writeText(text).then(
      () => {
        setCopied(text);
      },
      () => {
        setCopied(null);
      }
    );
  };
  return (
    <CopyContext value={{ copied, copy }}>
      <div className={className ?? "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1"}>
        {children}
        <span role="status" className="basis-full font-body text-caption text-text-brand">
          {copied === null ? "" : `Copied ${copied}`}
        </span>
      </div>
    </CopyContext>
  );
}

export interface CopyButtonProps {
  /** What the button shows, copies, and is named by. */
  text: string;
  /** Text colour; the muted tone by default. */
  className?: string | undefined;
}

/** A button that copies its own text — a class, a CSS variable or a value. */
export function CopyButton({ text, className }: CopyButtonProps) {
  const scope = use(CopyContext);
  if (scope === null) {
    throw new Error("docs-kit: a CopyButton must sit inside a CopyScope");
  }
  return (
    <button
      type="button"
      className={`inline-flex min-w-0 cursor-pointer items-center gap-1 text-left font-mono text-mono wrap-break-word hover:text-text-brand ${className ?? "text-text-muted"}`}
      onClick={() => {
        scope.copy(text);
      }}
    >
      {text}
      <Icon icon={scope.copied === text ? Check : Copy} size="xs" />
    </button>
  );
}

export interface CopyChipsProps {
  values: readonly string[];
}

/** A row of copy buttons with its own status line. */
export function CopyChips({ values }: CopyChipsProps) {
  return (
    <CopyScope>
      {values.map((value) => (
        <CopyButton key={value} text={value} />
      ))}
    </CopyScope>
  );
}
