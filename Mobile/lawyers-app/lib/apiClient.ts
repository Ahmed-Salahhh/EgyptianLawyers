/**
 * Central fetch wrapper that handles 401/403 with auto-logout.
 * Use this for all authenticated API calls.
 */

type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let logoutInProgress = false;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function hasAuthHeader(options?: RequestInit): boolean {
  if (!options?.headers) return false;
  const h = options.headers;
  if (h instanceof Headers) return !!h.get("Authorization");
  if (typeof h === "object" && h !== null) return !!(h as Record<string, string>)["Authorization"];
  return false;
}

/**
 * Fetch wrapper that triggers auto-logout on 401/403 when the request
 * included an Authorization header (authenticated request).
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);

  if ((response.status === 401 || response.status === 403) && hasAuthHeader(init)) {
    if (!logoutInProgress && unauthorizedHandler) {
      logoutInProgress = true;
      try {
        await Promise.resolve(unauthorizedHandler());
      } finally {
        logoutInProgress = false;
      }
    }
    throw new Error("Session expired. Please sign in again.");
  }

  return response;
}
