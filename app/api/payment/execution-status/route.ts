import { NextResponse } from "next/server";
import {
  fetchPaymentExecutionStatus,
  formatExecutionFailure,
} from "@/lib/payment/execution-audit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resourcePath = searchParams.get("resourcePath") ?? undefined;
  const checkoutId =
    searchParams.get("checkoutId") ??
    searchParams.get("id") ??
    undefined;
  const entityId = searchParams.get("entityId") ?? undefined;

  if (!resourcePath && !checkoutId) {
    return NextResponse.json(
      { error: "resourcePath or checkoutId is required" },
      { status: 400 },
    );
  }

  const report = await fetchPaymentExecutionStatus({
    resourcePath,
    checkoutId,
    entityId,
  });

  if (!report) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Cannot fetch payment execution status. Configure HYPERPAY_ACCESS_TOKEN and HYPERPAY_ENTITY_ID (or HYPERPAY_ENTITY_ID_VISA) in Vercel env.",
        hint: "After Pay, HyperPay redirects with resourcePath. We GET that URL (not POST) to read result.code, parameterErrors, errorFields.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: report.ok,
    summary: formatExecutionFailure(report),
    report,
  });
}
