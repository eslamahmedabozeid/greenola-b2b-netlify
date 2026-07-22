import { getMealConfigLabels, getPlanLabels, t } from "./i18n";

function roundMoney(value) {
  return Number(Number(value).toFixed(2));
}

function formatAmountString(value) {
  return Number(value).toFixed(2);
}

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { givenName: "Customer", surname: "Greenola" };
  if (parts.length === 1) return { givenName: parts[0], surname: parts[0] };
  return { givenName: parts[0], surname: parts.slice(1).join(" ") };
}

function vatBreakdown(inclusiveAmount) {
  const inclusive = roundMoney(inclusiveAmount);
  const exclusive = roundMoney(inclusive / 1.15);
  const vat = roundMoney(inclusive - exclusive);
  return { exclusive, vat, inclusive };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function buildCheckoutPayload(state, pricing) {
  if (!state?.lead || !pricing || !state.startDate) {
    throw new Error("Missing checkout data");
  }

  const email = state.lead.email?.trim().toLowerCase() || "";
  if (!isValidEmail(email)) {
    throw new Error(t("login_email_invalid"));
  }

  const planMeta = getPlanLabels()[state.selectedPlan] || {
    name: t("plan_fallback"),
  };
  const mealLabel = getMealConfigLabels()[state.mealConfig] || "";
  const days = state.selectedDuration || 0;
  const userPays = pricing.userPays ?? pricing.afterDiscount ?? pricing.baseTotal;
  const { exclusive, vat, inclusive } = vatBreakdown(userPays);
  const address = state.deliveryAddress || {};
  const { givenName, surname } = splitName(state.lead.full_name);
  const street1 =
    [address.building, address.floor, address.office].filter(Boolean).join(", ") ||
    "Riyadh Office";

  return {
    company_info: {
      company_name: state.lead.company_name || "",
      company_code: state.companyCode || "",
      contact_name: state.lead.full_name || "",
      mobile_number: state.lead.phone || "",
      email,
    },
    customer_info: {
      given_name: givenName,
      surname,
      email,
      mobile_number: state.lead.phone || "",
    },
    package_selection: {
      package_text: planMeta.name,
      variation_text: mealLabel,
      duration_text: t("duration_days_label", { days }),
      package_price: formatAmountString(exclusive),
      vat_amount: formatAmountString(vat),
      final_amount: formatAmountString(inclusive),
    },
    billing_info: {
      street1,
      city: "Riyadh",
      state: "Riyadh",
      country: "SA",
      postcode: "00000",
    },
    delivery_details: {
      start_date: state.startDate,
      building_name: address.building || "",
      floor: address.floor || "",
      office_number: address.office || "",
      notes: address.notes || "",
    },
    payment_method: state.selectedPaymentMethod || "card",
  };
}
