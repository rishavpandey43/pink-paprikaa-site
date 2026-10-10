import { ArrowRight, ArrowUpRight, Phone, Plus, Search, ShoppingBag } from "lucide-react";
import { type MouseEvent, useId, useState } from "react";

import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import {
  AutoGrid,
  Badge,
  Button,
  Card,
  Cluster,
  CtaBand,
  DatePicker,
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
  Toast,
  ToastProvider,
  Typography,
} from "@pink-paprikaa-web/ui";

const BOOKING_PHONE_EMPTY = "Add a mobile number so we can text your confirmation.";
const BOOKING_PHONE_SHORT = "That number looks short. We need all 10 digits.";

function startOfToday(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

import {
  BOOKING_SLOTS,
  BUILD_YEAR,
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
  const bookingFormId = useId();
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [slot, setSlot] = useState("8:00pm");
  const [bookingDate, setBookingDate] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState<string | null>(null);

  function addToOrder(item: MenuListItem) {
    setCartCount((count) => count + 1);
    setToast(`${item.name} added to your order.`);
  }

  function openBooking(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setIsBooked(false);
    setIsBooking(true);
    setPhone("");
    setPhoneErr(null);
    setBookingDate("");
  }

  function holdBooking() {
    const digits = digitsOnly(phone);
    if (digits.length === 0) {
      setPhoneErr(BOOKING_PHONE_EMPTY);
      return;
    }
    if (digits.length < 10) {
      setPhoneErr(BOOKING_PHONE_SHORT);
      return;
    }
    setPhoneErr(null);
    setIsBooked(true);
  }

  function bookButton() {
    return (
      <Button variant="secondary" size="sm" asChild>
        <a href="#book" onClick={openBooking}>
          Book a Table
        </a>
      </Button>
    );
  }
  function orderButton() {
    return (
      <Button size="sm" icon={ShoppingBag} asChild>
        <a href="#menu">Order Now</a>
      </Button>
    );
  }

  return (
    <ToastProvider duration={2600} label="Notifications">
      <div id="top" className="max-w-full min-w-0">
        <KitNotice source="ui_kits/website" />
        <SiteHeader
          homeHref="#top"
          links={NAV_LINKS}
          badge={<Badge color="success">Pure veg</Badge>}
          actions={
            <>
              <IconButton icon={Search} label="Search the menu" variant="ghost" />
              <IconButton icon={ShoppingBag} label="Your order" variant="ghost" count={cartCount} />
              {bookButton()}
              {orderButton()}
            </>
          }
          drawerActions={
            <>
              {bookButton()}
              {orderButton()}
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

          <Section id="story" surface="alt">
            <AutoGrid min="lg" className="items-center">
              <div className="grid grid-cols-2 gap-4">
                <ImageSlot ratio="3:4" variant="strong" radius="lg" label="Kitchen portrait 3:4" />
                <ImageSlot ratio="3:4" radius="lg" label="Masala grinding 3:4" className="mt-10" />
              </div>
              <Stack space={4}>
                <SectionHeader
                  overline="Our Story"
                  title="A café that tastes like where it's from"
                />
                <Typography variant="body-lg">
                  We started in one Gurgaon market with a chai counter and a grinder. The idea was
                  simple: a café that runs on Indian flavour instead of borrowing someone
                  else&apos;s.
                </Typography>
                <Typography variant="body-lg">
                  Every masala is roasted in-house each morning. Every dish is built to be shared,
                  argued over, and ordered again.
                </Typography>
                <Cluster space={4}>
                  <Card variant="feature" className="min-w-0 flex-1">
                    <Stat
                      value={String(brand.outlets.length)}
                      label={`kitchen, ${OUTLET.name} ${OUTLET.city}`}
                      color="brand"
                    />
                  </Card>
                  <Card variant="feature" className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <SpiceLevel level={4} hasLabel />
                    <Typography variant="body-sm">the heat scale we cook to</Typography>
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
              {
                value: String(brand.reviews.google.rating),
                label: "Google rating",
                sub: LINES.googleRating,
              },
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
                      outlet.mapsUrl ? (
                        <Button size="sm" variant="ghost" iconAfter={ArrowUpRight} asChild>
                          <a href={outlet.mapsUrl} target="_blank" rel="noopener noreferrer">
                            Directions
                            <span className="sr-only"> Opens in a new tab</span>
                          </a>
                        </Button>
                      ) : undefined
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
          surface="brand"
          brand={
            <Stack space={3}>
              <Logo color="inverse" className="w-50" />
              <Typography variant="body-sm">{`${brand.statement} ${brand.hours.display}.`}</Typography>
              <Badge color="brand" className="self-start">
                {brand.vegStatement}
              </Badge>
              <Typography variant="caption">{LINES.fssai}</Typography>
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
          color="brand"
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
                  type="button"
                  onClick={() => {
                    setIsBooking(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" form={bookingFormId}>
                  Hold My Table
                </Button>
              </>
            )
          }
        >
          {isBooked ? (
            <Typography>{`We'll text you the confirmation. See you at ${OUTLET.name}.`}</Typography>
          ) : (
            <form
              id={bookingFormId}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                holdBooking();
              }}
            >
              <Stack space={4}>
                <Field label="Outlet">
                  {(control) => <Select {...control} options={OUTLET_OPTIONS} />}
                </Field>
                <Field label="Guests">
                  {(control) => <Select {...control} options={GUEST_OPTIONS} defaultValue="2" />}
                </Field>
                <Field label="Date">
                  {(control) => (
                    <DatePicker
                      {...control}
                      value={bookingDate}
                      onValueChange={setBookingDate}
                      disabledDays={{ before: startOfToday() }}
                    />
                  )}
                </Field>
                <SlotPicker
                  name="time"
                  legend="Time"
                  slots={BOOKING_SLOTS}
                  value={slot}
                  onValueChange={setSlot}
                  columns={4}
                />
                <Field
                  label="Mobile number"
                  isRequired
                  status={phoneErr === null ? "default" : "error"}
                  message={phoneErr ?? undefined}
                >
                  {(control) => (
                    <Input
                      {...control}
                      type="tel"
                      inputMode="numeric"
                      icon={Phone}
                      placeholder="98765 43210"
                      autoComplete="tel"
                      value={phone}
                      status={phoneErr === null ? "default" : "error"}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        if (phoneErr !== null) setPhoneErr(null);
                      }}
                    />
                  )}
                </Field>
              </Stack>
            </form>
          )}
        </Dialog>
      </div>
    </ToastProvider>
  );
}
