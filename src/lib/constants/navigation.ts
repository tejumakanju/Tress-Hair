export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Shop All",
    href: "/shop",
    children: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Best Sellers", href: "/shop?sort=best-selling" },
      { label: "Trending", href: "/shop?sort=trending" },
      { label: "Sale", href: "/shop/sale" },
    ],
  },
  {
    label: "Wigs",
    href: "/shop/wigs",
    children: [
      { label: "Shop All Wigs", href: "/shop/wigs" },
      { label: "Glueless", href: "/shop/wigs/glueless" },
      { label: "Bob Wigs", href: "/shop/wigs/bob" },
      { label: "Curly Wigs", href: "/shop/wigs/curly" },
      { label: "Straight Wigs", href: "/shop/wigs/straight" },
      { label: "Body Wave", href: "/shop/wigs/body-wave" },
      { label: "Deep Wave", href: "/shop/wigs/deep-wave" },
      { label: "Colored Wigs", href: "/shop/wigs/colored" },
      { label: "Raw Straight", href: "/shop/wigs/raw-straight" },
      { label: "Raw Wavy", href: "/shop/wigs/raw-wavy" },
    ],
  },
  {
    label: "Bundles",
    href: "/shop/bundles",
    children: [
      { label: "Shop All Bundles", href: "/shop/bundles" },
      { label: "Natural Straight", href: "/shop/bundles/natural-straight" },
      { label: "Bone Straight", href: "/shop/bundles/bone-straight" },
      { label: "Kinky Straight", href: "/shop/bundles/kinky-straight" },
      { label: "Burmese Curls", href: "/shop/bundles/burmese-curls" },
      { label: "Pixie Curls", href: "/shop/bundles/pixie-curls" },
      { label: "Water Wave", href: "/shop/bundles/water-wave" },
      { label: "Vietnamese Bodywave", href: "/shop/bundles/vietnamese-bodywave" },
    ],
  },
  {
    label: "Closures & Frontals",
    href: "/shop/closures-frontals",
    children: [
      { label: "Shop All", href: "/shop/closures-frontals" },
      { label: "Lace Front", href: "/shop/closures-frontals/lace-front" },
      { label: "HD Lace", href: "/shop/closures-frontals/hd-lace" },
      { label: "Full Lace", href: "/shop/closures-frontals/full-lace" },
    ],
  },
  { label: "Collections", href: "/collections" },
  { label: "Our Story", href: "/our-story" },
  { label: "Gift Cards", href: "/gift-cards" },
  { label: "FAQs", href: "/faqs" },
  { label: "Get in Touch", href: "/contact" },
];

export const announcementMessages = [
  "Lagos & nationwide delivery across Nigeria",
  "Secure checkout with Flutterwave",
  "Tracked shipping with GIG, Kwik & DHL",
];
