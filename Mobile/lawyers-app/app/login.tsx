import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useSession } from "@/lib/auth/session";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isAuthenticated, isHydrated } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isHydrated && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const profile = await signIn({ email: email.trim(), password: password.trim() });
      if (!profile?.isVerified) {
        router.replace("/(tabs)/two");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.screen}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="scale-outline" size={64} color="#0A2540" />
          <Text style={styles.brand}>The Egyptian Lawyers Network</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your legal community.</Text>
        </View>

        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color="#666666" />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#999999"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>

        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color="#666666" />
          <TextInput
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.button,
            pressed && !isLoading ? { opacity: 0.9 } : null,
            isLoading ? { opacity: 0.7 } : null,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={() => router.push("/register")} style={styles.signUpLink}>
          <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
          <Text style={styles.signUpBold}>Sign Up</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F3F2EF",
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  brand: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A2540",
    textAlign: "center",
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "700",
    color: "#0A2540",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F2EF",
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#191919",
    padding: 0,
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#0A2540",
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  signUpLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  signUpText: {
    fontSize: 15,
    color: "#666666",
  },
  signUpBold: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A2540",
  },
  error: {
    marginTop: 10,
    color: "#DC2626",
    fontSize: 13,
    textAlign: "center",
  },
});
