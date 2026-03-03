import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "@/lib/auth/session";
import { fetchCourtsAndCities } from "@/lib/features/lookups/api";
import type { LookupCourt } from "@/lib/features/lookups/types";
import { createHelpPost } from "@/lib/features/posts/api";

export default function CreatePostScreen() {
  const router = useRouter();
  const { token } = useSession();

  const [courts, setCourts] = useState<LookupCourt[]>([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(false);
  const [lookupsError, setLookupsError] = useState<string | null>(null);

  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === selectedCourtId) ?? null,
    [courts, selectedCourtId],
  );

  const loadLookups = async () => {
    if (!token) {
      setLookupsError("No auth token available.");
      return;
    }

    setIsLoadingLookups(true);
    setLookupsError(null);

    try {
      const data = await fetchCourtsAndCities(token);
      setCourts(data);
    } catch {
      setLookupsError("Failed to load courts and cities.");
    } finally {
      setIsLoadingLookups(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, [token]);

  const handleSelectCourt = (courtId: string) => {
    setSelectedCourtId(courtId);
    setSelectedCityId("");
  };

  const handleSubmit = async () => {
    if (!token) {
      setSubmitError("No auth token available.");
      return;
    }

    if (!selectedCourtId || !selectedCityId || !description.trim()) {
      setSubmitError("Please select court/city and enter a description.");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    try {
      await createHelpPost(token, {
        courtId: selectedCourtId,
        cityId: selectedCityId,
        description: description.trim(),
        attachmentUrl: attachmentUrl.trim() ? attachmentUrl.trim() : undefined,
      });

      setDescription("");
      setAttachmentUrl("");
      setSelectedCourtId("");
      setSelectedCityId("");
      setSubmitSuccess("Post created successfully.");
      router.push("/(tabs)");
    } catch {
      setSubmitError("Failed to create post. Check payload/backend validation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>New Request</Text>
        <Text style={styles.heroTitle}>Publish a Help Post</Text>
        <Text style={styles.heroSub}>Select location and describe what support you need.</Text>
      </View>

      {isLoadingLookups ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <ActivityIndicator size="small" color="#1f5bd8" />
            <Text style={styles.helperText}>Loading courts and cities...</Text>
          </View>
        </View>
      ) : lookupsError ? (
        <View style={styles.card}>
          <Text style={styles.errorText}>{lookupsError}</Text>
          <Pressable style={styles.retryButton} onPress={loadLookups}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1) Select Court</Text>
            {courts.map((court) => {
              const active = selectedCourtId === court.id;
              return (
                <Pressable
                  key={court.id}
                  onPress={() => handleSelectCourt(court.id)}
                  style={[styles.choice, active ? styles.choiceActive : null]}
                >
                  <Text style={[styles.choiceText, active ? styles.choiceTextActive : null]}>
                    {court.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>2) Select City</Text>
            {!selectedCourt ? (
              <Text style={styles.helperText}>Pick a court first.</Text>
            ) : selectedCourt.cities.length === 0 ? (
              <Text style={styles.helperText}>No cities linked to this court.</Text>
            ) : (
              selectedCourt.cities.map((city) => {
                const active = selectedCityId === city.id;
                return (
                  <Pressable
                    key={city.id}
                    onPress={() => setSelectedCityId(city.id)}
                    style={[styles.choice, active ? styles.choiceActive : null]}
                  >
                    <Text style={[styles.choiceText, active ? styles.choiceTextActive : null]}>
                      {city.name}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>3) Details</Text>
            <TextInput
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the legal help request..."
              style={[styles.input, styles.textArea]}
            />

            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Attachment URL (optional)</Text>
            <TextInput
              value={attachmentUrl}
              onChangeText={setAttachmentUrl}
              placeholder="https://..."
              autoCapitalize="none"
              style={styles.input}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.primaryButton, isSubmitting ? { opacity: 0.7 } : null]}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Submitting..." : "Publish Post"}
              </Text>
            </Pressable>

            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
            {submitSuccess ? <Text style={styles.successText}>{submitSuccess}</Text> : null}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  content: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#113e87",
  },
  heroLabel: {
    color: "#b9cef8",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    marginTop: 4,
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
  },
  heroSub: {
    marginTop: 6,
    color: "#d9e6ff",
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe5f6",
    backgroundColor: "#fff",
    padding: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a2f52",
    marginBottom: 8,
  },
  choice: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d7e1f3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#f9fbff",
  },
  choiceActive: {
    borderColor: "#1f5bd8",
    backgroundColor: "#eaf1ff",
  },
  choiceText: {
    color: "#2c3f61",
  },
  choiceTextActive: {
    color: "#1842a8",
    fontWeight: "700",
  },
  helperText: {
    color: "#60769a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d2deef",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1f2e49",
    backgroundColor: "#fbfdff",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: "#1f5bd8",
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  retryButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#1f5bd8",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  errorText: {
    marginTop: 10,
    color: "#b13550",
  },
  successText: {
    marginTop: 10,
    color: "#1e7a3e",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
