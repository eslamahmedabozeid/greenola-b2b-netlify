export const PAYMENT_BRANDS = {
  VISA: "VISA",
  MASTER: "MASTER",
  MADA: "MADA",
  APPLEPAY: "APPLEPAY",
} as const;

export type PaymentBrand =
  (typeof PAYMENT_BRANDS)[keyof typeof PAYMENT_BRANDS];

export type PaymentMethod = "apple_pay" | "mada" | "card";

export const DEFAULT_SUPPORTED_BRANDS: PaymentBrand[] = [
  PAYMENT_BRANDS.VISA,
  PAYMENT_BRANDS.MASTER,
  PAYMENT_BRANDS.MADA,
  PAYMENT_BRANDS.APPLEPAY,
];

const BRAND_SET = new Set<string>(DEFAULT_SUPPORTED_BRANDS);

export function getBrandsForMethod(method?: string | null): PaymentBrand[] {
  switch (method) {
    case "apple_pay":
      return [PAYMENT_BRANDS.APPLEPAY];
    case "mada":
      return [PAYMENT_BRANDS.MADA, PAYMENT_BRANDS.VISA, PAYMENT_BRANDS.MASTER];
    case "card":
    default:
      return [
        PAYMENT_BRANDS.VISA,
        PAYMENT_BRANDS.MASTER,
        PAYMENT_BRANDS.MADA,
      ];
  }
}

export function parseSupportedBrands(
  value?: string | string[] | null,
): PaymentBrand[] {
  if (!value) return DEFAULT_SUPPORTED_BRANDS;

  const list = Array.isArray(value) ? value : value.split(/[\s,]+/);
  const parsed = list
    .map((brand) => brand.trim().toUpperCase())
    .filter((brand): brand is PaymentBrand => BRAND_SET.has(brand));

  return parsed.length > 0 ? parsed : DEFAULT_SUPPORTED_BRANDS;
}

export type ResolvedBrands = {
  brands: string;
  requested: PaymentBrand[];
  supported: PaymentBrand[];
  isValid: boolean;
  missing: PaymentBrand[];
};

export function resolveBrandsForCheckout(
  method?: string | null,
  supportedBrands?: PaymentBrand[] | null,
): ResolvedBrands {
  const supported = supportedBrands?.length
    ? supportedBrands
    : DEFAULT_SUPPORTED_BRANDS;
  const requested = getBrandsForMethod(method);
  const matched = requested.filter((brand) => supported.includes(brand));
  const missing = requested.filter((brand) => !supported.includes(brand));
  const finalBrands = matched.length > 0 ? matched : supported;

  return {
    brands: finalBrands.join(" "),
    requested,
    supported,
    isValid: matched.length > 0,
    missing,
  };
}

/** @deprecated Use resolveBrandsForCheckout instead */
export function paymentMethodToBrands(method?: string | null): string {
  return resolveBrandsForCheckout(method).brands;
}

export function extractSupportedBrandsFromCheckoutData(
  data?: Record<string, unknown> | null,
): PaymentBrand[] | null {
  if (!data) return null;

  const raw =
    data.supportedBrands ??
    data.paymentBrands ??
    data.brands ??
    data.allowedBrands;

  if (Array.isArray(raw)) {
    return parseSupportedBrands(raw as string[]);
  }

  if (typeof raw === "string") {
    return parseSupportedBrands(raw);
  }

  return null;
}
