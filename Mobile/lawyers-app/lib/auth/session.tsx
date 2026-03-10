import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "eln_mobile_token";
const PROFILE_KEY = "eln_mobile_profile";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://egyptianlawyers-001-site1.stempurl.com";

type LoginRequest = {
  email: string;
  password: string;
};

// Mirrors the backend LoginResult record (camelCase after JSON serialisation).
type LoginResponse = {
  token?: string;
  accessToken?: string;
  fullName?: string;
  role?: string;
  lawyerId?: string | null;
  email?: string;
  isVerified?: boolean;
  isSuspended?: boolean;
  // Some backends wrap the payload under a "data" envelope.
  data?: {
    token?: string;
    accessToken?: string;
    fullName?: string;
    role?: string;
    lawyerId?: string | null;
    email?: string;
    isVerified?: boolean;
    isSuspended?: boolean;
  };
};

export type AuthProfile = {
  fullName: string;
  email: string;
  role: string;
  lawyerId: string | null;
  isVerified: boolean;
  isSuspended: boolean;
};

type SessionContextValue = {
  isHydrated: boolean;
  token: string | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
  signIn: (credentials: LoginRequest) => Promise<AuthProfile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function extractToken(payload: LoginResponse): string | null {
  return payload.token ?? payload.accessToken ?? payload.data?.token ?? payload.data?.accessToken ?? null;
}

function extractProfile(payload: LoginResponse, emailFallback: string): AuthProfile {
  const role = payload.role ?? payload.data?.role ?? "Lawyer";
  return {
    fullName: payload.fullName ?? payload.data?.fullName ?? emailFallback,
    role,
    lawyerId: payload.lawyerId ?? payload.data?.lawyerId ?? null,
    email: payload.email ?? payload.data?.email ?? emailFallback,
    // Admins are always verified and never suspended.
    isVerified: payload.isVerified ?? payload.data?.isVerified ?? role === "Admin",
    isSuspended: payload.isSuspended ?? payload.data?.isSuspended ?? false,
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

  const refreshProfile = async () => {
    const accessToken = token ?? (await SecureStore.getItemAsync(TOKEN_KEY));
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/lawyers/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) return;

      const data = (await response.json()) as {
        id: string;
        fullName: string;
        isVerified: boolean;
        isSuspended: boolean;
      };
      const current = await SecureStore.getItemAsync(PROFILE_KEY);
      const parsed = current ? (JSON.parse(current) as AuthProfile) : null;
      const nextProfile: AuthProfile = {
        fullName: data.fullName ?? parsed?.fullName ?? "",
        email: parsed?.email ?? "",
        role: parsed?.role ?? "Lawyer",
        lawyerId: data.id ?? parsed?.lawyerId ?? null,
        isVerified: data.isVerified ?? parsed?.isVerified ?? false,
        isSuspended: data.isSuspended ?? parsed?.isSuspended ?? false,
      };
      await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(nextProfile));
      setProfile(nextProfile);
    } catch {
      // Silently ignore — refresh is best-effort
    }
  };

  // Refresh profile when app comes to foreground (e.g. after admin approves)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void refreshProfile();
      }
    });
    return () => subscription.remove();
  }, []);

  const signIn = async ({ email, password }: LoginRequest) => {
    console.info(`[Auth] POST ${API_BASE_URL}/api/auth/login  email=${email}`);

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
    } catch (networkErr) {
      // fetch() itself throws on network failure (no connection, DNS failure,
      // Android cleartext HTTP blocked, etc.)
      console.error("[Auth] Network error during login:", networkErr);
      throw new Error(
        `Network error — cannot reach the server.\n` +
          `URL: ${API_BASE_URL}\n` +
          `Detail: ${String(networkErr)}`
      );
    }

    console.info(`[Auth] Response status: ${response.status}`);

    if (!response.ok) {
      // Read the error body so we can show the real validation message.
      let serverMessage = `HTTP ${response.status}`;
      try {
        const errorBody = await response.json();
        // ASP.NET Core ProblemDetails shape: { title, detail, errors: {....} }
        serverMessage =
          errorBody?.detail ??
          errorBody?.title ??
          Object.values(errorBody?.errors ?? {}).flat().join(" ") ??
          serverMessage;
      } catch {
        // body wasn't JSON — keep the HTTP status string
      }
      console.error(`[Auth] Login failed: ${serverMessage}`);
      throw new Error(serverMessage);
    }

    const data = (await response.json()) as LoginResponse;
    const accessToken = extractToken(data);

    if (!accessToken) {
      console.error("[Auth] Server returned OK but no token in response:", data);
      throw new Error("Server returned no token. Contact support.");
    }

    const nextProfile = extractProfile(data, email);
    console.info(`[Auth] Login success — role=${nextProfile.role}, verified=${nextProfile.isVerified}`);

    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(nextProfile)),
    ]);

    setToken(accessToken);
    setProfile(nextProfile);
    return nextProfile;
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
      refreshProfile,
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
