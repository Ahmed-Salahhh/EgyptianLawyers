"use client";

const AUTH_TOKEN_KEY = "eln_admin_token";
const AUTH_USER_KEY = "eln_admin_user";
const AUTH_CHANGED_EVENT = "eln-auth-changed";

export type StoredAuthUser = {
  fullName?: string | null;
  email?: string | null;
  role?: string | null;
  lawyerId?: string | null;
};

function notifyAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function subscribeAuthChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = () => callback();
  const onAuthChanged = () => callback();

  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  };
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  notifyAuthChanged();
}

export function getStoredAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuthUser;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAuthUser(user: StoredAuthUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  notifyAuthChanged();
}
