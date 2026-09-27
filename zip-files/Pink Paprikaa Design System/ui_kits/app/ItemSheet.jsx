const { Dialog, Radio, Checkbox, QuantityStepper, Button, SpiceLevel, DietMark, PriceTag, Badge, Text, ImageSlot, Field } = window.PinkPaprikaaDesignSystem_23ef63;
const SHEET_BASE = "../../assets";
const HEAT = [[1, "Mild"], [2, "Medium"], [3, "Hot"], [4, "Extra Hot"]];

/** Item detail as a bottom sheet: portion, heat, add-ons, quantity, live total. */
function ItemSheet({ item, onClose, onAdd }) {
  const [size, setSize] = React.useState("reg");
  const [heat, setHeat] = React.useState(item.spice || 2);
  const [mayo, setMayo] = React.useState(false);
  const [qty, setQty] = React.useState(1);
  const base = size === "sh" ? Math.round(item.price * 1.6) : item.price;
  const total = (base + (mayo ? 40 : 0)) * qty;

  return (
    <Dialog sheet onClose={onClose} width={390} style={{ maxHeight: 720, overflowY: "auto" }}
      footer={<Button fullWidth size="lg" icon="shopping-bag" onClick={() => onAdd(item, total)}>{"Add to Order \u00B7 \u20B9" + total}</Button>}>
      <div style={{ margin: "-12px -24px 16px" }}>
        <ImageSlot ratio="16:10" radius="0" label="Dish photo 16:10" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <DietMark type={item.diet} size={15} />
        <Text variant="h3" as="h3">{item.name}</Text>
        {item.badge ? <Badge tone="soft">{item.badge}</Badge> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
        <PriceTag amount={base} was={item.was} />
        <SpiceLevel level={heat} showLabel base={SHEET_BASE} />
      </div>
      <Text variant="body-sm" tone="muted" as="p" style={{ marginTop: 10 }}>{item.description}</Text>

      <div style={{ display: "grid", gap: 22, marginTop: 22 }}>
        <Field label="Portion">
          <div style={{ display: "grid", gap: 10 }}>
            <Radio name="sz" label="Regular" price={item.price} checked={size === "reg"} onChange={() => setSize("reg")} />
            <Radio name="sz" label="Sharing" price={Math.round(item.price * 1.6)} description="Feeds two." checked={size === "sh"} onChange={() => setSize("sh")} />
          </div>
        </Field>

        <Field label="How spicy?">
          <div style={{ display: "grid", gap: 10 }}>
            {HEAT.map(([v, l]) => <Radio key={v} name="ht" label={l} checked={heat === v} onChange={() => setHeat(v)} />)}
          </div>
        </Field>

        <Field label="Add-ons">
          <Checkbox label="Extra burnt chilli mayo" price={40} checked={mayo} onChange={() => setMayo(!mayo)} />
        </Field>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Text variant="body-sm" weight={500} as="span">Quantity</Text>
          <QuantityStepper value={qty} min={1} onChange={setQty} />
        </div>
      </div>
    </Dialog>
  );
}
Object.assign(window, { ItemSheet });
