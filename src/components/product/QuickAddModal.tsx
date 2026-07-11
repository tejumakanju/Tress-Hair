"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useFormatPrice } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { UserCopy } from "@/lib/user-errors";
import { Button } from "@/components/ui/Button";

type QuickAddModalProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function QuickAddModal({ product, open, onClose }: QuickAddModalProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const formatPrice = useFormatPrice();
  const [length, setLength] = useState(product.lengths[0]);
  const [density, setDensity] = useState(product.densities[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [capSize, setCapSize] = useState(product.capSizes[0] ?? "One Size");

  const variant = useMemo(
    () =>
      product.variants.find(
        (v) =>
          v.length === length &&
          v.density === density &&
          v.color === color &&
          (product.capSizes.length === 0 || v.capSize === capSize)
      ),
    [product, length, density, color, capSize]
  );

  if (!open) return null;

  const handleAdd = () => {
    if (!variant || !product.inStock) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: variant.price,
      quantity: 1,
      length,
      density,
      color,
      capSize: product.capSizes.length ? capSize : undefined,
      sku: variant.sku,
    });
    toast(UserCopy.ADDED_TO_BAG(product.name));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-noir/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-ivory border border-border shadow-xl animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-3 p-4 border-b border-border">
          <div className="relative w-16 aspect-[4/5] shrink-0 bg-cream overflow-hidden">
            <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm tracking-wide uppercase">{product.name}</h3>
            <p className="text-sm mt-1 font-medium">{formatPrice(variant?.price ?? product.price)}</p>
            {!product.inStock && <p className="text-xs text-crimson mt-1">Out of stock</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <OptionRow label="Length" options={product.lengths} value={length} onChange={setLength} />
          <OptionRow label="Density" options={product.densities} value={density} onChange={setDensity} />
          <OptionRow label="Color" options={product.colors} value={color} onChange={setColor} />
          {product.capSizes.length > 0 && (
            <OptionRow label="Cap Size" options={product.capSizes} value={capSize} onChange={setCapSize} />
          )}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleAdd}
            disabled={!product.inStock || !variant}
          >
            Add to Bag
          </Button>
        </div>
      </div>
    </div>
  );
}

function OptionRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-[10px] tracking-[0.15em] uppercase block mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "px-2.5 py-1.5 text-[11px] border transition-colors",
              value === opt ? "border-noir bg-noir text-white" : "border-border hover:border-champagne"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
