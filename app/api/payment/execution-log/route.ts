import { NextResponse } from "next/server";
import { logHyperPayAudit, maskSecrets } from "@/lib/payment/hyperpay-audit";

type ExecutionLogBody = {
  phase: string;
  checkoutId?: string;
  orderId?: string;
  formAction?: string;
  fieldNames?: string[];
  hiddenFields?: Record<string, string>;
  error?: unknown;
  note?: string;
};

export async function POST(request: Request) {
  let body: ExecutionLogBody;

  try {
    body = (await request.json()) as ExecutionLogBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  logHyperPayAudit(
    `payment.execution.client.${body.phase}`,
    maskSecrets(body),
    body.phase.includes("error") ? "error" : "info",
  );

  return NextResponse.json({ ok: true });
}
