import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { useSession, SessionProvider } from "@/lib/auth/session";
import {
  configureNotificationHandler,
  registerForPushNotificationsAsync,
  syncDeviceTokenWithBackend,
} from "@/lib/notificationService";

export { ErrorBoundary } from "expo-router";

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
      <RootLayoutNav />
    </SessionProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, token, profile } = useSession();

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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
    </ThemeProvider>
  );
}
