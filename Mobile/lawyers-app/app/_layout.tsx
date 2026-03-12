import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, type ErrorBoundaryProps } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { setUnauthorizedHandler } from "@/lib/apiClient";
import { useSession, SessionProvider } from "@/lib/auth/session";
import { ThemeProvider } from "@/lib/ThemeContext";
import {
  configureNotificationHandler,
  registerForPushNotificationsAsync,
  syncDeviceTokenWithBackend,
} from "@/lib/notificationService";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ color: "#333", fontSize: 16, textAlign: "center", marginBottom: 8 }}>
        Something went wrong
      </Text>
      <Text style={{ color: "#666", fontSize: 14, textAlign: "center", paddingHorizontal: 20 }}>
        {error?.message ?? "An unexpected error occurred"}
      </Text>
      <Pressable
        onPress={retry}
        style={{
          backgroundColor: "#0A2540",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          marginTop: 16,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 15 }}>Retry</Text>
      </Pressable>
    </View>
  );
}

// Configures foreground notification display.
// Uses a lazy require() internally so expo-notifications is never loaded in Expo Go.
configureNotificationHandler();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SessionProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </SessionProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isAuthenticated, token, profile, signOut } = useSession();

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await signOut();
      router.replace("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut, router]);

  // Tracks the last token we synced so the effect runs exactly once per
  // auth session (re-runs only if the user signs out and back in with a
  // new token).
  const lastSyncedToken = useRef<string | null>(null);

  useEffect(() => {
    console.info(
      `[Layout] Auth effect — isAuthenticated=${isAuthenticated}, ` +
        `role=${profile?.role ?? "null"}, hasToken=${Boolean(token)}`
    );

    if (!isAuthenticated || !token) {
      console.info("[Layout] Skipping FCM sync — not authenticated.");
      return;
    }

    if (profile?.role !== "Lawyer") {
      console.info(
        `[Layout] Skipping FCM sync — role is "${profile?.role}", only synced for Lawyers.`
      );
      return;
    }

    if (lastSyncedToken.current === token) {
      console.info("[Layout] Skipping FCM sync — token already synced this session.");
      return;
    }

    lastSyncedToken.current = token;
    console.info("[Layout] Starting FCM token registration & backend sync...");

    (async () => {
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await syncDeviceTokenWithBackend(pushToken, token);
          console.info("[Layout] FCM sync complete — token saved to DB.");
        } else {
          console.warn(
            "[Layout] FCM sync skipped — registerForPushNotificationsAsync returned null."
          );
        }
      } catch (err) {
        // Non-fatal — the app works without push notifications.
        console.warn("[Layout] FCM token sync failed:", err);
      }
    })();
  }, [isAuthenticated, token, profile?.role]);

  return (
    <NavThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0A2540" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF", fontSize: 17 },
          headerShadowVisible: false,
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ presentation: "card" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="posts/[postId]"
          options={{
            title: "Help Request",
          }}
        />
        <Stack.Screen
          name="public-profile/[lawyerId]"
          options={{
            title: "Lawyer Profile",
          }}
        />
        <Stack.Screen
          name="profile-viewers"
          options={{
            title: "Profile Viewers",
          }}
        />
      </Stack>
    </NavThemeProvider>
  );
}
