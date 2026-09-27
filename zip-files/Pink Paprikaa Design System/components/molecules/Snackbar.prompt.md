Anchored confirmation bar for a completed action that may need an escape hatch - copying a code, undoing a removal, retrying a failure.

    <Snackbar open={copied} tone="success" onClose={() => setCopied(false)}>
      Code copied. Paste it at checkout.
    </Snackbar>

    <Snackbar open={removed} action="Undo" onAction={restore} onClose={hide}>
      Chilli Paneer removed.
    </Snackbar>

**Snackbar vs Toast:** Snackbar is a squared bar with a text action and a dismiss, for things the guest may want to reverse or act on. Toast is a pill with no dismiss, for pure confirmations like add-to-cart. Never show both at once.

Positioned `absolute`, so the nearest positioned ancestor anchors it - inside AppShell that is the phone frame, on a web page give the wrapper `position: relative` (or override to `position: fixed`). Auto-hides after 3.2s when onClose is given.
