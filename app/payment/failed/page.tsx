import type { Metadata } from "next";
import { PaymentResult } from "@/components/payment/PaymentResult";
import {
  fetchPaymentExecutionStatus,
  formatExecutionFailure,
} from "@/lib/payment/execution-audit";
import { extractFailureReason } from "@/lib/payment/status";
import {
  fetchFailedPaymentByOrder,
  fetchOrderStatus,
} from "@/lib/payment/verify-payment";

export const metadata: Metadata = {
  title: "فشل الدفع — Greenola",
  description: "لم نتمكن من إتمام عملية الدفع",
};

type FailedPageProps = {
  searchParams: Promise<{
    orderId?: string;
    order?: string;
    amount?: string;
    reason?: string;
    checkoutId?: string;
    resourcePath?: string;
    id?: string;
  }>;
};

export default async function PaymentFailedPage({
  searchParams,
}: FailedPageProps) {
  const params = await searchParams;
  const orderId = params.orderId ?? params.order;
  let reason = params.reason;

  if (!reason) {
    const executionReport = await fetchPaymentExecutionStatus({
      resourcePath: params.resourcePath,
      checkoutId: params.checkoutId ?? params.id,
    });

    if (executionReport) {
      reason = formatExecutionFailure(executionReport);
    }
  }

  if (!reason && orderId) {
    const failedPayment = await fetchFailedPaymentByOrder(orderId);
    const orderPayload = failedPayment ? null : await fetchOrderStatus(orderId);
    reason =
      extractFailureReason(failedPayment ?? orderPayload) ?? undefined;
  }

  return (
    <PaymentResult
      variant="failed"
      orderId={orderId}
      amount={params.amount ? `${params.amount} ر.س` : undefined}
      reason={reason}
    />
  );
}
