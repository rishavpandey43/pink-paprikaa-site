/**
 * Public surface of @pink-paprikaa-web/ui — the only barrel in the package. Named re-exports only.
 */
export { Avatar, type AvatarProps } from "./atoms/avatar/avatar";
export { Badge, type BadgeProps } from "./atoms/badge/badge";
export { Button, type ButtonProps, buttonVariants } from "./atoms/button/button";
export { Card, type CardProps } from "./atoms/card/card";
export { Checkbox, type CheckboxProps } from "./atoms/checkbox/checkbox";
export { Countdown, type CountdownProps } from "./atoms/countdown/countdown";
export { DietMark, type DietMarkProps } from "./atoms/diet-mark/diet-mark";
export { Divider, type DividerProps } from "./atoms/divider/divider";
export { IconButton, type IconButtonProps } from "./atoms/icon-button/icon-button";
export { Icon, type IconComponent, type IconProps } from "./atoms/icon/icon";
export {
  InstagramGlyph,
  LinkedinGlyph,
  YoutubeGlyph,
  type GlyphProps,
} from "./atoms/icon/brand-glyphs";
export { ImageSlot, type ImageSlotBase, type ImageSlotProps } from "./atoms/image-slot/image-slot";
export { Input, type InputProps } from "./atoms/input/input";
export { Link, type LinkProps } from "./atoms/link/link";
export { Logo, type LogoProps } from "./atoms/logo/logo";
export { PatternField, type PatternFieldProps } from "./atoms/pattern-field/pattern-field";
export { PriceTag, type PriceTagProps } from "./atoms/price-tag/price-tag";
export { ProgressBar, type ProgressBarProps } from "./atoms/progress-bar/progress-bar";
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from "./atoms/radio/radio";
export { Rating, type RatingProps } from "./atoms/rating/rating";
export { Select, type SelectOption, type SelectProps } from "./atoms/select/select";
export { Skeleton, type SkeletonProps } from "./atoms/skeleton/skeleton";
export { Slider, type SliderProps } from "./atoms/slider/slider";
export { SocialHeadline, type SocialHeadlineProps } from "./atoms/social-headline/social-headline";
export { SpiceLevel, type SpiceLevelProps } from "./atoms/spice-level/spice-level";
export { Spinner, type SpinnerProps } from "./atoms/spinner/spinner";
export { StatusDot, type StatusDotProps } from "./atoms/status-dot/status-dot";
export { Switch, type SwitchProps } from "./atoms/switch/switch";
export { Tag, type TagProps, tagVariants } from "./atoms/tag/tag";
export { Tooltip, type TooltipProps } from "./atoms/tooltip/tooltip";
export {
  Typography,
  type TypographyColor,
  type TypographyProps,
  type TypographyVariant,
} from "./atoms/typography/typography";
/** @deprecated use Typography (2026-10-04) */
export { Typography as Text } from "./atoms/typography/typography";
/** @deprecated use TypographyProps (2026-10-04) */
export type { TypographyProps as TextProps } from "./atoms/typography/typography";
export { AppShell, type AppShellProps } from "./layouts/app-shell/app-shell";
export { AutoGrid, type AutoGridMin, type AutoGridProps } from "./layouts/auto-grid/auto-grid";
export { Box, type BoxProps } from "./layouts/box/box";
export { Cluster, type ClusterProps } from "./layouts/cluster/cluster";
export { Container, type ContainerProps, type ContainerSize } from "./layouts/container/container";
export {
  Grid,
  GridItem,
  type GridItemProps,
  type GridProps,
  type GridResponsive,
  type GridSpan,
  type GridStart,
} from "./layouts/grid/grid";
export { POST_FORMATS, type PostFormat } from "./layouts/post-frame/post-formats";
export { PostFrame, type PostFrameProps } from "./layouts/post-frame/post-frame";
export { Section, type SectionProps } from "./layouts/section/section";
export { Stack, type StackProps } from "./layouts/stack/stack";
export type { ColorProp, SizeProp, SurfaceProp, SxProp } from "./lib/common-props";
export type { FieldStatus } from "./lib/field-status";
export { type HeadingLevel, headingTag } from "./lib/heading";
export type { LinkAs, LinkAsProps } from "./lib/link-as";
export type { NotificationAction, NotificationColor } from "./lib/notification";
export { RevealObserver, type RevealObserverProps } from "./lib/reveal-observer";
export { GAP_CLASS, type SpaceStep } from "./lib/space";
export type { Responsive, Sx } from "./lib/sx";
export {
  Accordion,
  type AccordionItem,
  type AccordionProps,
} from "./molecules/accordion/accordion";
export { Alert, type AlertProps } from "./molecules/alert/alert";
export {
  AnnouncementBar,
  type AnnouncementBarProps,
} from "./molecules/announcement-bar/announcement-bar";
export {
  Breadcrumb,
  type BreadcrumbItem,
  type BreadcrumbProps,
} from "./molecules/breadcrumb/breadcrumb";
export { CheckCard, type CheckCardProps } from "./molecules/check-card/check-card";
export {
  ChipGroup,
  type ChipGroupProps,
  type ChipOption,
  type MultipleChipGroupProps,
  type SingleChipGroupProps,
} from "./molecules/chip-group/chip-group";
export {
  ChoiceCardGroup,
  type ChoiceCardGroupProps,
  type ChoiceGridMin,
  type ChoiceOption,
} from "./molecules/choice-card-group/choice-card-group";
export { CouponTicket, type CouponTicketProps } from "./molecules/coupon-ticket/coupon-ticket";
export { EmptyState, type EmptyStateProps } from "./molecules/empty-state/empty-state";
export { FeatureItem, type FeatureItemProps } from "./molecules/feature-item/feature-item";
export { Field, type FieldControlProps, type FieldProps } from "./molecules/field/field";
export {
  FilterBar,
  type FilterBarProps,
  type FilterOption,
} from "./molecules/filter-bar/filter-bar";
export {
  type KeyValueItem,
  KeyValueList,
  type KeyValueListProps,
} from "./molecules/key-value-list/key-value-list";
export { LinkCard, type LinkCardProps } from "./molecules/link-card/link-card";
export { ListRow, type ListRowProps } from "./molecules/list-row/list-row";
export { LogoLockup, type LogoLockupProps } from "./molecules/logo-lockup/logo-lockup";
export { LoyaltyCard, type LoyaltyCardProps } from "./molecules/loyalty-card/loyalty-card";
export { MenuItemCard, type MenuItemCardProps } from "./molecules/menu-item-card/menu-item-card";
export {
  type MenuItemImage,
  MenuItemRow,
  type MenuItemRowProps,
} from "./molecules/menu-item-row/menu-item-row";
export {
  Menu,
  MenuCheckboxItem,
  type MenuCheckboxItemProps,
  MenuContent,
  type MenuContentProps,
  MenuDivider,
  MenuItem,
  type MenuItemProps,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  type MenuRadioItemProps,
  MenuTrigger,
  SubMenu,
  SubMenuContent,
  SubMenuTrigger,
} from "./molecules/menu/menu";
export { OfferSeal, type OfferSealProps } from "./molecules/offer-seal/offer-seal";
export { OtpInput, type OtpInputProps } from "./molecules/otp-input/otp-input";
export { OutletCard, type OutletCardProps } from "./molecules/outlet-card/outlet-card";
export { Pagination, type PaginationProps } from "./molecules/pagination/pagination";
export { Popover, type PopoverProps } from "./molecules/popover/popover";
export {
  type PriceLine,
  PriceSummary,
  type PriceSummaryProps,
} from "./molecules/price-summary/price-summary";
export { PricingCard, type PricingCardProps } from "./molecules/pricing-card/pricing-card";
export {
  QuantityStepper,
  type QuantityStepperProps,
} from "./molecules/quantity-stepper/quantity-stepper";
export { ReviewCard, type ReviewCardProps } from "./molecules/review-card/review-card";
export { SearchField, type SearchFieldProps } from "./molecules/search-field/search-field";
export { SectionHeader, type SectionHeaderProps } from "./molecules/section-header/section-header";
export {
  type SlotOption,
  SlotPicker,
  type SlotPickerProps,
} from "./molecules/slot-picker/slot-picker";
export { Snackbar, type SnackbarProps } from "./molecules/snackbar/snackbar";
export { Stat, type StatProps } from "./molecules/stat/stat";
export {
  StepTracker,
  type StepTrackerProps,
  type TrackerStep,
} from "./molecules/step-tracker/step-tracker";
export { Steps, type StepsItem, type StepsProps } from "./molecules/steps/steps";
export {
  StickyActionBar,
  type StickyActionBarProps,
} from "./molecules/sticky-action-bar/sticky-action-bar";
export {
  Table,
  TableBody,
  type TableBodyProps,
  TableCell,
  type TableCellProps,
  TableHead,
  TableHeaderCell,
  type TableHeaderCellProps,
  type TableHeadProps,
  type TableProps,
  TableRow,
  type TableRowProps,
} from "./molecules/table/table";
export { type TabItem, Tabs, type TabsProps } from "./molecules/tabs/tabs";
export {
  Toast,
  type ToastProps,
  ToastProvider,
  type ToastProviderProps,
} from "./molecules/toast/toast";
export {
  ActionDock,
  type ActionDockProps,
  type DockAction,
} from "./organisms/action-dock/action-dock";
export {
  CartPanel,
  type CartLine,
  type CartPanelProps,
  type CartTotals,
  cartTotals,
} from "./organisms/cart-panel/cart-panel";
export { CtaBand, type CtaBandProps } from "./organisms/cta-band/cta-band";
export { Dialog, type DialogProps, Drawer, type DrawerProps } from "./organisms/dialog/dialog";
export { FaqSection, type FaqSectionProps } from "./organisms/faq-section/faq-section";
export { HeroBanner, type HeroBannerProps } from "./organisms/hero-banner/hero-banner";
export { MenuList, type MenuListItem, type MenuListProps } from "./organisms/menu-list/menu-list";
export { OrderTracker, type OrderTrackerProps } from "./organisms/order-tracker/order-tracker";
export { QuotePanel, type QuotePanelProps } from "./organisms/quote-panel/quote-panel";
export {
  ReviewCarousel,
  type ReviewCarouselProps,
} from "./organisms/review-carousel/review-carousel";
export {
  type FooterColumn,
  type FooterItem,
  type FooterPolicy,
  type FooterSocialLink,
  SiteFooter,
  type SiteFooterProps,
} from "./organisms/site-footer/site-footer";
export {
  type NavLink,
  SiteHeader,
  type SiteHeaderProps,
} from "./organisms/site-header/site-header";
export { StatBand, type StatBandItem, type StatBandProps } from "./organisms/stat-band/stat-band";
export { TabBar, type TabBarItem, type TabBarProps } from "./organisms/tab-bar/tab-bar";
export {
  TestimonialWall,
  type TestimonialWallProps,
} from "./organisms/testimonial-wall/testimonial-wall";
