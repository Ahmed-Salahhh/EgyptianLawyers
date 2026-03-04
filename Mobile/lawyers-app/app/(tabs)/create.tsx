import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSession } from "@/lib/auth/session";
import { fetchCourtsAndCities } from "@/lib/features/lookups/api";
import type { LookupCity } from "@/lib/features/lookups/types";
import { createHelpPost } from "@/lib/features/posts/api";
import type { PickedFile } from "@/lib/features/posts/types";

export default function CreatePostScreen() {
  const router = useRouter();
  const { token } = useSession();

  const [cities, setCities] = useState<LookupCity[]>([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(false);
  const [lookupsError, setLookupsError] = useState<string | null>(null);

  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedCity = useMemo(
    () => cities.find((c) => c.id === selectedCityId) ?? null,
    [cities, selectedCityId],
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
      setCities(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load cities.";
      setLookupsError(msg);
    } finally {
      setIsLoadingLookups(false);
    }
  };

  useEffect(() => {
    loadLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedCourtId("");
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setSubmitError("Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const ext = asset.uri.split(".").pop() ?? "jpg";
      setPickedFile({
        uri: asset.uri,
        name: asset.fileName ?? `photo.${ext}`,
        mimeType: asset.mimeType ?? `image/${ext}`,
      });
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      setSubmitError("No auth token available.");
      return;
    }
    if (!selectedCityId || !selectedCourtId || !description.trim()) {
      setSubmitError("Please select a city, a court, and enter a description.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createHelpPost(
        token,
        {
          courtId: selectedCourtId,
          cityId: selectedCityId,
          description: description.trim(),
        },
        pickedFile,
      );
      setDescription("");
      setSelectedCityId("");
      setSelectedCourtId("");
      setPickedFile(null);
      router.push("/(tabs)");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create post.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Hero ── */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>New Request</Text>
        <Text style={styles.heroTitle}>Publish a Help Post</Text>
        <Text style={styles.heroSub}>
          Select your city and court, then describe what you need.
        </Text>
      </View>

      {isLoadingLookups ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <ActivityIndicator size="small" color="#1f5bd8" />
            <Text style={styles.helperText}>Loading cities and courts...</Text>
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
          {/* Step 1: Select City */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1) Select City</Text>
            {cities.length === 0 ? (
              <Text style={styles.helperText}>No cities available.</Text>
            ) : (
              cities.map((city) => {
                const active = selectedCityId === city.id;
                return (
                  <Pressable
                    key={city.id}
                    onPress={() => handleSelectCity(city.id)}
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

          {/* Step 2: Select Court */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>2) Select Court</Text>
            {!selectedCity ? (
              <Text style={styles.helperText}>Pick a city first.</Text>
            ) : selectedCity.courts.length === 0 ? (
              <Text style={styles.helperText}>No courts registered in this city.</Text>
            ) : (
              selectedCity.courts.map((court) => {
                const active = selectedCourtId === court.id;
                return (
                  <Pressable
                    key={court.id}
                    onPress={() => setSelectedCourtId(court.id)}
                    style={[styles.choice, active ? styles.choiceActive : null]}
                  >
                    <Text style={[styles.choiceText, active ? styles.choiceTextActive : null]}>
                      {court.name}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>

          {/* Step 3: Details */}
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

            {/* Image picker */}
            {pickedFile ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: pickedFile.uri }} style={styles.previewImage} resizeMode="cover" />
                <Pressable style={styles.removeImageButton} onPress={() => setPickedFile(null)}>
                  <Text style={styles.removeImageText}>✕  Remove image</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.uploadButton} onPress={handlePickImage}>
                <Text style={styles.uploadButtonText}>🖼️  Attach an image (optional)</Text>
              </Pressable>
            )}

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
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fc" },
  content: { padding: 16, paddingBottom: 110, gap: 12 },
  heroCard: { borderRadius: 22, padding: 18, backgroundColor: "#113e87" },
  heroLabel: {
    color: "#b9cef8",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: { marginTop: 4, color: "#ffffff", fontSize: 28, fontWeight: "700" },
  heroSub: { marginTop: 6, color: "#d9e6ff" },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe5f6",
    backgroundColor: "#fff",
    padding: 15,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1a2f52", marginBottom: 8 },
  choice: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d7e1f3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#f9fbff",
  },
  choiceActive: { borderColor: "#1f5bd8", backgroundColor: "#eaf1ff" },
  choiceText: { color: "#2c3f61" },
  choiceTextActive: { color: "#1842a8", fontWeight: "700" },
  helperText: { color: "#60769a" },
  input: {
    borderWidth: 1,
    borderColor: "#d2deef",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1f2e49",
    backgroundColor: "#fbfdff",
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  uploadButton: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f5bd8",
    borderStyle: "dashed",
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f0f5ff",
  },
  uploadButtonText: { color: "#1f5bd8", fontWeight: "600", fontSize: 14 },
  previewContainer: { marginTop: 10, gap: 8 },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    backgroundColor: "#e5ebf6",
  },
  removeImageButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#fce8ec",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeImageText: { color: "#b13550", fontWeight: "600", fontSize: 13 },
  primaryButton: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: "#1f5bd8",
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  retryButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#1f5bd8",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryButtonText: { color: "#fff", fontWeight: "700" },
  errorText: { marginTop: 10, color: "#b13550" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
