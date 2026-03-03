"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getAuthToken,
  getStoredAuthUser,
  subscribeAuthChange,
} from "./token";
import { parseAuthUserFromToken, type AuthUser } from "./user";

function buildAuthUserSnapshot(fallbackRole: string): AuthUser {
  const tokenUser = parseAuthUserFromToken(getAuthToken(), fallbackRole);
  const storedUser = getStoredAuthUser();

  return {
    name: storedUser?.fullName?.trim() || tokenUser.name,
    email: storedUser?.email?.trim() || tokenUser.email,
    role: storedUser?.role?.trim() || tokenUser.role,
  };
}

function createSnapshotReader(fallbackRole: string) {
  let lastKey = "";
  let lastValue: AuthUser = { name: "Admin", email: "-", role: fallbackRole };

  return () => {
    const token = getAuthToken() ?? "";
    const stored = getStoredAuthUser();
    const storedKey = stored ? JSON.stringify(stored) : "";
    const nextKey = `${fallbackRole}|${token}|${storedKey}`;

    if (nextKey === lastKey) {
      return lastValue;
    }

    lastKey = nextKey;
    lastValue = buildAuthUserSnapshot(fallbackRole);
    return lastValue;
  };
}

export function useAuthUser(fallbackRole: string): AuthUser {
  const fallbackUser = useMemo<AuthUser>(
    () => ({ name: "Admin", email: "-", role: fallbackRole }),
    [fallbackRole],
  );

  const getSnapshot = useMemo(() => createSnapshotReader(fallbackRole), [fallbackRole]);

  return useSyncExternalStore(subscribeAuthChange, getSnapshot, () => fallbackUser);
}
