"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { mainNavigation, type NavItem } from "@/lib/constants/navigation";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { SearchAutocomplete } from "@/components/layout/SearchAutocomplete";
import { CurrencySwitcher } from "@/components/layout/CurrencySwitcher";
import { BrandLogoHeader } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

function MobileNavSection({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (!item.children?.length) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block py-3.5 text-sm tracking-[0.15em] uppercase border-b border-border hover:text-champagne-dark transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-border">
      <div className="flex items-stretch">
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex-1 py-3.5 text-sm tracking-[0.15em] uppercase hover:text-champagne-dark transition-colors"
        >
          {item.label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Collapse" : "Expand"} ${item.label}`}
          onClick={() => setOpen((v) => !v)}
          className="px-3 py-3.5 text-muted hover:text-champagne-dark transition-colors"
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              open && "rotate-180"
            )}
            strokeWidth={1.5}
          />
        </button>
      </div>
      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-3 pl-1 space-y-0.5">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className="block py-2 px-3 text-xs tracking-wide text-muted hover:text-champagne-dark hover:bg-cream transition-colors"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button
        type="button"
        aria-label="Close menu overlay"
        className="absolute inset-0 bg-noir/70 animate-fade-in"
        onClick={onClose}
      />
      <aside className="absolute left-0 top-0 bottom-0 z-10 flex h-dvh min-h-full w-[min(100%,22rem)] flex-col bg-[#faf9f7] text-charcoal shadow-[4px_0_24px_rgba(0,0,0,0.18)] animate-slide-in-left safe-pt safe-pb isolate">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-[#faf9f7]">
          <span className="font-serif text-xl tracking-[0.12em] text-champagne-dark">
            Tressé
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="touch-target inline-flex items-center justify-center p-2 -mr-2 hover:text-champagne-dark transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-2 overscroll-contain bg-[#faf9f7]">
          {mainNavigation.map((item) => (
            <MobileNavSection key={item.label} item={item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-border px-5 py-4 space-y-3 bg-[#f5f3ef]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted">
              Currency
            </span>
            <CurrencySwitcher />
          </div>
          <Link
            href="/account"
            onClick={onClose}
            className="flex items-center gap-3 min-h-11 py-2.5 text-xs tracking-[0.12em] uppercase text-charcoal hover:text-champagne-dark transition-colors"
          >
            <User className="w-4 h-4" strokeWidth={1.5} />
            {user ? "My account" : "Sign in"}
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center gap-3 min-h-11 py-2.5 text-xs tracking-[0.12em] uppercase text-charcoal hover:text-champagne-dark transition-colors"
          >
            <Heart className="w-4 h-4" strokeWidth={1.5} />
            Wishlist
          </Link>
        </div>
      </aside>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-border safe-pt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center justify-between py-2.5 sm:py-3.5 md:py-5">
          <div className="flex items-center gap-0.5 sm:gap-2 w-[5.5rem] sm:w-28 md:w-32">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="touch-target inline-flex items-center justify-center p-2 -ml-1 hover:text-champagne transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
              className="touch-target inline-flex items-center justify-center p-2 hover:text-champagne transition-colors"
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <BrandLogoHeader />

          <div className="flex items-center justify-end gap-0 sm:gap-1 md:gap-2 w-[5.5rem] sm:w-28 md:w-40">
            <div className="hidden sm:block">
              <CurrencySwitcher />
            </div>
            <Link
              href="/account"
              aria-label={user ? "My account" : "Sign in"}
              className="touch-target inline-flex items-center justify-center p-2 hover:text-champagne transition-colors hidden sm:inline-flex"
            >
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="touch-target relative inline-flex items-center justify-center p-2 hover:text-champagne transition-colors"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-champagne text-noir text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Cart"
              onClick={openCart}
              className="touch-target relative inline-flex items-center justify-center p-2 hover:text-champagne transition-colors"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-crimson text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <SearchAutocomplete open={searchOpen} onClose={() => setSearchOpen(false)} />

        <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 pb-4">
          {mainNavigation.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setActiveMenu(item.label)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1 text-[11px] tracking-[0.15em] uppercase font-sans transition-colors hover:text-champagne-dark",
                  activeMenu === item.label && "text-champagne-dark"
                )}
              >
                {item.label}
                {item.children && (
                  <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                )}
              </Link>

              {item.children && activeMenu === item.label && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 min-w-[220px]">
                  <div className="bg-white border border-border shadow-lg py-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-5 py-2.5 text-xs tracking-wide hover:bg-cream hover:text-champagne-dark transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
