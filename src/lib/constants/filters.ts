export const filterOptions = {
  hairType: ["Human Hair", "Synthetic"],
  hairOrigin: ["Brazilian", "Vietnamese", "Burmese", "Indian"],
  texture: [
    "Straight",
    "Body Wave",
    "Deep Wave",
    "Curly",
    "Kinky Straight",
    "Water Wave",
  ],
  length: [
    '10"',
    '12"',
    '14"',
    '16"',
    '18"',
    '20"',
    '22"',
    '24"',
    '26"',
    '28"',
  ],
  density: ["130%", "150%", "180%", "200%", "250%", "100g/bundle"],
  capSize: ['Small (21")', 'Medium (22")', 'Large (23")', "One Size"],
  laceType: ["HD Lace", "Swiss Lace", "Full Lace", "Lace Front"],
  laceColor: ["Transparent", "Light Brown", "Medium Brown", "Dark Brown"],
  color: [
    "Natural Black (#1B)",
    "Off Black (#1)",
    "Dark Brown (#2)",
    "Honey Blonde (#27)",
    "Copper (#30)",
    "Auburn (#33)",
  ],
  brand: ["Tressé Hair"],
  material: ["100% Virgin Remy"],
};

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "lowest-price", label: "Lowest Price" },
  { value: "highest-price", label: "Highest Price" },
  { value: "most-popular", label: "Most Popular" },
  { value: "trending", label: "Trending" },
] as const;

/** Maps URL segments to display titles / filter keys */
export const categoryMap: Record<string, string> = {
  wigs: "Wigs",
  bundles: "Bundles",
  "closures-frontals": "Frontals",
  frontals: "Frontals",
  sale: "sale",
  extensions: "Extensions",
  glueless: "Glueless",
  bob: "Bob Wigs",
  "bob-wigs": "Bob Wigs",
  curly: "Curly Wigs",
  "curly-wigs": "Curly Wigs",
  straight: "Straight Wigs",
  "straight-wigs": "Straight Wigs",
  "body-wave": "Body Wave",
  "deep-wave": "Deep Wave",
  colored: "Colored Wigs",
  "colored-wigs": "Colored Wigs",
  "raw-straight": "Raw Straight",
  "raw-wavy": "Raw Wavy",
  "natural-straight": "Natural Straight",
  "bone-straight": "Bone Straight",
  "kinky-straight": "Kinky Straight",
  "burmese-curls": "Burmese Curls",
  "pixie-curls": "Pixie Curls",
  "water-wave": "Water Wave",
  "vietnamese-bodywave": "Vietnamese Bodywave",
  "lace-front": "Lace Front",
  "hd-lace": "HD Lace",
  "full-lace": "Full Lace",
};

export const parentCategories = new Set([
  "wigs",
  "bundles",
  "closures-frontals",
  "frontals",
  "extensions",
  "sale",
]);

export function resolveShopPath(segments: string[]): {
  category?: string;
  subcategory?: string;
  title: string;
} {
  if (!segments.length) {
    return { title: "Shop All" };
  }

  if (segments[0] === "sale") {
    return { category: "sale", title: "Sale" };
  }

  if (segments.length === 1) {
    const key = segments[0];
    return {
      category: categoryMap[key] ?? key,
      title: categoryMap[key] ?? key.replace(/-/g, " "),
    };
  }

  const parent = segments[0];
  const child = segments[segments.length - 1];
  return {
    category: categoryMap[parent] ?? parent,
    subcategory: child,
    title: categoryMap[child] ?? child.replace(/-/g, " "),
  };
}
