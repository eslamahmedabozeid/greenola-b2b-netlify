const UNWANTED_LABELS = [
  "كود الدولة",
  "رقم الجوال",
  "تاريخ الميلاد",
  "country code",
  "mobile",
  "birth",
];

const UNWANTED_TEXT_SNIPPETS = [
  "click to pay",
  "share my card details",
  "billing address and email",
  "installment plan",
  "terms and conditions to proceed",
  "enroll in click to pay",
  "scheme to protect",
];

const UNWANTED_SELECTORS = [
  ".wpwl-container-clickToPay",
  ".wpwl-form-clickToPay",
  '[class*="clickToPay"]',
  '[class*="ClickToPay"]',
  '[class*="src-"]',
  ".wpwl-group-mobile",
  ".wpwl-group-customerMobile",
  ".wpwl-group-birthDate",
  ".wpwl-group-countryCode",
  ".wpwl-group-installment",
  ".wpwl-group-custom",
  'input[name*="installment"]',
  'input[name*="createRegistration"]',
  'input[name*="clickToPay"]',
  'input[name*="ClickToPay"]',
  'input[name*="schemeConsent"]',
  'input[name*="termsAndConditions"]',
].join(",");

function removeNode(node: Element | null | undefined) {
  node?.remove();
}

function hideNode(node: Element | null | undefined) {
  if (node instanceof HTMLElement) {
    node.style.display = "none";
    node.setAttribute("aria-hidden", "true");
  }
}

function stripUnwantedWidgetFields(root: ParentNode) {
  root.querySelectorAll(UNWANTED_SELECTORS).forEach((node) => {
    hideNode(node.closest(".wpwl-group") ?? node);
  });

  root.querySelectorAll(".wpwl-label").forEach((label) => {
    const text = label.textContent?.trim().toLowerCase() ?? "";
    if (UNWANTED_LABELS.some((item) => text.includes(item.toLowerCase()))) {
      hideNode(label.closest(".wpwl-group"));
    }
  });

  root.querySelectorAll("label, p, span, div").forEach((node) => {
    const text = node.textContent?.trim().toLowerCase() ?? "";
    if (!text) return;
    if (
      UNWANTED_TEXT_SNIPPETS.some((snippet) => text.includes(snippet)) ||
      (text.includes("i agree") && text.length > 40)
    ) {
      hideNode(
        node.closest(".wpwl-group") ??
          node.closest(".wpwl-checkbox") ??
          node.closest("label") ??
          node,
      );
    }
  });

  // Keep consent checkboxes in the DOM (HyperPay may require them),
  // but auto-check and leave CSS to hide them.
  root.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    if (checkbox instanceof HTMLInputElement) {
      checkbox.checked = true;
      checkbox.required = false;
      hideNode(
        checkbox.closest(".wpwl-group") ??
          checkbox.closest(".wpwl-checkbox") ??
          checkbox.closest("label"),
      );
    }
  });

  root.querySelectorAll(".wpwl-container").forEach((container) => {
    const isCardContainer =
      container.classList.contains("wpwl-container-card") ||
      container.querySelector(".wpwl-form-card");
    if (!isCardContainer && container instanceof HTMLElement) {
      container.style.display = "none";
    }
  });
}

function forceLtrCardFields(root: ParentNode) {
  const selectors = [
    ".wpwl-group-cardNumber",
    ".wpwl-group-expiry",
    ".wpwl-group-cvv",
    ".wpwl-group-cardHolder",
    ".wpwl-control-cardNumber",
    ".wpwl-control-expiry",
    ".wpwl-control-cvv",
    ".wpwl-control-cardHolder",
    'input[name="card.number"]',
    'input[name="card.expiry"]',
    'input[name="card.cvv"]',
    'input[name="card.holder"]',
    "iframe.wpwl-control",
  ].join(",");

  root.querySelectorAll(selectors).forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    node.setAttribute("dir", "ltr");
    node.style.direction = "ltr";
    node.style.unicodeBidi = "isolate";
    if (node instanceof HTMLInputElement || node.tagName === "IFRAME") {
      node.style.textAlign = "left";
    }
  });
}

