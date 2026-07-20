import type { Metadata } from "next";
import { PaymentResult } from "@/components/payment/PaymentResult";

export const metadata: Metadata = {
  title: "فشل الدفع — Greenola",
  description: "لم نتمكن من إتمام عملية الدفع",
};

type FailedPageProps = {
  searchParams: Promise<{
    orderId?: string;
    amount?: string;
    reason?: string;
  }>;
};

export default async function PaymentFailedPage({
  searchParams,
}: FailedPageProps) {
  const { orderId, amount, reason } = await searchParams;

  return (
    <PaymentResult
      variant="failed"
      orderId={orderId}
      amount={amount ? `${amount} ر.س` : undefined}
      reason={reason}
    />
  );
}
