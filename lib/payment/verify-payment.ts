import { BACKEND_URL, getBackendHeaders, parseJsonResponse } from "./backend";
import { fetchPaymentExecutionStatus } from "./execution-audit";
import { isPaymentSuccessful } from "./status";

type VerifyPaymentInput = {
  resourcePath?: string;
  checkoutId?: string;
  orderId?: string;
};

type VerifyPaymentResult = {
  ok: boolean;
  payload: unknown;
  source: string;
};

const VERIFY_PATHS = [
  process.env.GREENOLA_PAYMENT_VERIFY_PATH,
  "/api/v1/employee/company-subscription-orders/payment/verify",
  "/api/v1/employee/company-subscription-orders/payment/status",
  "/api/v1/employee/company-subscription-orders/payment/callback",
].filter(Boolean) as string[];

async function tryBackendVerify(
  path: string,
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult | null> {
  const headers = getBackendHeaders();

  try {
    const postResponse = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        resourcePath: input.resourcePath,
        checkoutId: input.checkoutId,
        id: input.checkoutId,
        orderId: input.orderId,
        order_id: input.orderId,
      }),
      cache: "no-store",
    });

    const postPayload = await parseJsonResponse(postResponse);
    if (postResponse.ok && postPayload) {
      return { ok: isPaymentSuccessful(postPayload), payload: postPayload, source: path };
    }
  } catch {
    // try GET next
  }

  if (!input.resourcePath && !input.checkoutId && !input.orderId) {
    return null;
  }

  const params = new URLSearchParams();
  if (input.resourcePath) params.set("resourcePath", input.resourcePath);
  if (input.checkoutId) params.set("id", input.checkoutId);
  if (input.orderId) params.set("orderId", input.orderId);

  try {
    const getResponse = await fetch(`${BACKEND_URL}${path}?${params.toString()}`, {
      method: "GET",
      headers: getBackendHeaders(""),
      cache: "no-store",
    });

    const getPayload = await parseJsonResponse(getResponse);
    if (getResponse.ok && getPayload) {
      return { ok: isPaymentSuccessful(getPayload), payload: getPayload, source: path };
    }
  } catch {
    return null;
  }

  return null;
}

async function fetchFailedPaymentByOrder(
  orderId: string,
): Promise<unknown | null> {
  const listPath =
    process.env.GREENOLA_FAILED_PAYMENTS_PATH ??
    "/api/v1/employee/failed-payments";

  const queryKeys = ["orderId", "order_id", "company_subscription_order_id"];

  for (const key of queryKeys) {
    const params = new URLSearchParams({ [key]: orderId });

    try {
      const response = await fetch(`${BACKEND_URL}${listPath}?${params.toString()}`, {
        method: "GET",
        headers: getBackendHeaders(""),
        cache: "no-store",
      });

      if (!response.ok) continue;

      const payload = await parseJsonResponse(response);
      if (!payload) continue;

      if (Array.isArray(payload)) {
        return payload[0] ?? null;
      }

      if (payload && typeof payload === "object") {
        const record = payload as Record<string, unknown>;
        const items = record.data ?? record.items ?? record.results;
        if (Array.isArray(items)) {
          return items[0] ?? null;
        }
        return payload;
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchOrderStatus(orderId: string): Promise<unknown | null> {
  const template =
    process.env.GREENOLA_ORDER_STATUS_PATH ??
    "/api/v1/employee/company-subscription-orders/{orderId}";

  const path = template.replace("{orderId}", encodeURIComponent(orderId));

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: "GET",
      headers: getBackendHeaders(""),
      cache: "no-store",
    });

    if (!response.ok) return null;
    return parseJsonResponse(response);
  } catch {
    return null;
  }
}

async function verifyHyperPayDirect(
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult | null> {
  const report = await fetchPaymentExecutionStatus({
    resourcePath: input.resourcePath,
    checkoutId: input.checkoutId,
  });

  if (!report) return null;

  return {
    ok: report.ok && isPaymentSuccessful(report.response),
    payload: report.response,
    source: "hyperpay-payment-execution",
  };
}

async function verifyPayment(
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult | null> {
  for (const path of VERIFY_PATHS) {
    const result = await tryBackendVerify(path, input);
    if (result) return result;
  }

  const direct = await verifyHyperPayDirect(input);
  if (direct) return direct;

  if (input.orderId) {
    const failedPayment = await fetchFailedPaymentByOrder(input.orderId);
    if (failedPayment) {
      return {
        ok: false,
        payload: failedPayment,
        source: "failed-payments",
      };
    }

    const orderPayload = await fetchOrderStatus(input.orderId);
    if (orderPayload) {
      return {
        ok: isPaymentSuccessful(orderPayload),
        payload: orderPayload,
        source: "order-status",
      };
    }
  }

  return null;
}

export {
  fetchFailedPaymentByOrder,
  fetchOrderStatus,
  verifyPayment,
  type VerifyPaymentInput,
  type VerifyPaymentResult,
};
