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
      await signIn({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch {
      setError("Login failed. Check your credentials.");
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
        <Text style={styles.brand}>Lawyers Network</Text>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>Sign in with your backend credentials.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="admin@gmail.com"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          secureTextEntry
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

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

        <Pressable onPress={() => router.push("/register")} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Create Lawyer Account</Text>
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
    backgroundColor: "#f3f6fb",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d9e1f2",
    backgroundColor: "#ffffff",
    padding: 18,
  },
  brand: {
    fontSize: 14,
    color: "#4f6487",
  },
  title: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "700",
    color: "#13294b",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 14,
    color: "#60769a",
  },
  label: {
    marginBottom: 6,
    marginTop: 8,
    fontSize: 13,
    color: "#30415f",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d2deef",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: "#1f2e49",
    backgroundColor: "#fbfdff",
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#1f5bd8",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c9d6ef",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    backgroundColor: "#f7faff",
  },
  secondaryButtonText: {
    color: "#1d4cae",
    fontWeight: "700",
  },
  error: {
    marginTop: 10,
    color: "#c43c56",
    fontSize: 13,
  },
});
