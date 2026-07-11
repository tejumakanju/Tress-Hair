/** Nigeria-first shipping zones & rates (amounts in USD catalog currency). */

export type ShippingZoneId =
  | "lagos_metro"
  | "nigeria_nationwide"
  | "international";

export type ShippingMethod = {
  id: ShippingZoneId;
  label: string;
  description: string;
  eta: string;
  /** Rate in USD */
  rateUsd: number;
  courier: string;
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "lagos_metro",
    label: "Lagos Metro",
    description: "Lagos Island, Mainland & nearby — bike / van dispatch",
    eta: "1–2 business days",
    rateUsd: 5,
    courier: "Kwik Delivery / local rider",
  },
  {
    id: "nigeria_nationwide",
    label: "Nationwide Nigeria",
    description: "All states outside Lagos metro — tracked interstate",
    eta: "2–5 business days",
    rateUsd: 10,
    courier: "GIG Logistics",
  },
  {
    id: "international",
    label: "International Express",
    description: "Tracked express from Nigeria (US, UK, EU, Africa & more)",
    eta: "5–10 business days",
    rateUsd: 45,
    courier: "DHL Express",
  },
];

const LAGOS_HINTS = [
  "lagos",
  "ikeja",
  "lekki",
  "victoria island",
  "vi",
  "ikoyi",
  "surulere",
  "yaba",
  "ajah",
  "festac",
  "apapa",
  "maryland",
  "gbagada",
  "magodo",
  "ojodu",
  "agege",
  "badagry",
  "epe",
  "ikorodu",
];

export function isNigeria(country: string) {
  const c = country.trim().toLowerCase();
  return c === "nigeria" || c === "ng" || c === "federal republic of nigeria";
}

export function isLagosMetro(city: string, state: string) {
  const blob = `${city} ${state}`.toLowerCase();
  return LAGOS_HINTS.some((h) => blob.includes(h));
}

/** Methods available for a destination */
export function availableShippingMethods(
  country: string,
  city = "",
  state = ""
): ShippingMethod[] {
  if (!isNigeria(country)) {
    return SHIPPING_METHODS.filter((m) => m.id === "international");
  }
  if (isLagosMetro(city, state)) {
    return SHIPPING_METHODS.filter(
      (m) => m.id === "lagos_metro" || m.id === "nigeria_nationwide"
    );
  }
  return SHIPPING_METHODS.filter((m) => m.id === "nigeria_nationwide");
}

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return SHIPPING_METHODS.find((m) => m.id === id);
}

export function defaultShippingMethodId(
  country: string,
  city = "",
  state = ""
): ShippingZoneId {
  const available = availableShippingMethods(country, city, state);
  return available[0]?.id ?? "international";
}

/** Shipping cost in USD for a method */
export function shippingCostUsd(methodId: string): number {
  return getShippingMethod(methodId)?.rateUsd ?? 0;
}

export function suggestedCourier(methodId: string): string {
  return getShippingMethod(methodId)?.courier ?? "Partner courier";
}

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;
