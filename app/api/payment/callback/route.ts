import { NextResponse } from "next/server";
import {
  fetchPaymentExecutionStatus,
  formatExecutionFailure,
} from "@/lib/payment/execution-audit";
import {
  formatHyperPayFailureMessage,
  logHyperPayAudit,
} from "@/lib/payment/hyperpay-audit";
import { verifyPayment } from "@/lib/payment/verify-payment";

type CallbackSearchParams = {
  orderId?: string;
  order?: string;
  amount?: string;
  resourcePath?: string;
  id?: string;
  resultCode?: string;
  resultDescription?: string;
};

function buildRedirectPath(basePath: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function resolveOrderId(params: CallbackSearchParams): string | undefined {
  return params.orderId ?? params.order;
}

async function handlePaymentCallback(
  params: CallbackSearchParams,
  requestUrl: string,
) {
  const origin = new URL(requestUrl).origin;
  const orderId = resolveOrderId(params);

  logHyperPayAudit("callback.received", {
    orderId,
    amount: params.amount,
    resourcePath: params.resourcePath,
    checkoutId: params.id,
    resultCode: params.resultCode,
    resultDescription: params.resultDescription,
    note: "Callback does not modify payment parameters — only reads HyperPay redirect query/body",
  });

  const executionReport =
    params.resourcePath || params.id
      ? await fetchPaymentExecutionStatus({
          resourcePath: params.resourcePath,
          checkoutId: params.id,
        })
      : null;

  if (executionReport) {
    logHyperPayAudit(
      executionReport.ok ? "callback.execution.success" : "callback.execution.failed",
      executionReport,
      executionReport.ok ? "info" : "error",
    );
  }

  const successParams = new URLSearchParams();
  if (orderId) successParams.set("orderId", orderId);
  if (params.amount) successParams.set("amount", params.amount);

  const failedParams = new URLSearchParams(successParams);
  const fallbackReason =
    params.resultDescription?.trim() ||
    "تحقق من بيانات البطاقة أو رصيدك، ثم حاول مرة أخرى. لم يتم خصم أي مبلغ.";

  if (!params.resourcePath && !params.id && !orderId) {
    failedParams.set("reason", "لم يتم تأكيد الدفع");
    return NextResponse.redirect(
      buildRedirectPath(`${origin}/payment/failed`, failedParams),
      { status: 303 },
    );
  }

  const verification = await verifyPayment({
    resourcePath: params.resourcePath,
    checkoutId: params.id,
    orderId,
  });

  logHyperPayAudit(
    verification?.ok ? "callback.verified.success" : "callback.verified.failed",
    verification?.payload ?? { message: "verification unavailable" },
    verification?.ok ? "info" : "error",
  );

  if (verification?.ok) {
    return NextResponse.redirect(
      buildRedirectPath(`${origin}/payment/success`, successParams),
      { status: 303 },
    );
  }

  const executionReason = executionReport
    ? formatExecutionFailure(executionReport)
    : null;

  if (verification) {
    failedParams.set(
      "reason",
      executionReason ??
        formatHyperPayFailureMessage(verification.payload, fallbackReason),
    );
    if (params.id) failedParams.set("checkoutId", params.id);
    if (params.resourcePath) failedParams.set("resourcePath", params.resourcePath);
    return NextResponse.redirect(
      buildRedirectPath(`${origin}/payment/failed`, failedParams),
      { status: 303 },
    );
  }

  if (params.resourcePath || params.id) {
    const reason =
      executionReason ??
      (params.resultCode && !params.resultCode.startsWith("000.")
        ? params.resultDescription?.trim() ||
          `رمز الرفض: ${params.resultCode}`
        : fallbackReason);

    failedParams.set("reason", reason);
    if (params.id) failedParams.set("checkoutId", params.id);
    if (params.resourcePath) failedParams.set("resourcePath", params.resourcePath);
    return NextResponse.redirect(
      buildRedirectPath(`${origin}/payment/failed`, failedParams),
      { status: 303 },
    );
  }

  failedParams.set("reason", fallbackReason);
  return NextResponse.redirect(
    buildRedirectPath(`${origin}/payment/failed`, failedParams),
    { status: 303 },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return handlePaymentCallback(
    {
      orderId: searchParams.get("orderId") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      amount: searchParams.get("amount") ?? undefined,
      resourcePath: searchParams.get("resourcePath") ?? undefined,
      id: searchParams.get("id") ?? undefined,
      resultCode: searchParams.get("resultCode") ?? undefined,
      resultDescription: searchParams.get("resultDescription") ?? undefined,
    },
    request.url,
  );
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  let bodyParams: CallbackSearchParams = {};

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      bodyParams = (await request.json()) as CallbackSearchParams;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      bodyParams = {
        orderId: formData.get("orderId")?.toString(),
        order: formData.get("order")?.toString(),
        amount: formData.get("amount")?.toString(),
        resourcePath: formData.get("resourcePath")?.toString(),
        id: formData.get("id")?.toString(),
        resultCode: formData.get("resultCode")?.toString(),
        resultDescription: formData.get("resultDescription")?.toString(),
      };
    }
  } catch {
    bodyParams = {};
  }

  return handlePaymentCallback(
    {
      orderId: bodyParams.orderId ?? searchParams.get("orderId") ?? undefined,
      order: bodyParams.order ?? searchParams.get("order") ?? undefined,
      amount: bodyParams.amount ?? searchParams.get("amount") ?? undefined,
      resourcePath:
        bodyParams.resourcePath ?? searchParams.get("resourcePath") ?? undefined,
      id: bodyParams.id ?? searchParams.get("id") ?? undefined,
      resultCode:
        bodyParams.resultCode ?? searchParams.get("resultCode") ?? undefined,
      resultDescription:
        bodyParams.resultDescription ??
        searchParams.get("resultDescription") ??
        undefined,
    },
    request.url,
  );
}
