import type { ReactNode } from "react";

import type { FieldControlProps } from "./field";
import { Field } from "./field";
import type { FieldStatus } from "./field-status";

/** Design control chrome (R147): the control may wrap Field itself when these are passed. */
export interface DesignFieldChrome {
  label?: ReactNode;
  hint?: ReactNode;
  error?: boolean | string | undefined;
  success?: boolean | string | undefined;
  warning?: boolean | string | undefined;
  optional?: boolean | undefined;
}

export function hasDesignFieldChrome(
  chrome: DesignFieldChrome,
  { ignoreLabel = false }: { ignoreLabel?: boolean } = {}
): boolean {
  return (
    (!ignoreLabel && chrome.label !== undefined) ||
    chrome.hint !== undefined ||
    chrome.error !== undefined ||
    chrome.success !== undefined ||
    chrome.warning !== undefined ||
    chrome.optional === true
  );
}

export function fieldStatusFromChrome(
  chrome: DesignFieldChrome,
  fallback: FieldStatus
): { status: FieldStatus; message: ReactNode | undefined } {
  if (chrome.error !== undefined && chrome.error !== false) {
    return {
      status: "error",
      message: typeof chrome.error === "string" ? chrome.error : undefined,
    };
  }
  if (chrome.success !== undefined && chrome.success !== false) {
    return {
      status: "success",
      message: typeof chrome.success === "string" ? chrome.success : undefined,
    };
  }
  if (chrome.warning !== undefined && chrome.warning !== false) {
    return {
      status: "warning",
      message: typeof chrome.warning === "string" ? chrome.warning : undefined,
    };
  }
  return { status: fallback, message: undefined };
}

export function withDesignField(
  chrome: DesignFieldChrome,
  id: string | undefined,
  fallbackStatus: FieldStatus,
  render: (wired: FieldControlProps & { status: FieldStatus }) => ReactNode,
  options?: { ignoreLabel?: boolean }
): ReactNode {
  const { status, message } = fieldStatusFromChrome(chrome, fallbackStatus);
  if (!hasDesignFieldChrome(chrome, options)) {
    return render({ id: id ?? "", status });
  }
  return (
    <Field
      label={chrome.label ?? ""}
      hint={chrome.hint}
      status={status}
      message={message}
      isOptional={chrome.optional === true}
      {...(id === undefined ? {} : { id })}
    >
      {(control) => render({ ...control, status })}
    </Field>
  );
}
