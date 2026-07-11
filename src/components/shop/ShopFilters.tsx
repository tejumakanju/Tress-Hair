"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { filterOptions } from "@/lib/constants/filters";
import type { ShopFilters } from "@/types/product";
import { cn } from "@/lib/utils";

type ShopFiltersProps = {
  filters: ShopFilters;
  onChange: (filters: ShopFilters) => void;
  productCount: number;
};

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs tracking-[0.15em] uppercase mb-3"
      >
        {title}
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function CheckboxFilter({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected?: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer hover:text-champagne-dark">
          <input
            type="checkbox"
            checked={selected?.includes(opt) ?? false}
            onChange={() => onToggle(opt)}
            className="accent-champagne"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function ShopFiltersPanel({ filters, onChange, productCount }: ShopFiltersProps) {
  const toggleArray = (key: keyof ShopFilters, value: string) => {
    const current = (filters[key] as string[] | undefined) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next.length ? next : undefined });
  };

  const clearAll = () => onChange({ category: filters.category });

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-xs tracking-[0.15em] uppercase">Filters</span>
        </div>
        <span className="text-xs text-muted">{productCount} items</span>
      </div>

      <FilterSection title="Price">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              onChange({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full px-2 py-1.5 text-xs border border-border bg-white focus:outline-none focus:border-champagne"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              onChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full px-2 py-1.5 text-xs border border-border bg-white focus:outline-none focus:border-champagne"
          />
        </div>
      </FilterSection>

      <FilterSection title="Hair Type">
        <CheckboxFilter
          options={filterOptions.hairType}
          selected={filters.hairType}
          onToggle={(v) => toggleArray("hairType", v)}
        />
      </FilterSection>

      <FilterSection title="Hair Origin">
        <CheckboxFilter
          options={filterOptions.hairOrigin}
          selected={filters.hairOrigin}
          onToggle={(v) => toggleArray("hairOrigin", v)}
        />
      </FilterSection>

      <FilterSection title="Texture">
        <CheckboxFilter
          options={filterOptions.texture}
          selected={filters.texture}
          onToggle={(v) => toggleArray("texture", v)}
        />
      </FilterSection>

      <FilterSection title="Length" defaultOpen={false}>
        <CheckboxFilter
          options={filterOptions.length}
          selected={filters.length}
          onToggle={(v) => toggleArray("length", v)}
        />
      </FilterSection>

      <FilterSection title="Density" defaultOpen={false}>
        <CheckboxFilter
          options={filterOptions.density}
          selected={filters.density}
          onToggle={(v) => toggleArray("density", v)}
        />
      </FilterSection>

      <FilterSection title="Cap Size" defaultOpen={false}>
        <CheckboxFilter
          options={filterOptions.capSize}
          selected={filters.capSize}
          onToggle={(v) => toggleArray("capSize", v)}
        />
      </FilterSection>

      <FilterSection title="Lace Type" defaultOpen={false}>
        <CheckboxFilter
          options={filterOptions.laceType}
          selected={filters.laceType}
          onToggle={(v) => toggleArray("laceType", v)}
        />
      </FilterSection>

      <FilterSection title="Lace Color" defaultOpen={false}>
        <CheckboxFilter
          options={filterOptions.laceColor}
          selected={filters.laceColor}
          onToggle={(v) => toggleArray("laceColor", v)}
        />
      </FilterSection>

      <FilterSection title="Color" defaultOpen={false}>
        <CheckboxFilter
          options={filterOptions.color}
          selected={filters.color}
          onToggle={(v) => toggleArray("color", v)}
        />
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-2">
          {(["in-stock", "out-of-stock"] as const).map((val) => (
            <label key={val} className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="availability"
                checked={filters.availability === val}
                onChange={() => onChange({ ...filters, availability: val })}
                className="accent-champagne"
              />
              {val === "in-stock" ? "In Stock" : "Out of Stock"}
            </label>
          ))}
          {filters.availability && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, availability: undefined })}
              className="text-[10px] text-muted hover:text-crimson flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <div className="space-y-2">
          {[4, 3].map((r) => (
            <label key={r} className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === r}
                onChange={() => onChange({ ...filters, rating: r })}
                className="accent-champagne"
              />
              {r}+ Stars
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Features">
        <div className="space-y-2">
          {[
            { key: "beginnerFriendly" as const, label: "Beginner Friendly" },
            { key: "glueless" as const, label: "Glueless" },
            { key: "readyToWear" as const, label: "Ready to Wear" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters[key]}
                onChange={(e) => onChange({ ...filters, [key]: e.target.checked || undefined })}
                className="accent-champagne"
              />
              {label}
            </label>
          ))}
        </div>
      </FilterSection>

      <button
        type="button"
        onClick={clearAll}
        className="w-full mt-4 py-2.5 text-xs tracking-[0.15em] uppercase border border-border hover:border-noir transition-colors"
      >
        Clear All Filters
      </button>
    </aside>
  );
}
