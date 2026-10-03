import { Bell, CreditCard, MapPin, Plus, Receipt } from "lucide-react";

import { brand } from "@pink-paprikaa-web/content";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Cluster,
  Divider,
  FilterBar,
  Icon,
  IconButton,
  ListRow,
  Logo,
  LoyaltyCard,
  MenuItemCard,
  type MenuListItem,
  PatternField,
  SearchField,
  SpiceLevel,
  Switch,
  Text,
} from "@pink-paprikaa-web/ui";

import { MENU_CATEGORIES, MENU_ITEMS, OUTLET } from "../fixtures";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  ...MENU_CATEGORIES.map((category) => ({ value: category, label: category })),
];

export interface HomeScreenProps {
  onOpenItem: (item: MenuListItem) => void;
  onSeeMenu: () => void;
}

/** App home: pink header, loyalty, category rail, most-ordered rail, tonight's promo. */
export function HomeScreen({ onOpenItem, onSeeMenu }: HomeScreenProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-surface-page">
      <PatternField tone="brand" tile={56}>
        <div className="flex flex-col gap-4.5 px-5 pt-1 pb-6.5">
          <div className="flex items-center justify-between">
            <Logo variant="wordmark" tone="white" className="w-35" />
            <IconButton icon={Bell} label="Notifications" variant="ghost" />
          </div>
          <Text variant="h2" as="p">
            Chai first,
            <br />
            decisions later.
          </Text>
          <span className="flex items-center gap-2">
            <Icon icon={MapPin} size="sm" />
            <Text variant="body-sm" tone="muted" as="span">
              {`${OUTLET.name} · pickup`}
            </Text>
          </span>
          <SearchField label="Search the menu" placeholder="Search chai, paneer, kulfi…" />
        </div>
      </PatternField>

      <div className="px-5 pt-5">
        <LoyaltyCard visits={3} goal={6} reward="chai" />
      </div>

      <div className="px-5 pt-5.5">
        <FilterBar
          label="Menu categories"
          options={CATEGORY_OPTIONS}
          defaultValue="all"
          onValueChange={() => {
            onSeeMenu();
          }}
        />
      </div>

      <div className="flex items-baseline justify-between px-5 pt-5.5">
        <Text variant="h4" as="h2">
          Most ordered
        </Text>
        <Button variant="ghost" size="sm" onClick={onSeeMenu}>
          See all
        </Button>
      </div>
      <Cluster
        isScrollable
        isNowrap
        space={3}
        role="group"
        aria-label="Most ordered dishes"
        className="px-5 pt-3.5 pb-1"
      >
        {MENU_ITEMS.slice(0, 3).map(({ id, category: _category, ...dish }) => (
          <MenuItemCard
            key={id}
            {...dish}
            className="w-54 shrink-0"
            action={
              <IconButton
                icon={Plus}
                label={`Customise ${dish.name}`}
                size="sm"
                onClick={() => {
                  const item = MENU_ITEMS.find((candidate) => candidate.id === id);
                  if (item !== undefined) onOpenItem(item);
                }}
              />
            }
          />
        ))}
      </Cluster>

      <div className="px-5 pt-6 pb-7">
        <Card variant="ink" padding="none" className="overflow-hidden">
          <PatternField tone="ink" tile={56}>
            <div className="flex flex-col gap-2.5 p-5">
              <Badge tone="brand" className="self-start">
                Tonight Only
              </Badge>
              <Text variant="h4" weight="black" as="p">
                Extra Hot Fries, half price
              </Text>
              <span className="flex items-center gap-2.5">
                <SpiceLevel level={4} />
                <Text variant="caption" tone="muted" as="span">
                  {brand.hours.weekday}
                </Text>
              </span>
              <Button size="sm" className="mt-1.5 self-start" onClick={onSeeMenu}>
                Add to Order
              </Button>
            </div>
          </PatternField>
        </Card>
      </div>
    </div>
  );
}

/** Account: a signed-out guest, loyalty, settings rows and two switches. */
export function AccountScreen() {
  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 pt-1 pb-5">
      <div className="flex items-center gap-3.5 pt-2 pb-5">
        <Avatar name="Guest" size="lg" hasRing />
        <div className="flex flex-col">
          <Text variant="h4" as="p">
            Guest
          </Text>
          <Text variant="body-sm" tone="muted" as="span">
            Sign in with your mobile number
          </Text>
        </div>
      </div>
      <LoyaltyCard visits={3} goal={6} reward="chai" />
      <Divider variant="diamond" className="my-5" />
      <ListRow icon={MapPin} title="Default outlet" value={OUTLET.name} />
      <ListRow icon={Receipt} title="Order history" description="Your past orders" />
      <ListRow icon={CreditCard} title="Payment methods" value="UPI" />
      <Switch
        label="Order updates"
        description="A message when your order is ready."
        defaultChecked
      />
      <Switch label="Jain preferences" description="Hides onion and garlic." />
      <Button variant="secondary" isFullWidth className="mt-4">
        Sign out
      </Button>
    </div>
  );
}
