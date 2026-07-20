import { redirect } from "next/navigation";

type PaymentResultPageProps = {
  searchParams: Promise<{
    orderId?: string;
    amount?: string;
    resourcePath?: string;
    id?: string;
  }>;
};

export default async function PaymentResultPage({
  searchParams,
}: PaymentResultPageProps) {
  const params = await searchParams;
  const successParams = new URLSearchParams();

  if (params.orderId) successParams.set("orderId", params.orderId);
  if (params.amount) successParams.set("amount", params.amount);

  if (params.resourcePath || params.id) {
    redirect(`/payment/success?${successParams.toString()}`);
  }

  const failedParams = new URLSearchParams(successParams);
  failedParams.set("reason", "لم يتم تأكيد الدفع");
  redirect(`/payment/failed?${failedParams.toString()}`);
}
