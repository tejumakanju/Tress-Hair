import type { Product, ShopFilters, SortOption } from "@/types/product";

export function filterProducts(
  products: Product[],
  filters: ShopFilters
): Product[] {
  return products.filter((product) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const hay = [
        product.name,
        product.category,
        product.subcategory,
        product.description,
        product.specs.texture,
        product.specs.hairOrigin,
        product.specs.laceType,
        product.specs.glueless ? "glueless" : "",
        product.badge,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!q.split(/\s+/).every((word) => hay.includes(word))) {
        return false;
      }
    }

    if (filters.category && filters.category !== "sale") {
      const cat = filters.category.toLowerCase();
      const productCat = product.category.toLowerCase();
      const productSub = product.subcategory?.toLowerCase().replace(/ /g, "-") ?? "";
      const matchesParent =
        productCat === cat ||
        productCat === cat.replace(/s$/, "") ||
        (cat === "frontals" && (productCat === "frontals" || productSub.includes("lace")));
      const matchesSubOnly = productSub === cat || productSub.includes(cat);
      if (!matchesParent && !matchesSubOnly) {
        return false;
      }
    }

    if (filters.subcategory) {
      const sub = filters.subcategory.toLowerCase().replace(/ /g, "-");
      const productSub = product.subcategory?.toLowerCase().replace(/ /g, "-") ?? "";
      const textureSlug = product.specs.texture.toLowerCase().replace(/ /g, "-");
      const gluelessMatch = sub === "glueless" && product.specs.glueless;
      const bobMatch = sub === "bob" || sub === "bob-wigs"
        ? productSub.includes("bob") || product.name.toLowerCase().includes("bob")
        : false;
      const coloredMatch = sub === "colored" || sub === "colored-wigs"
        ? productSub.includes("colored") || product.badge === "sale"
        : false;
      if (
        !gluelessMatch &&
        !bobMatch &&
        !coloredMatch &&
        productSub !== sub &&
        !productSub.includes(sub) &&
        textureSlug !== sub &&
        !textureSlug.includes(sub.replace("-wigs", ""))
      ) {
        return false;
      }
    }

    if (filters.category === "sale" && !product.compareAtPrice) {
      return false;
    }

    if (filters.priceMin != null && product.price < filters.priceMin) {
      return false;
    }
    if (filters.priceMax != null && product.price > filters.priceMax) {
      return false;
    }

    if (filters.hairType?.length && !filters.hairType.includes(product.specs.hairType)) {
      return false;
    }
    if (filters.hairOrigin?.length && !filters.hairOrigin.includes(product.specs.hairOrigin)) {
      return false;
    }
    if (filters.texture?.length && !filters.texture.includes(product.specs.texture)) {
      return false;
    }
    if (filters.length?.length && !filters.length.some((l) => product.lengths.includes(l))) {
      return false;
    }
    if (filters.density?.length && !filters.density.some((d) => product.densities.includes(d))) {
      return false;
    }
    if (filters.capSize?.length && !filters.capSize.some((c) => product.capSizes.includes(c))) {
      return false;
    }
    if (filters.laceType?.length && product.specs.laceType && !filters.laceType.includes(product.specs.laceType)) {
      return false;
    }
    if (filters.laceColor?.length && !filters.laceColor.some((c) => product.laceColors.includes(c))) {
      return false;
    }
    if (filters.color?.length && !filters.color.some((c) => product.colors.includes(c))) {
      return false;
    }
    if (filters.availability === "in-stock" && !product.inStock) {
      return false;
    }
    if (filters.availability === "out-of-stock" && product.inStock) {
      return false;
    }
    if (filters.brand?.length && !filters.brand.includes(product.specs.brand)) {
      return false;
    }
    if (filters.rating != null && product.rating < filters.rating) {
      return false;
    }
    if (filters.material?.length && !filters.material.includes(product.specs.material)) {
      return false;
    }
    if (filters.beginnerFriendly && !product.specs.beginnerFriendly) {
      return false;
    }
    if (filters.glueless && !product.specs.glueless) {
      return false;
    }
    if (filters.readyToWear && !product.specs.readyToWear) {
      return false;
    }

    return true;
  });
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];

  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "best-selling":
      return sorted.sort((a, b) => b.salesCount - a.salesCount);
    case "highest-rated":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "lowest-price":
      return sorted.sort((a, b) => a.price - b.price);
    case "highest-price":
      return sorted.sort((a, b) => b.price - a.price);
    case "most-popular":
      return sorted.sort((a, b) => b.popularity - a.popularity);
    case "trending":
      return sorted.sort((a, b) => {
        if (a.badge === "trending" && b.badge !== "trending") return -1;
        if (b.badge === "trending" && a.badge !== "trending") return 1;
        return b.popularity - a.popularity;
      });
    case "featured":
    default:
      return sorted.sort((a, b) => {
        const badgeOrder = { bestseller: 0, trending: 1, new: 2, sale: 3 };
        const aBadge = a.badge ? badgeOrder[a.badge] ?? 4 : 4;
        const bBadge = b.badge ? badgeOrder[b.badge] ?? 4 : 4;
        return aBadge - bBadge;
      });
  }
}

export function parseFiltersFromSearchParams(
  params: Record<string, string | string[] | undefined>
): ShopFilters {
  const getArray = (key: string): string[] | undefined => {
    const val = params[key];
    if (!val) return undefined;
    return Array.isArray(val) ? val : val.split(",");
  };

  return {
    category: typeof params.category === "string" ? params.category : undefined,
    subcategory: typeof params.subcategory === "string" ? params.subcategory : undefined,
    query: typeof params.q === "string" ? params.q : undefined,
    priceMin: params.priceMin ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    hairType: getArray("hairType"),
    hairOrigin: getArray("hairOrigin"),
    texture: getArray("texture"),
    length: getArray("length"),
    density: getArray("density"),
    capSize: getArray("capSize"),
    laceType: getArray("laceType"),
    laceColor: getArray("laceColor"),
    color: getArray("color"),
    brand: getArray("brand"),
    material: getArray("material"),
    availability:
      params.availability === "in-stock" || params.availability === "out-of-stock"
        ? params.availability
        : undefined,
    rating: params.rating ? Number(params.rating) : undefined,
    beginnerFriendly: params.beginnerFriendly === "true",
    glueless: params.glueless === "true",
    readyToWear: params.readyToWear === "true",
  };
}
