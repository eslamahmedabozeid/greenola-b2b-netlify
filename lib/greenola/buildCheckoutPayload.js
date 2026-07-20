import { getMealConfigLabels, getPlanLabels, t } from "./i18n";

function roundMoney(value) {
  return +Number(value).toFixed(2);
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

  return {
    company_info: {
      company_name: state.lead.company_name || "",
      company_code: state.companyCode || "",
      contact_name: state.lead.full_name || "",
      mobile_number: state.lead.phone || "",
      email,
    },
    package_selection: {
      package_text: planMeta.name,
      variation_text: mealLabel,
      duration_text: t("duration_days_label", { days }),
      package_price: exclusive,
      vat_amount: vat,
      final_amount: inclusive,
    },
    delivery_details: {
      start_date: state.startDate,
      building_name: address.building || "",
      floor: address.floor || "",
      office_number: address.office || "",
      notes: address.notes || "",
    },
  };
}
