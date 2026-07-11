"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-noir text-white min-h-[calc(100vh-120px)] p-4">
      <Link href="/" className="flex items-center gap-2 text-xs text-white/60 hover:text-champagne mb-8 transition-colors">
        <ArrowLeft className="w-3 h-3" /> Back to Store
      </Link>
      <p className="text-[10px] tracking-[0.3em] uppercase text-champagne mb-6">Admin</p>
      <nav className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-xs tracking-wide transition-colors",
              pathname === href ? "bg-white/10 text-champagne" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
