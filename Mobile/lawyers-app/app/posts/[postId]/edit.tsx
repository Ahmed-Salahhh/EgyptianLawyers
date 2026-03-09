import { useSession } from "@/lib/auth/session";
import { fetchHelpPostById, updateHelpPost } from "@/lib/features/posts/api";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const C = {
  primary: "#0A2540",
  bg: "#F3F2EF",
  card: "#FFFFFF",
  textPrimary: "#191919",
  textSecondary: "#666666",
};

export default function EditPostScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { token } = useSession();
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || !token) return;
    fetchHelpPostById(token, postId)
      .then((post) => setDescription(post.description))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load post"))
      .finally(() => setIsLoading(false));
  }, [postId, token]);

  const handleSave = async () => {
    if (!token || !postId) return;
    const trimmed = description.trim();
    if (!trimmed) {
      Alert.alert("Error", "Description is required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await updateHelpPost(token, postId, trimmed, null);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Edit Post" }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.input}
            placeholder="What legal help do you need?"
            placeholderTextColor={C.textSecondary}
            editable={!isSaving}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg },
  loadingText: { marginTop: 10, color: C.textSecondary },
  card: { backgroundColor: C.card, borderRadius: 12, padding: 16, gap: 12 },
  label: { fontSize: 14, fontWeight: "600", color: C.textSecondary },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: C.textPrimary,
    textAlignVertical: "top",
  },
  errorText: { color: "#D32F2F", fontSize: 14 },
  saveBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