function enhanceWidgetDom(root: HTMLElement | null) {
  if (!root) return;

  root.querySelectorAll(".wpwl-form").forEach((form) => {
    form.classList.add("wpwl-form-modern");

    form.querySelectorAll(".wpwl-group-brand .wpwl-label").forEach((node) => {
      (node as HTMLElement).style.display = "none";
    });

    form
      .querySelectorAll(
        ".wpwl-group-brand select, .wpwl-group-brand .wpwl-control-brand",
      )
      .forEach((node) => {
        (node as HTMLElement).style.display = "none";
      });

    form.querySelectorAll(".wpwl-icon, .wpwl-icon-question").forEach((node) => {
      node.remove();
    });

    const expiry = form.querySelector(".wpwl-group-expiry");
    const cvv = form.querySelector(".wpwl-group-cvv");
    if (expiry && cvv && !form.querySelector(".hp-inline-row")) {
      const row = document.createElement("div");
      row.className = "hp-inline-row";
      expiry.parentNode?.insertBefore(row, expiry);
      row.appendChild(expiry);
      row.appendChild(cvv);
    }

    form.querySelectorAll(".wpwl-button-pay").forEach((button) => {
      button.textContent = "ادفع الآن";
    });

    stripUnwantedWidgetFields(form);
    forceLtrCardFields(form);
  });

  stripUnwantedWidgetFields(root);
  forceLtrCardFields(root);
  removeHyperPaySpinners(root);
}

function removeHyperPaySpinners(root: ParentNode) {
  root
    .querySelectorAll(
      ".wpwl-wrapper-spinner, .wpwl-spinner, .wpwl-target, [class*='spinner']",
    )
    .forEach((node) => removeNode(node));
}

function observeWidgetCleanup(root: HTMLElement) {
  let debounceId: ReturnType<typeof setTimeout> | undefined;

  const observer = new MutationObserver(() => {
    if (debounceId) clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      stripUnwantedWidgetFields(root);
      forceLtrCardFields(root);
      removeHyperPaySpinners(root);
    }, 80);
  });

  observer.observe(root, { childList: true, subtree: true });
  return () => {
    if (debounceId) clearTimeout(debounceId);
    observer.disconnect();
  };
}

function configureWpwlOptions(onReady: () => void, onError: () => void) {
  window.wpwlOptions = {
    style: "plain",
    locale: "ar",
    brandDetection: true,
    showCVVHint: false,
    requireCardHolder: true,
    showOneClickWidget: false,
    hideOtherPaymentButton: true,
    paymentTarget: "_top",
    spinner: {
      lines: 0,
      length: 0,
      width: 0,
      radius: 0,
    },
    showLabels: true,
    showPlaceholders: true,
    labels: {
      brand: "",
      cardNumber: "رقم البطاقة",
      expiryDate: "تاريخ الانتهاء",
      cvv: "رمز الأمان",
      cardHolder: "اسم حامل البطاقة",
      submit: "ادفع الآن",
    },
    onReady: () => {
      const root = document.querySelector(".hyperpay-widget-root");
      if (root instanceof HTMLElement) {
        enhanceWidgetDom(root);
        observeWidgetCleanup(root);
      }
      onReady();
    },
    onBeforeSubmitCard: () => {
      const root = document.querySelector(".hyperpay-widget-root");
      root?.querySelectorAll('input[type="checkbox"]').forEach((node) => {
        if (node instanceof HTMLInputElement) {
          node.checked = true;
          node.required = false;
        }
      });
      return true;
    },
    onError: () => {
      onError();
    },
  };
}

export {
  configureWpwlOptions,
  enhanceWidgetDom,
  stripUnwantedWidgetFields,
};
