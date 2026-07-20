import type { Metadata } from "next";
import { PaymentResult } from "@/components/payment/PaymentResult";

export const metadata: Metadata = {
  title: "تم الدفع بنجاح — Greenola",
  description: "تم تأكيد دفع اشتراك Greenola بنجاح",
};

type SuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
    amount?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { orderId, amount } = await searchParams;

  return (
    <PaymentResult
      variant="success"
      orderId={orderId}
      amount={amount ? `${amount} ر.س` : undefined}
    />
  );
}
