"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WISHLIST_KEY = "tresse-wishlist";

type WishlistContextType = {
  productIds: string[];
  count: number;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => boolean;
  remove: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) setProductIds(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISHLIST_KEY, JSON.stringify(productIds));
  }, [productIds, hydrated]);

  const isWishlisted = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const toggle = useCallback((productId: string) => {
    const exists = productIds.includes(productId);
    setProductIds((prev) =>
      exists ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    return !exists;
  }, [productIds]);

  const remove = useCallback((productId: string) => {
    setProductIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const value = useMemo(
    () => ({
      productIds,
      count: productIds.length,
      isWishlisted,
      toggle,
      remove,
    }),
    [productIds, isWishlisted, toggle, remove]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
