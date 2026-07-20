import { NextResponse } from "next/server";

type CallbackSearchParams = {
  orderId?: string;
  amount?: string;
  resourcePath?: string;
  id?: string;
};

function buildRedirectPath(basePath: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callbackParams: CallbackSearchParams = {
    orderId: searchParams.get("orderId") ?? undefined,
    amount: searchParams.get("amount") ?? undefined,
    resourcePath: searchParams.get("resourcePath") ?? undefined,
    id: searchParams.get("id") ?? undefined,
  };

  return handlePaymentCallback(callbackParams, request.url);
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
        amount: formData.get("amount")?.toString(),
        resourcePath: formData.get("resourcePath")?.toString(),
        id: formData.get("id")?.toString(),
      };
    }
  } catch {
    bodyParams = {};
  }

  return handlePaymentCallback(
    {
      orderId: bodyParams.orderId ?? searchParams.get("orderId") ?? undefined,
      amount: bodyParams.amount ?? searchParams.get("amount") ?? undefined,
      resourcePath:
        bodyParams.resourcePath ?? searchParams.get("resourcePath") ?? undefined,
      id: bodyParams.id ?? searchParams.get("id") ?? undefined,
    },
    request.url,
  );
}

function handlePaymentCallback(params: CallbackSearchParams, requestUrl: string) {
  const successParams = new URLSearchParams();
  if (params.orderId) successParams.set("orderId", params.orderId);
  if (params.amount) successParams.set("amount", params.amount);

  const origin = new URL(requestUrl).origin;
  const hasPaymentReference = !!(params.resourcePath || params.id);

  if (hasPaymentReference) {
    return NextResponse.redirect(
      buildRedirectPath(`${origin}/payment/success`, successParams),
      { status: 303 },
    );
  }

  const failedParams = new URLSearchParams(successParams);
  failedParams.set("reason", "لم يتم تأكيد الدفع");
  return NextResponse.redirect(
    buildRedirectPath(`${origin}/payment/failed`, failedParams),
    { status: 303 },
  );
}
