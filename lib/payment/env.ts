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

export { resolveBackendApiKey, resolveB2BToken };
