import { ArrowRight, ArrowUpRight, Phone, Plus, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import {
  AutoGrid,
  Badge,
  Button,
  Card,
  Cluster,
  CtaBand,
  Dialog,
  FaqSection,
  Field,
  HeroBanner,
  IconButton,
  ImageSlot,
  Input,
  Logo,
  MenuList,
  type MenuListItem,
  OutletCard,
  Section,
  SectionHeader,
  Select,
  SiteFooter,
  SiteHeader,
  SlotPicker,
  SpiceLevel,
  Stack,
  Stat,
  StatBand,
  TestimonialWall,
  Text,
  Toast,
  ToastProvider,
} from "@pink-paprikaa-web/ui";

import {
  BOOKING_SLOTS,
  BUILD_YEAR,
  DIRECTIONS_URL,
  FAQS,
  FOOTER_COLUMNS,
  GOOGLE_REVIEWS,
  GUEST_OPTIONS,
  MENU_CATEGORIES,
  MENU_ITEMS,
  NAV_LINKS,
  OUTLET,
  SOCIAL_LINKS,
} from "../fixtures";
import { KitNotice } from "../kit-notice";

const LINES = toBrandLines(brand, BUILD_YEAR);
const OUTLET_OPTIONS = brand.outlets.map((outlet) => ({
  value: outlet.id,
  label: `${outlet.name}, ${outlet.city}`,
}));

/** The design system's marketing homepage (ui_kits/website), composed from the library. */
export function WebsiteKit() {
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [slot, setSlot] = useState("8:00pm");

  function addToOrder(item: MenuListItem) {
    setCartCount((count) => count + 1);
    setToast(`${item.name} added to your order.`);
  }

  function openBooking() {
    setIsBooked(false);
    setIsBooking(true);
  }

  const bookButton = (
    <Button variant="secondary" size="sm" onClick={openBooking}>
      Book a Table
    </Button>
  );
  const orderButton = (
    <Button size="sm" icon={ShoppingBag} asChild>
      <a href="#menu">Order Now</a>
    </Button>
  );

  return (
    <ToastProvider duration={2600} label="Notifications">
      <div className="max-w-full min-w-0">
        <KitNotice source="ui_kits/website" />
        <SiteHeader
          homeHref="#top"
          links={NAV_LINKS}
          badge={<Badge tone="success">Pure veg</Badge>}
          actions={
            <>
              <IconButton icon={Search} label="Search the menu" variant="ghost" />
              <IconButton icon={ShoppingBag} label="Your order" variant="ghost" count={cartCount} />
              {bookButton}
              {orderButton}
            </>
          }
          drawerActions={
            <>
              {bookButton}
              {orderButton}
            </>
          }
        />

        <main id="main">
          <HeroBanner
            overline={brand.tagline}
            title={brand.statement}
            body={`We roast our own masala every morning, then build the rest of the day around it. Open ${brand.hours.display}.`}
            meta={[
              `Est. ${String(brand.established)}`,
              `${OUTLET.name}, ${OUTLET.city}`,
              brand.hours.weekday,
            ]}
            media={
              <ImageSlot
                ratio="4:5"
                radius="xl"
                label="Hero food photography 4:5 — warm, close-cropped"
              />
            }
            actions={
              <>
                <Button size="lg" icon={ShoppingBag} asChild>
                  <a href="#menu">Order Now</a>
                </Button>
                <Button size="lg" variant="secondary" iconAfter={ArrowRight} asChild>
                  <a href="#menu">See Full Menu</a>
                </Button>
              </>
            }
          />

          <MenuList
            id="menu"
            items={MENU_ITEMS}
            categories={MENU_CATEGORIES}
            overline="The Menu"
            title="Most ordered this week"
            note="100% Vegetarian"
            variant="grid"
            gridCount={4}
            action={
              <Button variant="ghost" iconAfter={ArrowRight} asChild>
                <a href="#menu">See Full Menu</a>
              </Button>
            }
            renderItemAction={(item) => (
              <IconButton
                icon={Plus}
                label={`Add ${item.name}`}
                size="sm"
                onClick={() => {
                  addToOrder(item);
                }}
              />
            )}
          />

          <Section id="story" tone="alt">
            <AutoGrid min="lg" className="items-center">
              <div className="grid grid-cols-2 gap-4">
                <ImageSlot ratio="3:4" tone="strong" radius="lg" label="Kitchen portrait 3:4" />
                <ImageSlot ratio="3:4" radius="lg" label="Masala grinding 3:4" className="mt-10" />
              </div>
              <Stack space={4}>
                <SectionHeader
                  overline="Our Story"
                  title="A café that tastes like where it's from"
                />
                <Text variant="body-lg">
                  We started in one Gurgaon market with a chai counter and a grinder. The idea was
                  simple: a café that runs on Indian flavour instead of borrowing someone
                  else&apos;s.
                </Text>
                <Text variant="body-lg">
                  Every masala is roasted in-house each morning. Every dish is built to be shared,
                  argued over, and ordered again.
                </Text>
                <Cluster space={4}>
                  <Card variant="feature" className="min-w-0 flex-1">
                    <Stat
                      value={String(brand.outlets.length)}
                      label={`kitchen, ${OUTLET.name} ${OUTLET.city}`}
                      tone="brand"
                    />
                  </Card>
                  <Card variant="feature" className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <SpiceLevel level={4} hasLabel />
                    <Text variant="body-sm">the heat scale we cook to</Text>
                  </Card>
                </Cluster>
                <Button variant="secondary" iconAfter={ArrowRight} className="self-start" asChild>
                  <a href="#story">Read Our Story</a>
                </Button>
              </Stack>
            </AutoGrid>
          </Section>

          <StatBand
            stats={[
              { value: String(brand.established), label: `established in ${OUTLET.city}` },
              { value: "100%", label: "vegetarian kitchen" },
              { value: brand.hours.weekday, label: "every day" },
            ]}
          />

          <TestimonialWall
            overline="Guests"
            title="What people actually say"
            reviews={GOOGLE_REVIEWS}
          />

          <Section id="outlets">
            <Stack space={8}>
              <SectionHeader overline="Outlets" title="Find a Paprikaa" />
              <AutoGrid min="lg">
                {brand.outlets.map((outlet) => (
                  <OutletCard
                    key={outlet.id}
                    name={outlet.name}
                    city={outlet.city}
                    address={outlet.address}
                    hours={outlet.hours ?? brand.hours.display}
                    imageLabel="Outlet interior 16:9"
                    action={
                      <Button size="sm" variant="ghost" iconAfter={ArrowUpRight} asChild>
                        <a
                          href={outlet.mapsUrl ?? DIRECTIONS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Directions
                          <span className="sr-only"> Opens in a new tab</span>
                        </a>
                      </Button>
                    }
                  />
                ))}
              </AutoGrid>
            </Stack>
          </Section>

          <FaqSection
            overline="Questions"
            title="The things people ask"
            lede="Everything guests ask us at the counter."
            items={FAQS}
          />

          <CtaBand
            id="franchise"
            overline="Franchise"
            title="Bring Pink Paprikaa to your city"
            body="One kitchen, one playbook. Franchise applications are open."
            action={
              <Button size="lg" iconAfter={ArrowRight} asChild>
                <a href={`mailto:${brand.contact.franchiseEmail}`}>Apply to Franchise</a>
              </Button>
            }
          />
        </main>

        <SiteFooter
          tone="brand"
          brand={
            <Stack space={3}>
              <Logo tone="white" className="w-50" />
              <Text variant="body-sm">{`${brand.statement} ${brand.hours.display}.`}</Text>
              <Badge tone="soft" className="self-start">
                {brand.vegStatement}
              </Badge>
              <Text variant="caption">{LINES.fssai}</Text>
            </Stack>
          }
          columns={FOOTER_COLUMNS}
          social={SOCIAL_LINKS}
          legal={
            <>
              <span>{LINES.copyright}</span>
              <span>{LINES.gstin}</span>
              <span>{LINES.cin}</span>
            </>
          }
          policies={brand.policies.map((policy) => ({
            label: policy,
            href: `#${policy.toLowerCase()}`,
          }))}
        />

        <Toast
          open={toast !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setToast(null);
          }}
          tone="brand"
          icon={ShoppingBag}
          isPop
          action={{
            label: "View Cart",
            altText: "View your order",
            onClick: () => {
              setToast(null);
            },
          }}
        >
          {toast ?? ""}
        </Toast>

        <Dialog
          open={isBooking}
          onOpenChange={setIsBooking}
          variant="modal"
          size="sm"
          title={isBooked ? "Table held for 10 minutes" : "Book a table"}
          footer={
            isBooked ? (
              <Button
                onClick={() => {
                  setIsBooking(false);
                }}
              >
                Done
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsBooking(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setIsBooked(true);
                  }}
                >
                  Hold My Table
                </Button>
              </>
            )
          }
        >
          {isBooked ? (
            <Text>{`We'll text you the confirmation. See you at ${OUTLET.name}.`}</Text>
          ) : (
            <Stack space={4}>
              <Field label="Outlet">
                {(control) => <Select {...control} options={OUTLET_OPTIONS} />}
              </Field>
              <Field label="Guests">
                {(control) => <Select {...control} options={GUEST_OPTIONS} defaultValue="2" />}
              </Field>
              <SlotPicker
                name="time"
                legend="Time"
                slots={BOOKING_SLOTS}
                value={slot}
                onValueChange={setSlot}
                columns={4}
              />
              <Field label="Mobile number" isRequired>
                {(control) => (
                  <Input
                    {...control}
                    type="tel"
                    icon={Phone}
                    placeholder="98765 43210"
                    autoComplete="tel"
                  />
                )}
              </Field>
            </Stack>
          )}
        </Dialog>
      </div>
    </ToastProvider>
  );
}
