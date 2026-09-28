"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Icon } from "../../atoms/icon/icon";

/** How long the stub reads "Copied" before returning to its hint. */
const COPIED_FLASH_MS = 1800;

/** Class names computed by the server CouponTicket, so the leaf holds behaviour only. */
export interface CouponStubClassNames {
  root: string;
  inner: string;
  label: string;
  code: string;
  hint: string;
}

export interface CouponCopyButtonProps {
  code: string;
  codeLabel: string;
  copyHint: string;
  copiedLabel: string;
  classNames: CouponStubClassNames;
  onCopy?: ((code: string) => void) | undefined;
}

/** The ticket's code stub as a copy button. Pair `onCopy` with a Snackbar for the confirmation. */
export function CouponCopyButton({
  code,
  codeLabel,
  copyHint,
  copiedLabel,
  classNames,
  onCopy,
}: CouponCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef<HTMLSpanElement>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Unmounting mid-flash drops the pending reset.
  useEffect(
    () => () => {
      clearTimeout(flashTimer.current);
    },
    []
  );

  /** Recovery when the browser refuses the copy: leave the code selected to copy by hand. */
  const selectCode = () => {
    const node = codeRef.current;
    const selection = window.getSelection();
    if (node === null || selection === null) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleClick = () => {
    // Insecure origins expose no clipboard at all.
    if (!("clipboard" in navigator)) {
      selectCode();
      return;
    }
    navigator.clipboard.writeText(code).then(
      () => {
        // Armed with the copy, not in an effect: the flash always lasts COPIED_FLASH_MS from the
        // copy, and a second copy restarts it.
        clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => {
          setIsCopied(false);
        }, COPIED_FLASH_MS);
        setIsCopied(true);
        onCopy?.(code);
      },
      () => {
        selectCode();
      }
    );
  };

  return (
    <button type="button" onClick={handleClick} className={classNames.root}>
      {/* The {" "} separators keep the button's name "Use code PAPRIKAA50 Tap to copy", not one run-on
          word; a grid drops whitespace-only text, so they draw nothing. */}
      <span className={classNames.inner}>
        <span className={classNames.label}>{isCopied ? copiedLabel : codeLabel}</span>{" "}
        <span ref={codeRef} className={classNames.code}>
          {code}
        </span>{" "}
        <span aria-live="polite" className={classNames.hint}>
          <Icon icon={isCopied ? Check : Copy} size="xs" />
          {isCopied ? copiedLabel : copyHint}
        </span>
      </span>
    </button>
  );
}
