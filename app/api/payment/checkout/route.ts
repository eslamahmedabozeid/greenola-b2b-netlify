import { NextResponse } from "next/server";
import {
  type CheckoutRequestBody,
  type CheckoutResponse,
  extractCheckoutSession,
} from "@/lib/payment/checkout";
import {
  buildHyperPayUpstreamBody,
  extractHyperPayAudit,
  logHyperPayAudit,
  maskSecrets,
} from "@/lib/payment/hyperpay-audit";
import {
  getCheckoutAuthConfigError,
  isCheckoutAuthConfigured,
} from "@/lib/payment/env";

const BACKEND_URL =
  process.env.GREENOLA_BACKEND_URL ??
  "https://backend-dev.greenolasa.com";

const CHECKOUT_PATH =
  process.env.GREENOLA_CHECKOUT_PATH ??
  "/api/v1/employee/company-subscription-orders/checkout";

const DEBUG_PAYMENT = process.env.GREENOLA_PAYMENT_DEBUG === "true";

function getBackendHeaders(): Record<string, string> {
  const apiKey = process.env.GREENOLA_API_KEY?.trim() ||
    process.env.GREENOLA_BACKEND_API_KEY?.trim() ||
    "";
  const b2bToken = process.env.GREENOLA_B2B_TOKEN?.trim() || "";
  const apiKeyHeader =
    process.env.GREENOLA_BACKEND_API_KEY_HEADER ?? "x-api-key";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (apiKey) headers[apiKeyHeader] = apiKey;
  if (b2bToken) headers.Authorization = `Bearer ${b2bToken}`;

  return headers;
}

function validateBody(body: CheckoutRequestBody): string | null {
  if (!body?.company_info?.company_name?.trim()) {
    return "company_info.company_name is required";
  }
  if (!body?.company_info?.contact_name?.trim()) {
    return "company_info.contact_name is required";
  }
  if (!body?.company_info?.email?.trim()) {
    return "company_info.email is required";
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
  if (!isCheckoutAuthConfigured()) {
    return NextResponse.json(
      { error: getCheckoutAuthConfigError() },
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
    const origin = new URL(request.url).origin;
    const upstreamBody = buildHyperPayUpstreamBody(body, origin);

    logHyperPayAudit("checkout.request", {
      backendUrl: `${BACKEND_URL}${CHECKOUT_PATH}`,
      hyperpayFields: upstreamBody.hyperpay,
      shopperResultUrl: upstreamBody.shopperResultUrl,
      billing: upstreamBody.billing,
      customer: upstreamBody.customer_info,
      packageSelection: upstreamBody.package_selection,
      paymentMethod: upstreamBody.payment_method,
      requestBody: maskSecrets(upstreamBody),
    });

    const upstream = await fetch(`${BACKEND_URL}${CHECKOUT_PATH}`, {
      method: "POST",
      headers: getBackendHeaders(),
      body: JSON.stringify(upstreamBody),
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

    const audit = extractHyperPayAudit(parsed ?? raw);
    logHyperPayAudit(
      upstream.ok ? "checkout.response" : "checkout.response.error",
      parsed ?? { raw },
      upstream.ok ? "info" : "error",
    );

    if (!upstream.ok) {
      const message =
        audit.parameterErrors.length > 0
          ? `invalid or missing parameter — ${audit.parameterErrors
              .map((item) => `${item.name}: ${item.message}`)
              .join(" · ")}`
          : ((parsed?.message ?? parsed?.error ?? raw.slice(0, 500)) ||
            "Checkout request failed");

      return NextResponse.json(
        {
          error: message,
          statusCode: upstream.status,
          hyperpay: audit,
          details: parsed,
          ...(DEBUG_PAYMENT ? { debug: { request: maskSecrets(upstreamBody) } } : {}),
        },
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
      hyperpay: {
        shopperResultUrl: upstreamBody.shopperResultUrl,
        amount: upstreamBody.hyperpay.amount,
        currency: upstreamBody.hyperpay.currency,
        paymentType: upstreamBody.hyperpay.paymentType,
        billing: upstreamBody.billing,
        customer: upstreamBody.hyperpay.customer,
      },
      ...(DEBUG_PAYMENT
        ? {
            debug: {
              request: maskSecrets(upstreamBody),
              response: parsed,
            },
          }
        : {}),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout request failed";

    logHyperPayAudit("checkout.exception", { message }, "error");

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
