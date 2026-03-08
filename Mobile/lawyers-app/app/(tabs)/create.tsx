import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
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
  const { token, profile } = useSession();
  const isSuspended = profile?.isSuspended ?? false;

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

  if (isSuspended) {
    return (
      <View style={styles.suspendedContainer}>
        <Ionicons name="ban-outline" size={64} color="#D32F2F" />
        <Text style={styles.suspendedTitle}>Account Suspended</Text>
        <Text style={styles.suspendedSubtitle}>
          Your account has been temporarily suspended from posting. You still have
          read-only access to the community feed.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardWrap}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        {isLoadingLookups ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="small" color={C.primary} />
            <Text style={styles.helperText}>Loading cities and courts...</Text>
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
            {/* Top row: Avatar | Name + Court selector */}
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.fullName?.trim().charAt(0).toUpperCase() ?? "?"}
                </Text>
              </View>
              <View style={styles.topRight}>
                <Text style={styles.userName}>{profile?.fullName?.trim() ?? "You"}</Text>
                {courtOptions.length > 0 ? (
                  <Pressable
                    onPress={() => setIsCourtDropdownOpen((prev) => !prev)}
                    style={styles.courtBadge}
                  >
                    <Text style={styles.courtBadgeText}>
                      {selectedCourt
                        ? `${selectedCourt.courtName} • ${selectedCourt.cityName}`
                        : "Select court"}
                    </Text>
                    <Ionicons
                      name={isCourtDropdownOpen ? "chevron-up" : "chevron-down"}
                      size={14}
                      color="#666666"
                      style={{ marginLeft: 4 }}
                    />
                  </Pressable>
                ) : (
                  <Text style={styles.helperText}>No courts available.</Text>
                )}
              </View>
            </View>

            {isCourtDropdownOpen && courtOptions.length > 0 ? (
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
                        {active ? <Ionicons name="checkmark-circle" size={18} color={C.accent} /> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* Middle: TextInput (flex: 1) */}
            <View style={styles.inputArea}>
              <TextInput
                multiline
                value={description}
                onChangeText={setDescription}
                placeholder="What legal help do you need in this court?..."
                placeholderTextColor="#999999"
                style={styles.textInput}
              />
              {pickedFile ? (
                <View style={styles.previewWrap}>
                  <Image
                    source={{ uri: pickedFile.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <Pressable style={styles.removeImageButton} onPress={() => setPickedFile(null)}>
                    <Text style={styles.removeImageText}>✕ Remove</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>

            {submitError ? <Text style={styles.inlineError}>{submitError}</Text> : null}

            {/* Bottom toolbar */}
            <View style={styles.toolbar}>
              <Pressable onPress={handlePickImage} style={({ pressed }) => [styles.photoBtn, pressed && { opacity: 0.6 }]}>
                <Ionicons name="image-outline" size={26} color="#0A2540" />
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[styles.publishBtn, isSubmitting && { opacity: 0.7 }]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.publishBtnText}>Publish</Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingBottom: 100,
  },

  loadingBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
  },
  helperText: { color: C.textSecondary, fontSize: 14 },

  // Top row: avatar + name/court
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  topRight: { flex: 1 },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A2540",
  },
  courtBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F3F2EF",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  courtBadgeText: {
    fontSize: 13,
    color: C.textPrimary,
    fontWeight: "500",
  },

  // Court dropdown
  dropdownMenu: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    maxHeight: 200,
  },
  dropdownScroll: { maxHeight: 200 },
  courtOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F2EF",
  },
  courtOptionActive: { backgroundColor: "#F0F4F8" },
  courtOptionLast: { borderBottomWidth: 0 },
  courtOptionTitle: { fontSize: 14, fontWeight: "600", color: C.textPrimary },
  courtOptionTitleActive: { color: C.primary },
  courtOptionSubtitle: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  // Middle: text input (flex: 1)
  inputArea: {
    flex: 1,
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: "#333333",
    textAlignVertical: "top",
    padding: 0,
    margin: 0,
  },
  previewWrap: { marginTop: 12, gap: 8 },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#F3F2EF",
  },
  removeImageButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  removeImageText: { color: C.danger, fontWeight: "600", fontSize: 14 },

  // Bottom toolbar
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    paddingTop: 12,
    marginTop: 12,
  },
  photoBtn: {
    padding: 8,
  },
  publishBtn: {
    backgroundColor: "#0A2540",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: "center",
  },
  publishBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },

  // Error states
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
  inlineError: { color: C.danger, fontSize: 13, marginTop: 8 },

  suspendedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
  },
  suspendedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A2540",
    marginTop: 16,
  },
  suspendedSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 32,
    marginTop: 8,
  },
});
