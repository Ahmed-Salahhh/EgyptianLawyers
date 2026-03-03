import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "@/lib/auth/session";

export default function IndexPage() {
  const { isHydrated, isAuthenticated } = useSession();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
