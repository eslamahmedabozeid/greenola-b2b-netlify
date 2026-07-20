export type CompanyInfo = {
  company_name: string;
  company_code: string;
  contact_name: string;
  mobile_number: string;
  email: string;
};

export type PackageSelection = {
  package_text: string;
  variation_text: string;
  duration_text: string;
  package_price: number;
  vat_amount: number;
  final_amount: number;
};

export type DeliveryDetails = {
  start_date: string;
  building_name: string;
  floor: string;
  office_number: string;
  notes: string;
};

export type CheckoutRequestBody = {
  company_info: CompanyInfo;
  package_selection: PackageSelection;
  delivery_details: DeliveryDetails;
};

export type CheckoutSessionData = {
  orderId?: number | string;
  checkoutId?: string;
  paymentUrl?: string;
  supportedBrands?: string | string[];
  paymentBrands?: string | string[];
  brands?: string | string[];
};

export type CheckoutResponse = {
  statusCode?: number;
  code?: number;
  message?: string;
  error?: string;
  data?: CheckoutSessionData;
};

export type CheckoutSession = {
  paymentUrl: string | null;
  checkoutId: string | null;
  orderId: string | null;
  supportedBrands: string | null;
};

export {
  buildHyperPayScriptUrl,
  buildPaymentCallbackUrl,
  extractCheckoutId,
  parseSupportedBrands,
  paymentMethodToBrands,
  resolveBrandsForCheckout,
  resolvePaymentWidgetUrl,
  extractSupportedBrandsFromCheckoutData,
} from "./hyperpay";

import { extractSupportedBrandsFromCheckoutData } from "./brands";

export function extractCheckoutSession(data: CheckoutResponse): CheckoutSession {
  const nested = data.data ?? {};

  const paymentUrl = nested.paymentUrl ?? null;
  const checkoutId = nested.checkoutId ?? null;
  const orderId =
    nested.orderId !== undefined && nested.orderId !== null
      ? String(nested.orderId)
      : null;
  const supportedBrandsList = extractSupportedBrandsFromCheckoutData(nested);
  const supportedBrands = supportedBrandsList?.join(" ") ?? null;

  return { paymentUrl, checkoutId, orderId, supportedBrands };
}
