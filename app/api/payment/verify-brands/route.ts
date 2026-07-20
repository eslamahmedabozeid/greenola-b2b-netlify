import { NextResponse } from "next/server";
import {
  DEFAULT_SUPPORTED_BRANDS,
  extractSupportedBrandsFromCheckoutData,
  parseSupportedBrands,
  resolveBrandsForCheckout,
} from "@/lib/payment/brands";
import { resolveBackendApiKey, resolveB2BToken } from "@/lib/payment/env";

const BACKEND_URL =
  process.env.GREENOLA_BACKEND_URL ??
  "https://backend-dev.greenolasa.com";

function getBackendHeaders(): Record<string, string> {
  const apiKey = resolveBackendApiKey();
  const b2bToken = resolveB2BToken();
  const apiKeyHeader =
    process.env.GREENOLA_BACKEND_API_KEY_HEADER ?? "x-api-key";

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (apiKey) headers[apiKeyHeader] = apiKey;
  if (b2bToken) headers.Authorization = `Bearer ${b2bToken}`;

  return headers;
}

async function fetchSupportedBrandsFromBackend(
  checkoutId: string,
): Promise<ReturnType<typeof parseSupportedBrands> | null> {
  const template =
    process.env.GREENOLA_CHECKOUT_BRANDS_PATH ??
    "/api/v1/employee/company-subscription-orders/checkout/{checkoutId}";

  const path = template.replace("{checkoutId}", encodeURIComponent(checkoutId));

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: "GET",
      headers: getBackendHeaders(),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      data?: Record<string, unknown>;
    };

    return extractSupportedBrandsFromCheckoutData(payload.data ?? payload);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkoutId = searchParams.get("checkoutId")?.trim();
  const method = searchParams.get("method");
  const supportedBrandsParam = searchParams.get("supportedBrands");

  let supported = supportedBrandsParam
    ? parseSupportedBrands(supportedBrandsParam)
    : DEFAULT_SUPPORTED_BRANDS;

  let verifiedFromBackend = false;

  if (checkoutId) {
    const fromBackend = await fetchSupportedBrandsFromBackend(checkoutId);
    if (fromBackend?.length) {
      supported = fromBackend;
      verifiedFromBackend = true;
    }
  }

  const resolved = resolveBrandsForCheckout(method, supported);

  return NextResponse.json({
    ...resolved,
    checkoutId: checkoutId ?? null,
    verifiedFromBackend,
  });
}
