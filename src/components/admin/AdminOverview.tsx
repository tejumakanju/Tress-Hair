"use client";

import { allProducts } from "@/lib/data/products";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice } from "@/lib/currency-context";
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, Users } from "lucide-react";

export function AdminOverview() {
  const { orders } = useCart();
  const formatPrice = useFormatPrice();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const ordersToday = orders.filter((o) => new Date(o.date).toDateString() === new Date().toDateString()).length;
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const lowStock = allProducts.filter((p) => !p.inStock).length;
  const topProducts = [...allProducts].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign },
    { label: "Orders Today", value: String(ordersToday), icon: ShoppingCart },
    { label: "Avg Order Value", value: formatPrice(avgOrderValue), icon: TrendingUp },
    { label: "Total Products", value: String(allProducts.length), icon: Package },
    { label: "Low Stock Alerts", value: String(lowStock), icon: AlertTriangle },
    { label: "Total Orders", value: String(orders.length), icon: Users },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl tracking-[0.15em] uppercase mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted">{label}</span>
              <Icon className="w-4 h-4 text-champagne-dark" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-medium">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-border p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-muted w-4">{i + 1}</span>
                  <span className="truncate">{p.name}</span>
                </span>
                <span className="text-muted shrink-0 ml-2">{p.salesCount} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-xs text-muted">{order.customer.firstName} {order.customer.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatPrice(order.total)}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-cream uppercase">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
