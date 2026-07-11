"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice } from "@/lib/currency-context";
import { getShippingMethod } from "@/lib/shipping";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/product";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-crimson",
};

const STATUSES: Order["status"][] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function AdminOrders() {
  const { orders, updateOrder } = useCart();
  const formatPrice = useFormatPrice();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const selected = orders.find((o) => o.id === selectedOrder);

  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const selectOrder = (id: string) => {
    setSelectedOrder(id);
    const order = orders.find((o) => o.id === id);
    setCourier(order?.courier ?? "");
    setTrackingNumber(order?.trackingNumber ?? "");
    setTrackingUrl(order?.trackingUrl ?? "");
  };

  const saveFulfillment = () => {
    if (!selected) return;
    updateOrder(selected.id, {
      courier: courier.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
      trackingUrl: trackingUrl.trim() || undefined,
      status:
        trackingNumber.trim() && selected.status === "pending"
          ? "shipped"
          : selected.status === "processing" && trackingNumber.trim()
            ? "shipped"
            : selected.status,
    });
  };

  return (
    <div>
      <h1 className="font-serif text-2xl tracking-[0.15em] uppercase mb-8">Orders</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">Order</th>
                <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">Customer</th>
                <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">Date</th>
                <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">Total</th>
                <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No orders yet. Place a test order from the storefront.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => selectOrder(order.id)}
                    className={cn("border-b border-border cursor-pointer hover:bg-cream/50", selectedOrder === order.id && "bg-cream")}
                  >
                    <td className="p-4 font-mono text-xs">{order.id}</td>
                    <td className="p-4">{order.customer.firstName} {order.customer.lastName}</td>
                    <td className="p-4 text-xs text-muted">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="p-4">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <span className={cn("text-[10px] px-2 py-0.5 uppercase", statusColors[order.status])}>{order.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="bg-white border border-border p-6 h-fit sticky top-24 space-y-4">
            <h2 className="text-xs tracking-[0.15em] uppercase">Order Details</h2>
            <p className="font-mono text-sm">{selected.id}</p>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted">Customer:</span> {selected.customer.firstName} {selected.customer.lastName}</p>
              <p><span className="text-muted">Email:</span> {selected.customer.email}</p>
              <p><span className="text-muted">Phone:</span> {selected.customer.phone || "—"}</p>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs tracking-[0.15em] uppercase text-muted mb-2">Shipping</p>
              <p className="text-sm">{selected.shipping.address}</p>
              <p className="text-sm">{selected.shipping.city}, {selected.shipping.state} {selected.shipping.zip}</p>
              <p className="text-sm">{selected.shipping.country}</p>
              <p className="text-xs text-muted mt-2">
                {getShippingMethod(selected.shipping.method)?.label ?? selected.shipping.method}
                {" · "}
                {formatPrice(selected.shippingCost)}
              </p>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs tracking-[0.15em] uppercase text-muted">Fulfillment</p>
              <label className="block text-xs">
                <span className="text-muted">Status</span>
                <select
                  value={selected.status}
                  onChange={(e) =>
                    updateOrder(selected.id, {
                      status: e.target.value as Order["status"],
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm border border-border focus:outline-none focus:border-champagne"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs">
                <span className="text-muted">Courier</span>
                <input
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="GIG Logistics / Kwik / DHL"
                  className="mt-1 w-full px-3 py-2 text-sm border border-border focus:outline-none focus:border-champagne"
                />
              </label>
              <label className="block text-xs">
                <span className="text-muted">Tracking number</span>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Tracking ID"
                  className="mt-1 w-full px-3 py-2 text-sm border border-border focus:outline-none focus:border-champagne"
                />
              </label>
              <label className="block text-xs">
                <span className="text-muted">Tracking URL</span>
                <input
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://…"
                  className="mt-1 w-full px-3 py-2 text-sm border border-border focus:outline-none focus:border-champagne"
                />
              </label>
              <button
                type="button"
                onClick={saveFulfillment}
                className="w-full py-2.5 bg-noir text-white text-[10px] tracking-[0.15em] uppercase hover:bg-charcoal"
              >
                Save tracking
              </button>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs tracking-[0.15em] uppercase text-muted mb-2">Items ({selected.items.length})</p>
              {selected.items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-xs mb-1">
                  <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium mt-3 pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(selected.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
