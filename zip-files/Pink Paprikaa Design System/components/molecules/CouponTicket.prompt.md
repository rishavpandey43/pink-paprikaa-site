Voucher artwork for stories, DMs, table cards and print handouts. The code stub copies to the clipboard on tap.

    const [copied, setCopied] = React.useState(false);

    <CouponTicket code="PAPRIKAA50" headline="50% off your first order"
      width={900} onCopy={() => setCopied(true)} />
    <Snackbar open={copied} tone="success" onClose={() => setCopied(false)}>
      Code copied. Paste it at checkout.
    </Snackbar>

Always pair onCopy with a Snackbar - the stub's own "Copied" flash is reinforcement, not the confirmation. Pass copyable={false} on print artwork and inside PostFrame artboards, where nothing is tappable. All type scales from width, so it works from a 300px MPU to a 1080px canvas.
