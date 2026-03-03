import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "eln_mobile_token";
const PROFILE_KEY = "eln_mobile_profile";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://egyptianlawyers-001-site1.stempurl.com";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token?: string;
  accessToken?: string;
  fullName?: string;
  role?: string;
  lawyerId?: string | null;
  email?: string;
  data?: {
    token?: string;
    accessToken?: string;
    fullName?: string;
    role?: string;
    lawyerId?: string | null;
    email?: string;
  };
};

export type AuthProfile = {
  fullName: string;
  email: string;
  role: string;
  lawyerId: string | null;
};

type SessionContextValue = {
  isHydrated: boolean;
  token: string | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function extractToken(payload: LoginResponse): string | null {
  return payload.token ?? payload.accessToken ?? payload.data?.token ?? payload.data?.accessToken ?? null;
}

function extractProfile(payload: LoginResponse, emailFallback: string): AuthProfile {
  return {
    fullName: payload.fullName ?? payload.data?.fullName ?? "Admin",
    role: payload.role ?? payload.data?.role ?? "Admin",
    lawyerId: payload.lawyerId ?? payload.data?.lawyerId ?? null,
    email: payload.email ?? payload.data?.email ?? emailFallback,
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [storedToken, storedProfile] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(PROFILE_KEY),
      ]);

      if (!mounted) return;

      setToken(storedToken);
      if (storedProfile) {
        try {
          setProfile(JSON.parse(storedProfile) as AuthProfile);
        } catch {
          setProfile(null);
        }
      }
      setIsHydrated(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async ({ email, password }: LoginRequest) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("LOGIN_FAILED");
    }

    const data = (await response.json()) as LoginResponse;
    const accessToken = extractToken(data);

    if (!accessToken) {
      throw new Error("MISSING_TOKEN");
    }

    const nextProfile = extractProfile(data, email);

    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(nextProfile)),
    ]);

    setToken(accessToken);
    setProfile(nextProfile);
  };

  const signOut = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(PROFILE_KEY),
    ]);

    setToken(null);
    setProfile(null);
  };

  const value = useMemo<SessionContextValue>(
    () => ({
      isHydrated,
      token,
      profile,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [isHydrated, token, profile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
