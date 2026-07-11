"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { mainNavigation } from "@/lib/constants/navigation";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { SearchAutocomplete } from "@/components/layout/SearchAutocomplete";
import { CurrencySwitcher } from "@/components/layout/CurrencySwitcher";
import { BrandLogoHeader } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center justify-between py-4 md:py-5">
          <div className="flex items-center gap-2 md:gap-4 w-28 md:w-32">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 hover:text-champagne transition-colors"
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="p-1.5 hover:text-champagne transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="sm:hidden">
              <CurrencySwitcher />
            </div>
          </div>

          <BrandLogoHeader />

          <div className="flex items-center justify-end gap-2 md:gap-3 w-28 md:w-40">
            <div className="hidden sm:block">
              <CurrencySwitcher />
            </div>
            <Link href="/account" aria-label="Account" className="p-1.5 hover:text-champagne transition-colors hidden sm:block">
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="p-1.5 hover:text-champagne transition-colors relative">
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-champagne text-noir text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Cart"
              onClick={openCart}
              className="p-1.5 hover:text-champagne transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              <span className="absolute -top-0.5 -right-0.5 bg-crimson text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {itemCount}
              </span>
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

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-noir/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-ivory overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-serif text-lg tracking-wider text-champagne-dark">
                Menu
              </span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4">
              {mainNavigation.map((item) => (
                <div key={item.label} className="border-b border-border">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm tracking-widest uppercase"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-4 pb-3 space-y-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block text-xs text-muted hover:text-champagne-dark"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
