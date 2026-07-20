function resolveBackendApiKey(): string {
  return (
    process.env.GREENOLA_API_KEY?.trim() ||
    process.env.GREENOLA_BACKEND_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_API_KEY?.trim() ||
    ""
  );
}

function resolveB2BToken(): string {
  return process.env.GREENOLA_B2B_TOKEN?.trim() || "";
}

function isCheckoutAuthConfigured(): boolean {
  return Boolean(resolveBackendApiKey() && resolveB2BToken());
}

function getCheckoutAuthConfigError(): string {
  if (process.env.NODE_ENV === "development") {
    return "Checkout auth not configured. Set GREENOLA_API_KEY and GREENOLA_B2B_TOKEN in .env.local, then restart the dev server.";
  }

  return "Payment service is temporarily unavailable. Please contact support.";
}

export {
  getCheckoutAuthConfigError,
  isCheckoutAuthConfigured,
  resolveBackendApiKey,
  resolveB2BToken,
};
