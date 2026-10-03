import { ShoppingBag } from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  Checkbox,
  Cluster,
  Dialog,
  DietMark,
  ImageSlot,
  type MenuListItem,
  PriceTag,
  QuantityStepper,
  Radio,
  RadioGroup,
  SpiceLevel,
  Stack,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

const HEAT = [
  { value: 1, label: "Mild" },
  { value: 2, label: "Medium" },
  { value: 3, label: "Hot" },
  { value: 4, label: "Extra Hot" },
] as const;

type Heat = (typeof HEAT)[number]["value"];

/** The kit's sharing portion: 1.6 × the regular price, rounded. */
const SHARING_MULTIPLIER = 1.6;
const MAYO_PRICE = 40;

export interface ItemSheetProps {
  item: MenuListItem;
  /** AppShell's frame, so the sheet opens inside the phone. */
  portalContainer: HTMLElement | null;
  onClose: () => void;
  onAdd: (item: MenuListItem, unitPrice: number, quantity: number) => void;
}

/** Item detail as a bottom sheet: portion, heat, add-on, quantity and a live total. */
export function ItemSheet({ item, portalContainer, onClose, onAdd }: ItemSheetProps) {
  const [portion, setPortion] = useState<"regular" | "sharing">("regular");
  const [heat, setHeat] = useState<Heat>(item.spice ?? 2);
  const [hasMayo, setHasMayo] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const sharingPrice = Math.round(item.price * SHARING_MULTIPLIER);
  const portionPrice = portion === "sharing" ? sharingPrice : item.price;
  const unitPrice = portionPrice + (hasMayo ? MAYO_PRICE : 0);

  return (
    <Dialog
      open
      variant="sheet"
      title={item.name}
      description={item.description}
      portalContainer={portalContainer}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      footer={
        <Button
          isFullWidth
          size="lg"
          icon={ShoppingBag}
          onClick={() => {
            onAdd(item, unitPrice, quantity);
          }}
        >
          {`Add to Order · ${formatRupees(unitPrice * quantity)}`}
        </Button>
      }
    >
      <Stack space={5}>
        <ImageSlot ratio="16:10" radius="lg" label="Dish photo 16:10" />
        <Cluster space={3}>
          <DietMark />
          {item.badge === undefined ? null : <Badge color="brand">{item.badge}</Badge>}
          <PriceTag amount={portionPrice} was={item.was} />
          <SpiceLevel level={heat} hasLabel />
        </Cluster>
        <RadioGroup legend="Portion">
          <Radio
            name="portion"
            value="regular"
            label="Regular"
            price={item.price}
            checked={portion === "regular"}
            onChange={() => {
              setPortion("regular");
            }}
          />
          <Radio
            name="portion"
            value="sharing"
            label="Sharing"
            description="Feeds two."
            price={sharingPrice}
            checked={portion === "sharing"}
            onChange={() => {
              setPortion("sharing");
            }}
          />
        </RadioGroup>
        <RadioGroup legend="How spicy?">
          {HEAT.map(({ value, label }) => (
            <Radio
              key={value}
              name="heat"
              value={String(value)}
              label={label}
              checked={heat === value}
              onChange={() => {
                setHeat(value);
              }}
            />
          ))}
        </RadioGroup>
        <Checkbox
          label="Extra burnt chilli mayo"
          price={MAYO_PRICE}
          checked={hasMayo}
          onChange={(event) => {
            setHasMayo(event.target.checked);
          }}
        />
        <QuantityStepper label="Quantity" value={quantity} min={1} onValueChange={setQuantity} />
      </Stack>
    </Dialog>
  );
}
