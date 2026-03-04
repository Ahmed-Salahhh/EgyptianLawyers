import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "http://egyptianlawyers-001-site1.stempurl.com";

const TAG = "[FCM]";

// True when running inside Expo Go (SDK 53+ removed remote push support there).
// executionEnvironment === "storeClient" means the user is inside the Expo Go app.
// A development build returns "bare"; a production build returns "standalone" or "bare".
const isExpoGo = Constants.executionEnvironment === "storeClient";

// Lazy getter so expo-notifications is never imported/evaluated in Expo Go.
// require() inside a function is deferred — the native module is only loaded on demand.
function getNotifications() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-notifications") as typeof import("expo-notifications");
}

/**
 * Call once at app startup (module level in _layout.tsx).
 * Configures how notifications behave when the app is in the foreground.
 * No-ops silently in Expo Go.
 */
export function configureNotificationHandler(): void {
  if (isExpoGo) {
    console.info(
      `${TAG} configureNotificationHandler skipped — running in Expo Go. ` +
        "Use a development build (npx expo run:android / run:ios) to enable push notifications."
    );
    return;
  }

  getNotifications().setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  console.info(`${TAG} Notification handler configured.`);
}

/**
 * Requests push-notification permissions and returns the raw native FCM/APNs
 * device token. Returns null when unavailable (Expo Go in production, simulator, denied).
 *
 * In Expo Go + __DEV__, returns a stable fake token so the full backend pipeline
 * (POST /api/lawyers/me/device-token → DB) can be verified without a dev build.
 * This fake token is never used for real push delivery.
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  console.info(
    `${TAG} registerForPushNotificationsAsync — ` +
      `executionEnvironment="${Constants.executionEnvironment}", ` +
      `isDevice=${Device.isDevice}, platform=${Platform.OS}, __DEV__=${__DEV__}`
  );

  if (isExpoGo) {
    if (__DEV__) {
      // ── DEV-ONLY TEST MODE ────────────────────────────────────────────────
      // Returns a stable fake token so you can verify the backend endpoint and
      // DB write work correctly while using Expo Go.
      // Real push notifications require a development build (npx expo run:android).
      const fakeToken = `expo-go-dev-${Device.modelName ?? "device"}-${Platform.OS}`;
      console.warn(
        `${TAG} DEV MODE: Expo Go detected — using fake token for backend pipeline test.\n` +
          `  Token: "${fakeToken}"\n` +
          `  Check DB: SELECT FcmToken FROM Lawyers WHERE IdentityUserId = '<your-id>';\n` +
          `  Real push notifications require: npx expo run:android`
      );
      return fakeToken;
      // ── END DEV-ONLY TEST MODE ────────────────────────────────────────────
    }

    console.warn(
      `${TAG} BLOCKED: Running in Expo Go (production). ` +
        "FCM tokens require a development build."
    );
    return null;
  }

  if (!Device.isDevice) {
    console.warn(
      `${TAG} BLOCKED: Not a physical device (simulator/emulator detected). ` +
        "Push tokens are only available on real devices."
    );
    return null;
  }

  const Notifications = getNotifications();

  // Android 8+ requires an explicit notification channel before registering.
  if (Platform.OS === "android") {
    console.info(`${TAG} Creating Android notification channel...`);
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1565C0",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.info(`${TAG} Existing permission status: ${existingStatus}`);

  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    console.info(`${TAG} Requesting notification permissions...`);
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.info(`${TAG} Permission result: ${finalStatus}`);
  }

  if (finalStatus !== "granted") {
    console.warn(
      `${TAG} BLOCKED: Notification permission denied (status="${finalStatus}"). ` +
        "The user must grant permission in device Settings for push notifications to work."
    );
    return null;
  }

  console.info(`${TAG} Getting device push token...`);
  const pushTokenObj = await Notifications.getDevicePushTokenAsync();
  const token = pushTokenObj.data as string;
  console.info(
    `${TAG} Device push token obtained: ${token.substring(0, 20)}...`
  );
  return token;
}

/**
 * POSTs the FCM device token to the backend so it is stored on the lawyer's
 * profile and used for city-scoped push notification delivery.
 */
export async function syncDeviceTokenWithBackend(
  pushToken: string,
  authToken: string
): Promise<void> {
  const url = `${API_BASE_URL}/api/lawyers/me/device-token`;
  console.info(`${TAG} Syncing FCM token with backend → POST ${url}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token: pushToken }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "(no body)");
    throw new Error(
      `${TAG} Failed to sync token — HTTP ${response.status}: ${body}`
    );
  }

  console.info(`${TAG} FCM token successfully saved to backend (204 No Content).`);
}
