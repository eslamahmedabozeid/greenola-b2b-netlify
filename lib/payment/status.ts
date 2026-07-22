import { formatHyperPayFailureMessage } from "./hyperpay-audit";

type HyperPayResult = {
  code?: string;
  description?: string;
};

type HyperPayStatusPayload = {
  result?: HyperPayResult;
  resultDetails?: { ExtendedDescription?: string };
  message?: string;
  error?: string;
  paymentStatus?: string;
  status?: string;
  data?: Record<string, unknown>;
};

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function extractResultCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as HyperPayStatusPayload & Record<string, unknown>;
  const nested = data.data as HyperPayStatusPayload | undefined;

  return pickString(
    data.result?.code,
    nested?.result?.code,
    typeof data.result === "string" ? data.result : null,
  );
}

function extractFailureReason(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const nested =
    data.data && typeof data.data === "object"
      ? (data.data as Record<string, unknown>)
      : undefined;
  const result =
    data.result && typeof data.result === "object"
      ? (data.result as HyperPayResult)
      : undefined;
  const nestedResult =
    nested?.result && typeof nested.result === "object"
      ? (nested.result as HyperPayResult)
      : undefined;

  return pickString(
    result?.description,
    nestedResult?.description,
    (data.resultDetails as { ExtendedDescription?: string } | undefined)
      ?.ExtendedDescription,
    (nested?.resultDetails as { ExtendedDescription?: string } | undefined)
      ?.ExtendedDescription,
    typeof data.message === "string" ? data.message : null,
    typeof data.error === "string" ? data.error : null,
    typeof nested?.message === "string" ? nested.message : null,
    typeof nested?.error === "string" ? nested.error : null,
    typeof data.payment_failure_reason === "string"
      ? data.payment_failure_reason
      : null,
    typeof nested?.payment_failure_reason === "string"
      ? nested.payment_failure_reason
      : null,
    formatParameterErrors(data.parameterErrors ?? nested?.parameterErrors),
  );
}

function formatParameterErrors(value: unknown): string | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const parts = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name : "parameter";
      const message =
        typeof record.message === "string" ? record.message : "invalid";
      return `${name}: ${message}`;
    })
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : null;
}

function isHyperPaySuccessCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return /^(000\.000\.|000\.100\.1|000\.[36])/.test(code);
}

function isPaymentSuccessful(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as Record<string, unknown>;
  const nested =
    data.data && typeof data.data === "object"
      ? (data.data as Record<string, unknown>)
      : undefined;

  const code = extractResultCode(payload);
  if (code) return isHyperPaySuccessCode(code);

  const status = pickString(
    data.paymentStatus,
    data.status,
    nested?.paymentStatus,
    nested?.status,
    typeof data.payment_status === "string" ? data.payment_status : null,
    typeof nested?.payment_status === "string" ? nested.payment_status : null,
  )?.toLowerCase();

  if (!status) return false;
  return ["success", "paid", "completed", "approved", "captured"].includes(
    status,
  );
}

function formatPaymentFailure(payload: unknown, fallback: string): string {
  return formatHyperPayFailureMessage(payload, fallback);
}

export {
  extractFailureReason,
  extractResultCode,
  formatPaymentFailure,
  isHyperPaySuccessCode,
  isPaymentSuccessful,
};
