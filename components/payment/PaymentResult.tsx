import Link from "next/link";
import styles from "./payment.module.css";

type PaymentResultProps = {
  variant: "success" | "failed";
  orderId?: string;
  amount?: string;
  reason?: string;
};

const content = {
  success: {
    title: "تم الدفع بنجاح",
    subtitle: "شكراً لك! تم تأكيد اشتراكك بنجاح.",
    detail: "سنبدأ بإعداد وجبات فريقك قريباً. ستصلك رسالة تأكيد على جوالك.",
    primaryLabel: "العودة للرئيسية",
    primaryHref: "/",
    secondaryLabel: "تحميل الإيصال",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  failed: {
    title: "فشل الدفع",
    subtitle: "لم نتمكن من إتمام عملية الدفع.",
    detail: "تحقق من بيانات البطاقة أو رصيدك، ثم حاول مرة أخرى. لم يتم خصم أي مبلغ.",
    primaryLabel: "إعادة المحاولة",
    primaryHref: "/",
    secondaryLabel: "تواصل مع الدعم",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
} as const;

export function PaymentResult({
  variant,
  orderId,
  amount,
  reason,
}: PaymentResultProps) {
  const copy = content[variant];
  const detail =
    variant === "failed" && reason ? reason : copy.detail;

  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden />

      <div className={styles.card}>
        <div className={styles.logoRow}>
          <span className={styles.logoMark}>G</span>
          <span className={styles.logoText}>Greenola</span>
        </div>

        <div
          className={`${styles.iconWrap} ${styles[variant]}`}
          role="img"
          aria-label={variant === "success" ? "نجاح" : "فشل"}
        >
          {copy.icon}
        </div>

        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>
        <p className={styles.detail}>{detail}</p>

        {(orderId || amount) && (
          <dl className={styles.meta}>
            {orderId && (
              <div className={styles.metaRow}>
                <dt>رقم الطلب</dt>
                <dd>{orderId}</dd>
              </div>
            )}
            {amount && (
              <div className={styles.metaRow}>
                <dt>المبلغ</dt>
                <dd>{amount}</dd>
              </div>
            )}
          </dl>
        )}

        <div className={styles.actions}>
          <Link href={copy.primaryHref} className={styles.primaryBtn}>
            {copy.primaryLabel}
          </Link>
          <Link href="/" className={styles.secondaryBtn}>
            {copy.secondaryLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
