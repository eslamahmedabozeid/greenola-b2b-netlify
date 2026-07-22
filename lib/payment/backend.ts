import { resolveBackendApiKey, resolveB2BToken } from "./env";

const BACKEND_URL =
  process.env.GREENOLA_BACKEND_URL ??
  "https://backend-dev.greenolasa.com";

function getBackendHeaders(contentType = "application/json"): Record<string, string> {
  const apiKey = resolveBackendApiKey();
  const b2bToken = resolveB2BToken();
  const apiKeyHeader =
    process.env.GREENOLA_BACKEND_API_KEY_HEADER ?? "x-api-key";

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (apiKey) {
    headers[apiKeyHeader] = apiKey;
  }

  if (b2bToken) {
    headers.Authorization = `Bearer ${b2bToken}`;
  }

  return headers;
}

async function parseJsonResponse(response: Response): Promise<unknown | null> {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { message: raw.slice(0, 300) };
  }
}

export { BACKEND_URL, getBackendHeaders, parseJsonResponse };
