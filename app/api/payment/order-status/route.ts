import { NextResponse } from "next/server";
import { extractFailureReason, isPaymentSuccessful } from "@/lib/payment/status";
import {
  fetchFailedPaymentByOrder,
  fetchOrderStatus,
} from "@/lib/payment/verify-payment";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId") ?? searchParams.get("order");

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const failedPayment = await fetchFailedPaymentByOrder(orderId);
  const orderPayload = failedPayment ? null : await fetchOrderStatus(orderId);
  const payload = failedPayment ?? orderPayload;

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        orderId,
        reason: null,
        hint:
          "Order exists but no failed-payment record was saved. Use company-subscription-orders/{orderId}, not failed-payments/{orderId}.",
      },
      { status: 404 },
    );
  }

  const reason = extractFailureReason(payload);
  const paid = isPaymentSuccessful(payload);

  return NextResponse.json({
    ok: true,
    orderId,
    paid,
    reason,
    source: failedPayment ? "failed-payments" : "company-subscription-order",
    data: payload,
  });
}
