"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, Order } from "@/types/product";

const CART_KEY = "tresse-cart";
const SAVED_KEY = "tresse-saved";
const COUPON_KEY = "tresse-coupon";
const ORDERS_KEY = "tresse-orders";

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem, options?: { openDrawer?: boolean }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  savedForLater: CartItem[];
  saveForLater: (variantId: string) => void;
  moveToCart: (variantId: string) => void;
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (order: Omit<Order, "id" | "date" | "status">) => Order;
  updateOrder: (
    id: string,
    patch: Partial<
      Pick<Order, "status" | "courier" | "trackingNumber" | "trackingUrl">
    >
  ) => void;
  orders: Order[];
  lastAddedName: string | null;
};

const CartContext = createContext<CartContextType | null>(null);

const VALID_COUPONS: Record<string, number> = {
  TRESSE10: 0.1,
  WELCOME15: 0.15,
  GLAM20: 0.2,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored));
      const saved = localStorage.getItem(SAVED_KEY);
      if (saved) setSavedForLater(JSON.parse(saved));
      const coupon = localStorage.getItem(COUPON_KEY);
      if (coupon) setCouponCode(coupon);
      const storedOrders = localStorage.getItem(ORDERS_KEY);
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedForLater));
  }, [savedForLater, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (couponCode) localStorage.setItem(COUPON_KEY, couponCode);
    else localStorage.removeItem(COUPON_KEY);
  }, [couponCode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCartOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isCartOpen]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const couponDiscount = couponCode
    ? subtotal * (VALID_COUPONS[couponCode] ?? 0)
    : 0;

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback(
    (item: CartItem, options?: { openDrawer?: boolean }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.variantId === item.variantId);
        if (existing) {
          return prev.map((i) =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }
        return [...prev, item];
      });
      setLastAddedName(item.name);
      if (options?.openDrawer !== false) {
        setIsCartOpen(true);
      }
    },
    []
  );

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const saveForLater = useCallback((variantId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.variantId === variantId);
      if (item) {
        setSavedForLater((s) => [...s.filter((x) => x.variantId !== variantId), item]);
        return prev.filter((i) => i.variantId !== variantId);
      }
      return prev;
    });
  }, []);

  const moveToCart = useCallback((variantId: string) => {
    setSavedForLater((prev) => {
      const item = prev.find((i) => i.variantId === variantId);
      if (item) {
        setItems((c) => [...c, item]);
        return prev.filter((i) => i.variantId !== variantId);
      }
      return prev;
    });
  }, []);

  const applyCoupon = useCallback((code: string) => {
    const upper = code.toUpperCase();
    if (VALID_COUPONS[upper]) {
      setCouponCode(upper);
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => setCouponCode(null), []);

  const placeOrder = useCallback(
    (orderData: Omit<Order, "id" | "date" | "status">) => {
      const order: Order = {
        ...orderData,
        id: `TH-${Date.now().toString(36).toUpperCase()}`,
        date: new Date().toISOString(),
        status: "pending",
      };
      setOrders((prev) => [order, ...prev]);
      clearCart();
      removeCoupon();
      setIsCartOpen(false);
      return order;
    },
    [clearCart, removeCoupon]
  );

  const updateOrder = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<Order, "status" | "courier" | "trackingNumber" | "trackingUrl">
      >
    ) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...patch } : o))
      );
    },
    []
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        savedForLater,
        saveForLater,
        moveToCart,
        couponCode,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        placeOrder,
        updateOrder,
        orders,
        lastAddedName,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
