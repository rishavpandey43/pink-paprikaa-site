import { spyOn } from "storybook/test";

/** The play's userEvent (user-event setup()) stubs navigator.clipboard; the spy observes the write. */
function spyOnWrite() {
  return spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
}

export type ClipboardSpy = ReturnType<typeof spyOnWrite>;

/**
 * Runs `check` with `navigator.clipboard.writeText` spied, and restores it in a `finally` — a failed
 * assertion never leaves the spy on for the next story.
 */
export async function spyOnClipboard(check: (write: ClipboardSpy) => Promise<void>): Promise<void> {
  const write = spyOnWrite();
  try {
    await check(write);
  } finally {
    write.mockRestore();
  }
}
