"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Script from "next/script";
import {
  buildHyperPayScriptUrl,
  buildPaymentCallbackUrl,
  parseSupportedBrands,
  resolveBrandsForCheckout,
} from "@/lib/payment/hyperpay";
import type { ResolvedBrands } from "@/lib/payment/brands";
import { configureWpwlOptions, enhanceWidgetDom } from "./hyperpay-dom";
import styles from "./hyperpay-checkout.module.css";
import "./hyperpay-widget.css";

export type HyperPayCheckoutProps = {
  checkoutId: string;
  method?: string;
  brands?: string;
  supportedBrands?: string;
  callbackPath?: string;
  orderId?: string;
  amount?: string;
  className?: string;
};

type WidgetStatus =
  | "idle"
  | "verifying"
  | "loading"
  | "ready"
  | "error"
  | "unsupported";

function cleanupHyperPayWidget(formId: string) {
  document
    .querySelectorAll('script[src*="oppwa.com/v1/paymentWidgets.js"]')
    .forEach((node) => node.remove());

  document.querySelectorAll(".wpwl-wrapper, .wpwl-form").forEach((node) => {
    if (!node.closest(`#${formId}`)) {
      node.remove();
    }
  });

  const form = document.getElementById(formId);
  if (form) form.innerHTML = "";

  if ("wpwlOptions" in window) {
    delete window.wpwlOptions;
  }
}

export function HyperPayCheckout({
  checkoutId,
  method,
  brands,
  supportedBrands,
  callbackPath = "/api/payment/callback",
  orderId,
  amount,
  className,
}: HyperPayCheckoutProps) {
  const formId = useId().replace(/:/g, "");
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<WidgetStatus>("idle");
  const [brandResolution, setBrandResolution] = useState<ResolvedBrands | null>(
    null,
  );
  const [optionsReady, setOptionsReady] = useState(false);
  const [scriptNonce, setScriptNonce] = useState(0);

  const scriptSrc = buildHyperPayScriptUrl(checkoutId);
  const formAction = buildPaymentCallbackUrl(callbackPath, { orderId, amount });

  const fallbackBrands = useMemo(() => {
    if (brands?.trim()) {
      return brands.trim();
    }
    return resolveBrandsForCheckout(method, parseSupportedBrands(supportedBrands))
      .brands;
  }, [brands, method, supportedBrands]);

  const showOverlay = status === "verifying" || status === "loading";
  const isReady = status === "ready";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !checkoutId) return;

    let cancelled = false;

    function bootstrapWidget(resolved: ResolvedBrands) {
      setBrandResolution(resolved);
      configureWpwlOptions(
        () => {
          if (!cancelled) setStatus("ready");
        },
        () => {
          if (!cancelled) setStatus("error");
        },
      );
      setOptionsReady(true);
      setScriptNonce((value) => value + 1);
      setStatus("loading");
    }

    async function verifyBrands() {
      setStatus("verifying");
      setOptionsReady(false);
      cleanupHyperPayWidget(formId);

      try {
        const params = new URLSearchParams({ checkoutId });
        if (method) params.set("method", method);
        if (supportedBrands) params.set("supportedBrands", supportedBrands);

        const response = await fetch(
          `/api/payment/verify-brands?${params.toString()}`,
        );
        const payload = (await response.json()) as ResolvedBrands;

        if (cancelled) return;

        if (!payload.isValid) {
          setBrandResolution(payload);
          setStatus("unsupported");
          return;
        }

        bootstrapWidget(payload);
      } catch {
        if (cancelled) return;
        bootstrapWidget(
          resolveBrandsForCheckout(method, parseSupportedBrands(supportedBrands)),
        );
      }
    }

    verifyBrands();

    return () => {
      cancelled = true;
      cleanupHyperPayWidget(formId);
      setOptionsReady(false);
    };
  }, [checkoutId, formId, method, mounted, supportedBrands]);

  const markWidgetReady = useCallback(() => {
    const root = document.querySelector(".hyperpay-widget-root");
    if (root instanceof HTMLElement) {
      enhanceWidgetDom(root);
    }
    setStatus((current) =>
      current === "error" || current === "unsupported" ? current : "ready",
    );
  }, []);

  const handleScriptReady = useCallback(() => {
    markWidgetReady();

    // HyperPay may render the card form after the script onReady event.
    const root = document.querySelector(".hyperpay-widget-root");
    if (!root) return;

    const observer = new MutationObserver(() => {
      if (root.querySelector(".wpwl-form-card, .wpwl-form-modern")) {
        markWidgetReady();
        observer.disconnect();
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    window.setTimeout(() => {
      markWidgetReady();
      observer.disconnect();
    }, 1500);
  }, [markWidgetReady]);

  const handleScriptError = useCallback(() => {
    setStatus("error");
  }, []);

  const activeBrands = brandResolution?.brands ?? fallbackBrands;

  if (!mounted) {
    return (
      <div className={`${styles.shell} ${className ?? ""}`}>
        <div className={styles.loading} aria-live="polite">
          <span className={styles.spinner} aria-hidden />
          <p>جارٍ تجهيز بوابة الدفع...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.shell} ${styles.widgetShell} hyperpay-widget-root ${className ?? ""} ${isReady ? styles.isReady : ""}`}
    >
      {status !== "unsupported" && status !== "error" && (
        <div className={styles.formCard}>
          <div className={styles.gatewayHeader}>
            <div className={styles.brandPills} aria-hidden>
              <span>VISA</span>
              <span>MADA</span>
              <span>MC</span>
            </div>
            <p className={styles.gatewayHint}>ادخل بيانات بطاقتك لإتمام الدفع</p>
          </div>

          <div
            className={`${styles.overlay} ${showOverlay ? styles.overlayVisible : ""}`}
            aria-live="polite"
            aria-hidden={!showOverlay}
          >
            <span className={styles.spinner} aria-hidden />
            <p>
              {status === "verifying"
                ? "جارٍ التحقق من طرق الدفع..."
                : "جارٍ تحميل نموذج الدفع..."}
            </p>
          </div>

          <form
            id={formId}
            action={formAction}
            className={`paymentWidgets ${styles.widgetForm}`}
            data-brands={activeBrands}
            suppressHydrationWarning
          />
          <p className={styles.secureNote}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x={3} y={11} width={18} height={11} rx={2} />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            الدفع مشفر وآمن
          </p>
        </div>
      )}

      {status === "unsupported" && brandResolution && (
        <div className={styles.error} role="alert">
          <p>طريقة الدفع المختارة غير مدعومة لهذا الطلب.</p>
          <p className={styles.errorDetail}>
            المطلوب: {brandResolution.requested.join(", ")} — المتاح:{" "}
            {brandResolution.supported.join(", ")}
          </p>
        </div>
      )}

      {status === "error" && (
        <div className={styles.error} role="alert">
          <p>تعذّر تحميل بوابة الدفع. يرجى المحاولة مجدداً.</p>
        </div>
      )}

      {optionsReady && status !== "unsupported" && status !== "error" && (
        <Script
          key={`${checkoutId}-${scriptNonce}`}
          id={`hyperpay-widget-${checkoutId}`}
          src={scriptSrc}
          strategy="afterInteractive"
          onReady={handleScriptReady}
          onError={handleScriptError}
        />
      )}
    </div>
  );
}
