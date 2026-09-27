Cart totals, checkout summary and order receipts.

    <PriceSummary total={1240} note="Inclusive of all taxes."
      lines={[{label:"Subtotal",amount:1180},{label:"GST (5%)",amount:59},{label:"First order",amount:100,discount:true}]} />

Never hand-format a rupee amount - this component and PriceTag are the only correct sources.
