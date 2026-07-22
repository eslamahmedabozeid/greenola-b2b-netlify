/** HyperPay requires amounts as strings with exactly 2 decimal places. */
function formatHyperPayAmount(value: unknown): string {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Invalid HyperPay amount: ${String(value)}`);
  }
  return amount.toFixed(2);
}

function splitCustomerName(fullName: string): {
  givenName: string;
  surname: string;
} {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { givenName: "Customer", surname: "Greenola" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { givenName: parts[0], surname: parts[0] };
  }

  return {
    givenName: parts[0],
    surname: parts.slice(1).join(" "),
  };
}

function normalizeCountryCode(value: string | undefined): string {
  const country = (value ?? "").trim().toUpperCase();
  if (!country || country === "SAUDI ARABIA" || country === "KSA") {
    return "SA";
  }
  return country.length === 2 ? country : "SA";
}

function buildBillingStreet(delivery: {
  building_name?: string;
  floor?: string;
  office_number?: string;
  notes?: string;
}): string {
  const street = [
    delivery.building_name?.trim(),
    delivery.floor ? `Floor ${delivery.floor.trim()}` : "",
    delivery.office_number ? `Office ${delivery.office_number.trim()}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return street || "Riyadh Office";
}

function assertHttpsShopperResultUrl(url: string, origin: string): string {
  const parsed = new URL(url, origin);

  if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new Error(
      `shopperResultUrl must be HTTPS. Received: ${parsed.toString()}`,
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
  ) {
    throw new Error(
      "shopperResultUrl cannot be localhost in production HyperPay checkout.",
    );
  }

  return parsed.toString();
}

export {
  assertHttpsShopperResultUrl,
  buildBillingStreet,
  formatHyperPayAmount,
  normalizeCountryCode,
  splitCustomerName,
};
