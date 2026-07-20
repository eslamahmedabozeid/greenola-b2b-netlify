/** Only these HyperPay groups stay visible — everything else is hidden. */
const ALLOWED_GROUP_SUFFIXES = [
  "brand",
  "cardNumber",
  "expiry",
  "cvv",
  "cardHolder",
  "submit",
];

function isAllowedGroup(group: Element): boolean {
  if (!(group instanceof HTMLElement)) return false;

  if (
    group.querySelector(
      ".wpwl-button-pay, .wpwl-control-cardNumber, input[name='card.number'], input[name='card.expiry'], input[name='card.cvv'], input[name='card.holder']",
    )
  ) {
    return true;
  }

  return ALLOWED_GROUP_SUFFIXES.some((suffix) =>
    group.classList.contains(`wpwl-group-${suffix}`),
  );
}

function hideNode(node: Element | null | undefined) {
  if (!(node instanceof HTMLElement)) return;
  node.style.setProperty("display", "none", "important");
  node.setAttribute("aria-hidden", "true");
  node.setAttribute("data-hp-hidden", "1");
}

function prepareHiddenCheckbox(checkbox: Element) {
  if (!(checkbox instanceof HTMLInputElement)) return;
  checkbox.checked = true;
  checkbox.required = false;
  checkbox.setAttribute("aria-hidden", "true");
}

/**
 * Card-only gateway: keep brand / number / expiry / cvv / holder / pay.
 * Auto-check + hide Click to Pay, mobile, DOB, installment consents.
 */
function stripUnwantedWidgetFields(root: ParentNode) {
  const forms = root.querySelectorAll(".wpwl-form-card, .wpwl-form");

  forms.forEach((form) => {
    form.querySelectorAll('input[type="checkbox"]').forEach(prepareHiddenCheckbox);

    form.querySelectorAll(".wpwl-group").forEach((group) => {
      if (isAllowedGroup(group)) return;

      group.querySelectorAll('input[type="checkbox"]').forEach(prepareHiddenCheckbox);
      hideNode(group);
    });
  });

  // Click to Pay / other method containers (siblings of the card form)
  root.querySelectorAll(".wpwl-container").forEach((container) => {
    const isCard =
      container.classList.contains("wpwl-container-card") ||
      Boolean(container.querySelector(".wpwl-form-card, .wpwl-group-cardNumber"));
    if (!isCard) hideNode(container);
  });

  root
    .querySelectorAll(
      ".wpwl-container-clickToPay, .wpwl-form-clickToPay, .wpwl-form-virtualAccount",
    )
    .forEach((node) => hideNode(node));
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
      (node as HTMLElement).style.display = "none";
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
    .querySelectorAll(".wpwl-wrapper-spinner, .wpwl-spinner")
    .forEach((node) => {
      if (node instanceof HTMLElement) {
        node.style.display = "none";
      }
    });
}

function observeWidgetCleanup(root: HTMLElement) {
  let debounceId: ReturnType<typeof setTimeout> | undefined;
  let enhancing = false;

  const observer = new MutationObserver(() => {
    if (enhancing) return;
    if (debounceId) clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      enhancing = true;
      try {
        enhanceWidgetDom(root);
      } finally {
        enhancing = false;
      }
    }, 120);
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
        prepareHiddenCheckbox(node);
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
