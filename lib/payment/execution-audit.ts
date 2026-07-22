import { parseJsonResponse } from "./backend";
import {
  extractErrorFields,
  extractHyperPayAudit,
  extractParameterErrors,
  logHyperPayAudit,
  maskSecrets,
  type ErrorField,
} from "./hyperpay-audit";

type PaymentExecutionInput = {
  resourcePath?: string;
  checkoutId?: string;
  entityId?: string;
};

type PaymentExecutionReport = {
  ok: boolean;
  httpStatus: number | null;
  request: {
    method: "GET";
    url: string;
    entityId: string | null;
    resourcePath: string | null;
    checkoutId: string | null;
  };
  response: unknown;
  resultCode: string | null;
  resultDescription: string | null;
  parameterErrors: ReturnType<typeof extractParameterErrors>;
  errorFields: ErrorField[];
  paymentBrand: string | null;
  amount: string | null;
  currency: string | null;
  entityIdUsed: string | null;
  entityIdSupportedVisa: boolean | null;
  source: string;
};

function resolveEntityIds(): string[] {
  const ids = [
    process.env.HYPERPAY_ENTITY_ID_VISA?.trim(),
    process.env.HYPERPAY_ENTITY_ID?.trim(),
    process.env.HYPERPAY_ENTITY_ID_MADA?.trim(),
  ].filter(Boolean) as string[];

  return [...new Set(ids)];
}

function buildPaymentStatusUrl(
  baseUrl: string,
  resourcePath: string,
  entityId: string,
): string {
  const url = new URL(
    resourcePath.startsWith("/") ? resourcePath.slice(1) : resourcePath,
    baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
  );
  url.searchParams.set("entityId", entityId);
  return url.toString();
}

function inferResourcePath(checkoutId: string): string {
  return `/v1/checkouts/${encodeURIComponent(checkoutId)}/payment`;
}

async function fetchPaymentExecutionStatus(
  input: PaymentExecutionInput,
): Promise<PaymentExecutionReport | null> {
  const accessToken = process.env.HYPERPAY_ACCESS_TOKEN?.trim();
  const baseUrl =
    process.env.HYPERPAY_BASE_URL?.trim() ?? "https://oppwa.com";

  const resourcePath =
    input.resourcePath ??
    (input.checkoutId ? inferResourcePath(input.checkoutId) : null);

  if (!accessToken || !resourcePath) {
    return null;
  }

  const entityIds = input.entityId
    ? [input.entityId]
    : resolveEntityIds();

  if (entityIds.length === 0) {
    return null;
  }

  let lastReport: PaymentExecutionReport | null = null;

  for (const entityId of entityIds) {
    const url = buildPaymentStatusUrl(baseUrl, resourcePath, entityId);

    logHyperPayAudit("payment.execution.request", {
      method: "GET",
      url,
      entityId,
      resourcePath,
      checkoutId: input.checkoutId ?? null,
      note: "HyperPay payment status — this is the GET after widget POST /v1/checkouts/{id}/payment",
    });

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const payload = await parseJsonResponse(response);
      const audit = extractHyperPayAudit(payload);
      const errorFields = extractErrorFields(payload);
      const data = (payload ?? {}) as Record<string, unknown>;

      const report: PaymentExecutionReport = {
        ok: response.ok,
        httpStatus: response.status,
        request: {
          method: "GET",
          url,
          entityId,
          resourcePath,
          checkoutId: input.checkoutId ?? null,
        },
        response: maskSecrets(payload),
        resultCode: audit.resultCode,
        resultDescription: audit.description,
        parameterErrors: audit.parameterErrors,
        errorFields,
        paymentBrand:
          typeof data.paymentBrand === "string" ? data.paymentBrand : null,
        amount: typeof data.amount === "string" ? data.amount : null,
        currency: typeof data.currency === "string" ? data.currency : null,
        entityIdUsed: entityId,
        entityIdSupportedVisa:
          entityId === process.env.HYPERPAY_ENTITY_ID_VISA?.trim()
            ? true
            : entityIds.length > 1
              ? null
              : true,
        source: "hyperpay-payment-status",
      };

      logHyperPayAudit(
        "payment.execution.response",
        {
          ...report,
          fullResponse: maskSecrets(payload),
        },
        response.ok ? "info" : "error",
      );

      lastReport = report;

      // Stop on first response that includes HyperPay result payload.
      if (audit.resultCode || audit.parameterErrors.length || errorFields.length) {
        return report;
      }
    } catch (error) {
      logHyperPayAudit(
        "payment.execution.error",
        {
          entityId,
          resourcePath,
          message: error instanceof Error ? error.message : "fetch failed",
        },
        "error",
      );
    }
  }

  return lastReport;
}

function formatExecutionFailure(report: PaymentExecutionReport | null): string {
  if (!report) {
    return "Payment execution status unavailable — set HYPERPAY_ACCESS_TOKEN and HYPERPAY_ENTITY_ID to inspect HyperPay response.";
  }

  const parts: string[] = [];

  if (report.resultDescription) {
    parts.push(report.resultDescription);
  }

  if (report.resultCode) {
    parts.push(`(${report.resultCode})`);
  }

  if (report.parameterErrors.length) {
    parts.push(
      `parameterErrors: ${report.parameterErrors
        .map((item) => `${item.name}: ${item.message}${item.value ? `="${item.value}"` : ""}`)
        .join(" · ")}`,
    );
  }

  if (report.errorFields.length) {
    parts.push(
      `errorFields: ${report.errorFields
        .map((item) => `${item.name}: ${item.message}${item.value ? `="${item.value}"` : ""}`)
        .join(" · ")}`,
    );
  }

  if (report.paymentBrand) {
    parts.push(`brand=${report.paymentBrand}`);
  }

  if (report.entityIdUsed) {
    parts.push(`entityId=${report.entityIdUsed.slice(0, 8)}…`);
  }

  return parts.join(" — ") || "Payment execution failed";
}

export {
  fetchPaymentExecutionStatus,
  formatExecutionFailure,
  type PaymentExecutionReport,
};
