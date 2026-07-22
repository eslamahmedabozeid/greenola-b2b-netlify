/** Only these HyperPay groups stay visible — everything else is hidden. */
const ALLOWED_GROUP_SUFFIXES = [
  "brand",
  "cardNumber",
  "expiry",
  "cvv",
  "cardHolder",
  "submit",
];

type PaymentExecutionContext = {
  checkoutId: string;
  orderId?: string;
  billing?: {
    street1?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  customer?: {
    givenName?: string;
    surname?: string;
    email?: string;
    mobile?: string;
  };
};

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

async function postExecutionLog(payload: Record<string, unknown>) {
  try {
    await fetch("/api/payment/execution-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Best-effort client logging only.
  }
}

let paymentFormObserverInstalled = false;

/**
 * HyperPay card payments use native HTML form POST (form.submit()), not fetch/XHR.
 * See oppwa static.min.js: ge.submitForm -> e.submit(), action=ge.endPoint.
 */
function installPaymentFormSubmitObserver(ctx: PaymentExecutionContext) {
  if (paymentFormObserverInstalled) return;
  paymentFormObserverInstalled = true;

  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.classList.contains("wpwl-form-card") && !form.matches('[data-action="submit-payment-card"]')) {
        return;
      }

      void postExecutionLog({
        phase: "widget.formSubmit",
        checkoutId: ctx.checkoutId,
        orderId: ctx.orderId,
        method: form.method,
        formAction: form.action,
        formTarget: form.target,
        fieldNames: collectFormFieldNames(form),
        note: "Native HTML form POST to HyperPay — inspect this URL in DevTools Network (Doc type, not XHR)",
      });
    },
    true,
  );
}

function injectExecutionFields(
  form: HTMLFormElement,
  ctx: PaymentExecutionContext,
): Record<string, string> {
  const fields: Record<string, string> = {};

  if (ctx.billing) {
    if (ctx.billing.street1) fields["billing.street1"] = ctx.billing.street1;
    if (ctx.billing.city) fields["billing.city"] = ctx.billing.city;
    if (ctx.billing.state) fields["billing.state"] = ctx.billing.state;
    if (ctx.billing.country) fields["billing.country"] = ctx.billing.country;
    if (ctx.billing.postcode) fields["billing.postcode"] = ctx.billing.postcode;
  }

  if (ctx.customer) {
    if (ctx.customer.givenName) fields["customer.givenName"] = ctx.customer.givenName;
    if (ctx.customer.surname) fields["customer.surname"] = ctx.customer.surname;
    if (ctx.customer.email) fields["customer.email"] = ctx.customer.email;
    if (ctx.customer.mobile) fields["customer.mobile"] = ctx.customer.mobile;
  }

  for (const [name, value] of Object.entries(fields)) {
    let input = form.querySelector(
      `input[name="${CSS.escape(name)}"]`,
    ) as HTMLInputElement | null;

    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }

    input.value = value;
  }

  return fields;
}

function collectFormFieldNames(form: Element): string[] {
  return Array.from(form.querySelectorAll("input, select, textarea"))
    .map((node) => (node as HTMLInputElement).name)
    .filter(Boolean);
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

function configureWpwlOptions(
  ctx: PaymentExecutionContext,
  onReady: () => void,
  onError: () => void,
) {
  installPaymentFormSubmitObserver(ctx);

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

        root.querySelectorAll("form.paymentWidgets, .wpwl-form").forEach((node) => {
          if (node instanceof HTMLFormElement) {
            const hiddenFields = injectExecutionFields(node, ctx);
            void postExecutionLog({
              phase: "widget.ready",
              checkoutId: ctx.checkoutId,
              orderId: ctx.orderId,
              formAction: node.action,
              fieldNames: collectFormFieldNames(node),
              hiddenFields,
            });
          }
        });

        observeWidgetCleanup(root);
      }

      onReady();
    },
    onBeforeSubmitCard: () => {
      const root = document.querySelector(".hyperpay-widget-root");
      root?.querySelectorAll('input[type="checkbox"]').forEach((node) => {
        prepareHiddenCheckbox(node);
      });

      const forms = root?.querySelectorAll("form.paymentWidgets, .wpwl-form") ?? [];
      forms.forEach((node) => {
        if (!(node instanceof HTMLFormElement)) return;
        const hiddenFields = injectExecutionFields(node, ctx);
        void postExecutionLog({
          phase: "widget.beforeSubmit",
          checkoutId: ctx.checkoutId,
          orderId: ctx.orderId,
          formAction: node.action,
          fieldNames: collectFormFieldNames(node),
          hiddenFields,
          note: "Fields present immediately before HyperPay native form POST (onBeforeSubmitCard)",
        });
      });

      return true;
    },
    onError: (error: unknown) => {
      void postExecutionLog({
        phase: "widget.error",
        checkoutId: ctx.checkoutId,
        orderId: ctx.orderId,
        error,
      });
      onError();
    },
  };
}

export {
  configureWpwlOptions,
  enhanceWidgetDom,
  stripUnwantedWidgetFields,
  type PaymentExecutionContext,
};
