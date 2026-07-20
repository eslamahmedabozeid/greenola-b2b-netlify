"use client";

import Link from "next/link";
import { HyperPayCheckout } from "@/components/payment/HyperPayCheckout";
import { extractCheckoutId } from "@/lib/payment/hyperpay";
import styles from "./payment-webview.module.css";

type PaymentWebViewProps = {
  paymentUrl?: string;
  checkoutId?: string;
  orderId?: string;
  amount?: string;
  method?: string;
  supportedBrands?: string;
};

export function PaymentWebView({
  paymentUrl,
  checkoutId,
  orderId,
  amount,
  method,
  supportedBrands,
}: PaymentWebViewProps) {
  const resolvedCheckoutId = extractCheckoutId(checkoutId, paymentUrl);

  if (!resolvedCheckoutId) {
    return (
      <main className={styles.page}>
        <div className={styles.errorCard}>
          <h1>تعذّر فتح بوابة الدفع</h1>
          <p>معرّف الدفع غير متوفر. يرجى المحاولة مرة أخرى.</p>
          <Link href="/payment/failed" className={styles.backBtn}>
            العودة
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.webview}>
        <header className={styles.header}>
          <Link href="/" className={styles.closeBtn} aria-label="إغلاق">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <div className={styles.headerText}>
            <span className={styles.headerEyebrow}>Greenola</span>
            <h1 className={styles.headerTitle}>إتمام الدفع</h1>
          </div>
          <div className={styles.headerSpacer} aria-hidden />
        </header>

        <div className={styles.summary}>
          {orderId && (
            <div className={styles.summaryRow}>
              <span>رقم الطلب</span>
              <strong>{orderId}</strong>
            </div>
          )}
          {amount && (
            <div className={styles.summaryRow}>
              <span>المبلغ</span>
              <strong>{amount} ر.س</strong>
            </div>
          )}
        </div>

        <section className={styles.widgetPanel}>
          <HyperPayCheckout
            checkoutId={resolvedCheckoutId}
            method={method}
            supportedBrands={supportedBrands}
            orderId={orderId}
            amount={amount}
          />
        </section>

        <footer className={styles.footer}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x={3} y={11} width={18} height={11} rx={2} />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span>دفع آمن ومشفر</span>
        </footer>
      </div>
    </main>
  );
}
