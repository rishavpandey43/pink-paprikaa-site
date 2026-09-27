The cart, whole. Renders its own empty state.

    <CartPanel lines={lines} onQty={setQty} onPlace={pay} onBrowse={goMenu} />

Quantity down to 0 removes the line. Totals go through PriceSummary so money formatting stays correct.
