import { NextResponse } from "next/server";
import {
  type CheckoutRequestBody,
  type CheckoutResponse,
  extractCheckoutSession,
} from "@/lib/payment/checkout";
import { resolveBackendApiKey, resolveB2BToken } from "@/lib/payment/env";

const BACKEND_URL =
  process.env.GREENOLA_BACKEND_URL ??
  "https://backend-dev.greenolasa.com";

const CHECKOUT_PATH =
  process.env.GREENOLA_CHECKOUT_PATH ??
  "/api/v1/employee/company-subscription-orders/checkout";

function getBackendHeaders(): Record<string, string> {
  const apiKey = resolveBackendApiKey();
  const b2bToken = resolveB2BToken();
  const apiKeyHeader =
    process.env.GREENOLA_BACKEND_API_KEY_HEADER ?? "x-api-key";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (apiKey) {
    headers[apiKeyHeader] = apiKey;
  }

  if (b2bToken) {
    headers.Authorization = `Bearer ${b2bToken}`;
  }

  return headers;
}

function validateBody(body: CheckoutRequestBody): string | null {
  if (!body?.company_info?.company_name?.trim()) {
    return "company_info.company_name is required";
  }
  if (!body?.company_info?.contact_name?.trim()) {
    return "company_info.contact_name is required";
  }
  if (!body?.company_info?.mobile_number?.trim()) {
    return "company_info.mobile_number is required";
  }
  if (!body?.package_selection?.package_text?.trim()) {
    return "package_selection.package_text is required";
  }
  if (!body?.delivery_details?.start_date?.trim()) {
    return "delivery_details.start_date is required";
  }
  return null;
}

export async function POST(request: Request) {
  const apiKey = resolveBackendApiKey();
  const b2bToken = resolveB2BToken();

  if (!apiKey || !b2bToken) {
    return NextResponse.json(
      {
        error:
          "Checkout auth not configured. Set GREENOLA_API_KEY and GREENOLA_B2B_TOKEN in .env.local, then restart the dev server.",
      },
      { status: 503 },
    );
  }

  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validationError = validateBody(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}${CHECKOUT_PATH}`, {
      method: "POST",
      headers: getBackendHeaders(),
      body: JSON.stringify(body),
    });

    const raw = await upstream.text();
    let parsed: CheckoutResponse | null = null;

    if (raw) {
      try {
        parsed = JSON.parse(raw) as CheckoutResponse;
      } catch {
        parsed = null;
      }
    }

    if (!upstream.ok) {
      const message =
        parsed?.message ??
        parsed?.error ??
        raw.slice(0, 200) ??
        "Checkout request failed";

      return NextResponse.json(
        { error: message, statusCode: upstream.status, details: parsed },
        { status: upstream.status },
      );
    }

    const session = parsed
      ? extractCheckoutSession(parsed)
      : {
          paymentUrl: null,
          checkoutId: null,
          orderId: null,
          supportedBrands: null,
        };

    return NextResponse.json({
      ok: true,
      message: parsed?.message ?? "Checkout session created",
      paymentUrl: session.paymentUrl,
      checkoutId: session.checkoutId,
      orderId: session.orderId,
      supportedBrands: session.supportedBrands,
      data: parsed?.data ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout request failed";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
