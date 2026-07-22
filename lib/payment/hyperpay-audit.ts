import type { CheckoutRequestBody } from "./checkout";
import {
  assertHttpsShopperResultUrl,
  buildBillingStreet,
  formatHyperPayAmount,
  normalizeCountryCode,
  splitCustomerName,
} from "./format";
import { buildPaymentCallbackUrl } from "./hyperpay";

type HyperPayCheckoutPayload = CheckoutRequestBody & {
  currency: string;
  payment_type: string;
  shopperResultUrl: string;
  hyperpay: {
    amount: string;
    currency: string;
    paymentType: string;
    shopperResultUrl: string;
    billing: {
      street1: string;
      city: string;
      state: string;
      country: string;
      postcode: string;
    };
    customer: {
      givenName: string;
      surname: string;
      email: string;
      mobile: string;
    };
  };
  billing: {
    street1: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  customer_info: {
    given_name: string;
    surname: string;
    email: string;
    mobile_number: string;
  };
  package_selection: CheckoutRequestBody["package_selection"] & {
    package_price: string;
    vat_amount: string;
    final_amount: string;
  };
};

const SECRET_KEYS = /token|secret|password|authorization|api[_-]?key|access/i;

function maskSecrets<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => maskSecrets(item)) as T;
  }

  if (value && typeof value === "object") {
    const masked: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (SECRET_KEYS.test(key) && typeof nested === "string") {
        masked[key] = nested.length <= 8 ? "***" : `${nested.slice(0, 4)}…${nested.slice(-4)}`;
      } else {
        masked[key] = maskSecrets(nested);
      }
    }
    return masked as T;
  }

  return value;
}

function buildHyperPayUpstreamBody(
  body: CheckoutRequestBody,
  origin: string,
): HyperPayCheckoutPayload {
  const callbackUrl = assertHttpsShopperResultUrl(
    buildPaymentCallbackUrl("/api/payment/callback", undefined, origin),
    origin,
  );

  const delivery = body.delivery_details;
  const company = body.company_info;
  const { givenName, surname } = splitCustomerName(company.contact_name);
  const street1 = body.billing_info?.street1 ?? buildBillingStreet(delivery);
  const city = body.billing_info?.city?.trim() || "Riyadh";
  const country = normalizeCountryCode(body.billing_info?.country);

  const packagePrice = formatHyperPayAmount(body.package_selection.package_price);
  const vatAmount = formatHyperPayAmount(body.package_selection.vat_amount);
  const finalAmount = formatHyperPayAmount(body.package_selection.final_amount);

  const billing = {
    street1,
    city,
    state: body.billing_info?.state?.trim() || city,
    country,
    postcode: body.billing_info?.postcode?.trim() || "00000",
  };

  const customer = {
    givenName,
    surname,
    email: company.email.trim().toLowerCase(),
    mobile: company.mobile_number.trim(),
  };

  return {
    ...body,
    currency: "SAR",
    payment_type: "DB",
    shopper_result_url: callbackUrl,
    shopperResultUrl: callbackUrl,
    billing_info: billing,
    billing,
    customer_info: {
      given_name: givenName,
      surname,
      email: customer.email,
      mobile_number: customer.mobile,
    },
    package_selection: {
      ...body.package_selection,
      package_price: packagePrice,
      vat_amount: vatAmount,
      final_amount: finalAmount,
    },
    hyperpay: {
      amount: finalAmount,
      currency: "SAR",
      paymentType: "DB",
      shopperResultUrl: callbackUrl,
      billing,
      customer,
    },
  };
}

type ParameterError = {
  name: string;
  value?: string;
  message: string;
};

type ErrorField = {
  name: string;
  value?: string;
  message: string;
};

function extractErrorFields(payload: unknown): ErrorField[] {
  if (!payload || typeof payload !== "object") return [];

  const data = payload as Record<string, unknown>;
  const nested =
    data.data && typeof data.data === "object"
      ? (data.data as Record<string, unknown>)
      : undefined;

  const raw =
    data.errorFields ??
    nested?.errorFields ??
    (data.result &&
    typeof data.result === "object" &&
    (data.result as Record<string, unknown>).errorFields);

  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    return [
      {
        name: typeof record.name === "string" ? record.name : "field",
        message:
          typeof record.message === "string" ? record.message : "invalid",
        value: typeof record.value === "string" ? record.value : undefined,
      },
    ];
  });
}

function extractParameterErrors(payload: unknown): ParameterError[] {
  if (!payload || typeof payload !== "object") return [];

  const data = payload as Record<string, unknown>;
  const nested =
    data.data && typeof data.data === "object"
      ? (data.data as Record<string, unknown>)
      : undefined;

  const raw =
    data.parameterErrors ??
    nested?.parameterErrors ??
    (data.result &&
    typeof data.result === "object" &&
    (data.result as Record<string, unknown>).parameterErrors);

  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name : "parameter";
    const message =
      typeof record.message === "string" ? record.message : "invalid";
    const value = typeof record.value === "string" ? record.value : undefined;
    return [{ name, message, value }];
  });
}

function extractHyperPayAudit(payload: unknown) {
  const data = payload as Record<string, unknown> | null;
  const result =
    data?.result && typeof data.result === "object"
      ? (data.result as Record<string, unknown>)
      : null;

  return {
    resultCode:
      (typeof result?.code === "string" ? result.code : null) ??
      (typeof data?.resultCode === "string" ? data.resultCode : null),
    description:
      (typeof result?.description === "string" ? result.description : null) ??
      (typeof data?.resultDescription === "string"
        ? data.resultDescription
        : null),
    parameterErrors: extractParameterErrors(payload),
    errorFields: extractErrorFields(payload),
  };
}

function formatHyperPayFailureMessage(payload: unknown, fallback: string): string {
  const audit = extractHyperPayAudit(payload);

  if (audit.parameterErrors.length > 0) {
    const details = audit.parameterErrors
      .map((item) => {
        const value = item.value ? ` value="${item.value}"` : "";
        return `${item.name}: ${item.message}${value}`;
      })
      .join(" · ");

    const code = audit.resultCode ? ` (${audit.resultCode})` : "";
    return `invalid or missing parameter — ${details}${code}`;
  }

  if (audit.errorFields.length > 0) {
    const details = audit.errorFields
      .map((item) => {
        const value = item.value ? ` value="${item.value}"` : "";
        return `${item.name}: ${item.message}${value}`;
      })
      .join(" · ");

    const code = audit.resultCode ? ` (${audit.resultCode})` : "";
    return `field validation failed — ${details}${code}`;
  }

  if (audit.description && audit.resultCode) {
    return `${audit.description} (${audit.resultCode})`;
  }

  return audit.description ?? fallback;
}

function logHyperPayAudit(
  phase: string,
  payload: unknown,
  level: "info" | "error" = "info",
) {
  const audit = extractHyperPayAudit(payload);
  const entry = {
    phase,
    ...audit,
    payload: maskSecrets(payload),
  };

  const line = `[HyperPay Audit] ${JSON.stringify(entry, null, 2)}`;
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export {
  buildHyperPayUpstreamBody,
  extractErrorFields,
  extractHyperPayAudit,
  extractParameterErrors,
  formatHyperPayFailureMessage,
  logHyperPayAudit,
  maskSecrets,
  type ErrorField,
  type HyperPayCheckoutPayload,
  type ParameterError,
};
