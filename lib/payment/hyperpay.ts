export const HYPERPAY_WIDGET_BASE =
  "https://oppwa.com/v1/paymentWidgets.js";

export function buildHyperPayScriptUrl(checkoutId: string): string {
  return `${HYPERPAY_WIDGET_BASE}?checkoutId=${encodeURIComponent(checkoutId)}`;
}

export function extractCheckoutId(
  checkoutId?: string | null,
  paymentUrl?: string | null,
): string | null {
  if (checkoutId?.trim()) return checkoutId.trim();

  if (paymentUrl) {
    try {
      const url = new URL(paymentUrl);
      const id = url.searchParams.get("checkoutId");
      if (id?.trim()) return id.trim();
    } catch {
      const match = paymentUrl.match(/checkoutId=([^&]+)/);
      if (match?.[1]) return decodeURIComponent(match[1]);
    }
  }

  return null;
}

export function buildPaymentCallbackUrl(
  callbackPath = "/api/payment/callback",
  params?: { orderId?: string; amount?: string },
  origin?: string,
): string {
  const search = new URLSearchParams();
  if (params?.orderId) search.set("orderId", params.orderId);
  if (params?.amount) search.set("amount", params.amount);
  const query = search.toString();
  const path = query ? `${callbackPath}?${query}` : callbackPath;

  if (origin) {
    return new URL(path, origin.endsWith("/") ? origin : `${origin}/`).toString();
  }

  return path;
}

/** @deprecated Use buildHyperPayScriptUrl instead */
export function resolvePaymentWidgetUrl(
  paymentUrl?: string | null,
  checkoutId?: string | null,
): string | null {
  const id = extractCheckoutId(checkoutId, paymentUrl);
  return id ? buildHyperPayScriptUrl(id) : null;
}

export {
  DEFAULT_SUPPORTED_BRANDS,
  getBrandsForMethod,
  parseSupportedBrands,
  paymentMethodToBrands,
  resolveBrandsForCheckout,
  extractSupportedBrandsFromCheckoutData,
} from "./brands";
export type { PaymentBrand, ResolvedBrands } from "./brands";
