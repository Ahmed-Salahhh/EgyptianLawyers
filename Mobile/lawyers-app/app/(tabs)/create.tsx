import { Ionicons } from "@expo/vector-icons";
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

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#0A2540",
  accent: "#0070F3",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  inputBorder: "#D1D5DB",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
};

export default function CreatePostScreen() {
  const router = useRouter();
  const { token } = useSession();

  const [cities, setCities] = useState<LookupCity[]>([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(false);
  const [lookupsError, setLookupsError] = useState<string | null>(null);

  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [isCourtDropdownOpen, setIsCourtDropdownOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const courtOptions = useMemo(
    () =>
      cities.flatMap((city) =>
        city.courts.map((court) => ({
          courtId: court.id,
          courtName: court.name,
          cityId: city.id,
          cityName: city.name,
        })),
      ),
    [cities],
  );

  const selectedCourt = useMemo(
    () => courtOptions.find((item) => item.courtId === selectedCourtId) ?? null,
    [courtOptions, selectedCourtId],
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

  const handleSelectCourt = (courtId: string, cityId: string) => {
    setSelectedCourtId(courtId);
    setSelectedCityId(cityId);
    setIsCourtDropdownOpen(false);
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
      setSubmitError("Please select a court and enter a description.");
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
      setIsCourtDropdownOpen(false);
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
        <Text style={styles.heroEyebrow}>New Request</Text>
        <Text style={styles.heroTitle}>Publish a Help Post</Text>
        <Text style={styles.heroSub}>
          Select the court, verify linked city, then describe what you need.
        </Text>
      </View>

      {isLoadingLookups ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <ActivityIndicator size="small" color={C.primary} />
            <Text style={styles.helperText}>Loading cities and courts...</Text>
          </View>
        </View>
      ) : lookupsError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{lookupsError}</Text>
          <Pressable style={styles.dangerButton} onPress={loadLookups}>
            <Text style={styles.dangerButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Step 1 */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Court</Text>
            {courtOptions.length === 0 ? (
              <Text style={styles.helperText}>No courts available.</Text>
            ) : (
              <>
                <Pressable
                  onPress={() => setIsCourtDropdownOpen((prev) => !prev)}
                  style={styles.dropdownTrigger}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.dropdownValue,
                        !selectedCourt ? styles.dropdownPlaceholder : null,
                      ]}
                    >
                      {selectedCourt ? selectedCourt.courtName : "Select court"}
                    </Text>
                    {selectedCourt ? (
                      <Text style={styles.dropdownSubText}>{selectedCourt.cityName}</Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name={isCourtDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={C.textSecondary}
                  />
                </Pressable>

                {isCourtDropdownOpen ? (
                  <View style={styles.dropdownMenu}>
                    <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                      {courtOptions.map((item, index) => {
                        const active = selectedCourtId === item.courtId;
                        return (
                          <Pressable
                            key={item.courtId}
                            onPress={() => handleSelectCourt(item.courtId, item.cityId)}
                            style={[
                              styles.courtOption,
                              active && styles.courtOptionActive,
                              index === courtOptions.length - 1 && styles.courtOptionLast,
                            ]}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.courtOptionTitle, active && styles.courtOptionTitleActive]}>
                                {item.courtName}
                              </Text>
                              <Text style={styles.courtOptionSubtitle}>{item.cityName}</Text>
                            </View>
                            {active ? <Ionicons name='checkmark-circle' size={18} color={C.accent} /> : null}
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}
              </>
            )}
          </View>

          {/* Step 2 */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Details</Text>

            <TextInput
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the legal help request..."
              placeholderTextColor={C.textSecondary}
              style={[styles.input, styles.textArea]}
            />

            {/* Image picker */}
            {pickedFile ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: pickedFile.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <Pressable style={styles.removeImageButton} onPress={() => setPickedFile(null)}>
                  <Text style={styles.removeImageText}>✕  Remove image</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.uploadButton} onPress={handlePickImage}>
                <Ionicons name="image-outline" size={20} color={C.accent} />
                <Text style={styles.uploadButtonText}>Attach an image (optional)</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Publish Post</Text>
              )}
            </Pressable>

            {submitError ? <Text style={styles.inlineError}>{submitError}</Text> : null}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 110, gap: 12 },

  // Hero
  heroCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: C.primary,
    gap: 6,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", lineHeight: 32 },
  heroSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 20 },

  // Card
  card: {
    borderRadius: 12,
    backgroundColor: C.card,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  dropdownTrigger: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.inputBorder,
    backgroundColor: C.bg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownValue: { color: C.textPrimary, fontSize: 14, fontWeight: "600" },
  dropdownPlaceholder: { color: C.textSecondary, fontWeight: "500" },
  dropdownSubText: { color: "#8a97ad", fontSize: 12, marginTop: 2 },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    overflow: "hidden",
    shadowColor: "#102a56",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  dropdownScroll: { maxHeight: 240 },
  courtOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f8",
    backgroundColor: "#fff",
  },
  courtOptionActive: {
    backgroundColor: "#eef5ff",
  },
  courtOptionLast: {
    borderBottomWidth: 0,
  },
  courtOptionTitle: { color: "#2e4266", fontSize: 14, fontWeight: "600" },
  courtOptionTitleActive: { color: C.primary },
  courtOptionSubtitle: { color: "#8a97ad", fontSize: 12, marginTop: 2 },

  // Choice chips
  choice: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: C.bg,
  },
  choiceActive: { borderColor: C.primary, backgroundColor: "#EFF6FF" },
  choiceText: { color: C.textSecondary, fontSize: 14 },
  choiceTextActive: { color: C.primary, fontWeight: "700" },
  choiceSubText: { color: "#8a97ad", fontSize: 12, marginTop: 2 },

  // Input
  input: {
    borderWidth: 1,
    borderColor: C.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.textPrimary,
    backgroundColor: C.bg,
    fontSize: 14,
  },
  textArea: { minHeight: 110, textAlignVertical: "top" },

  // Upload
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.accent,
    paddingVertical: 13,
    backgroundColor: "#F0F9FF",
  },
  uploadButtonText: { color: C.accent, fontWeight: "600", fontSize: 14 },
  previewContainer: { gap: 8 },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    backgroundColor: C.border,
  },
  removeImageButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeImageText: { color: C.danger, fontWeight: "600", fontSize: 13 },

  // Primary button
  primaryButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: C.primary,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Error
  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: C.dangerBg,
    padding: 14,
  },
  errorText: { color: C.danger, lineHeight: 20, fontSize: 14, marginBottom: 10 },
  dangerButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: C.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dangerButtonText: { color: "#fff", fontWeight: "700" },
  inlineError: { color: C.danger, fontSize: 13, marginTop: 4 },

  // Misc
  helperText: { color: C.textSecondary, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
