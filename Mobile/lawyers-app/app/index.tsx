import { useTheme } from "@/lib/ThemeContext";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "@/lib/auth/session";

export default function IndexPage() {
  const { isHydrated, isAuthenticated } = useSession();
  const { theme } = useTheme();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
