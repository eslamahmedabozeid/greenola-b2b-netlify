import type { Metadata } from "next";
import { PaymentWebView } from "@/components/payment/PaymentWebView";

export const metadata: Metadata = {
  title: "إتمام الدفع — Greenola",
  description: "أكمل عملية الدفع بشكل آمن",
};

type CheckoutPageProps = {
  searchParams: Promise<{
    paymentUrl?: string;
    checkoutId?: string;
    orderId?: string;
    amount?: string;
    method?: string;
    supportedBrands?: string;
  }>;
};

export default async function PaymentCheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const params = await searchParams;

  return (
    <PaymentWebView
      paymentUrl={params.paymentUrl}
      checkoutId={params.checkoutId}
      orderId={params.orderId}
      amount={params.amount}
      method={params.method}
      supportedBrands={params.supportedBrands}
    />
  );
}
