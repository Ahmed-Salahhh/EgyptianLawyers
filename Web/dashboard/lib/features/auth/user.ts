"use client";

export type AuthUser = {
  name: string;
  email: string;
  role: string;
};

type JwtPayload = Record<string, unknown>;

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function decodeBase64Url(value: string): string | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = normalized.length % 4;
  const padded = normalized + (padLength ? "=".repeat(4 - padLength) : "");

  try {
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      return window.atob(padded);
    }

    return null;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) return null;

  try {
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

function pickString(payload: JwtPayload, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function pickRole(payload: JwtPayload): string | null {
  const candidates = [payload["role"], payload[ROLE_CLAIM], payload["roles"]];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }

    if (Array.isArray(candidate)) {
      const firstRole = candidate.find(
        (value): value is string => typeof value === "string" && value.trim().length > 0,
      );
      if (firstRole) return firstRole;
    }
  }

  return null;
}

function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function parseAuthUserFromToken(
  token: string | null,
  fallbackRole: string,
): AuthUser {
  if (!token) {
    return {
      name: "Admin",
      email: "-",
      role: fallbackRole,
    };
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return {
      name: "Admin",
      email: "-",
      role: fallbackRole,
    };
  }

  const rawName = pickString(payload, ["name", "fullName", "given_name"]);
  const rawEmail = pickString(payload, ["email", "upn", "unique_name", "preferred_username"]);

  const nameCandidate = rawName?.trim() ?? "";
  const safeName = !nameCandidate || looksLikeUuid(nameCandidate) ? "Admin" : nameCandidate;
  const email = rawEmail && looksLikeEmail(rawEmail) ? rawEmail : "-";
  const role = pickRole(payload) ?? fallbackRole;

  return { name: safeName, email, role };
}
