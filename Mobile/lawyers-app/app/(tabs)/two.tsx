import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { LookupCity } from "@/lib/features/lookups/types";
import { fetchMyLawyerProfile, updateMyLawyerProfile } from "@/lib/features/lawyers/api";
import type { MyLawyerProfile } from "@/lib/features/lawyers/types";

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
  success: "#059669",
  successBg: "#ECFDF5",
};

type CityOption = { id: string; name: string };

export default function ProfileTab() {
  const router = useRouter();
  const { token, signOut } = useSession();

  const [profile, setProfile] = useState<MyLawyerProfile | null>(null);
  const [cities, setCities] = useState<LookupCity[]>([]);

  const [title, setTitle] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [cityIds, setCityIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; success: boolean } | null>(null);

  const cityOptions = useMemo<CityOption[]>(
    () => cities.map((c) => ({ id: c.id, name: c.name })),
    [cities],
  );

  const loadProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      setError("No auth token available.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [me, lookupData] = await Promise.all([
        fetchMyLawyerProfile(token),
        fetchCourtsAndCities(token),
      ]);

      setProfile(me);
      setCities(lookupData);
      setTitle(me.title ?? "");
      setWhatsAppNumber(me.whatsAppNumber ?? "");
      setCityIds(me.activeCities.map((city) => city.id));
    } catch {
      setError("Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const toggleCity = (cityId: string) => {
    setCityIds((prev) =>
      prev.includes(cityId) ? prev.filter((id) => id !== cityId) : [...prev, cityId],
    );
  };

  const resetFormFromProfile = () => {
    if (!profile) return;
    setTitle(profile.title ?? "");
    setWhatsAppNumber(profile.whatsAppNumber ?? "");
    setCityIds(profile.activeCities.map((city) => city.id));
  };

  const handleSave = async () => {
    if (!token) return;

    if (!title.trim() || !whatsAppNumber.trim() || cityIds.length === 0) {
      setSaveMessage({ text: "Please fill in title, WhatsApp, and select at least one city.", success: false });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateMyLawyerProfile(token, {
        title: title.trim(),
        whatsAppNumber: whatsAppNumber.trim(),
        cityIds,
      });

      setSaveMessage({ text: "Profile updated successfully.", success: true });
      setIsEditing(false);
      await loadProfile();
    } catch {
      setSaveMessage({ text: "Failed to update profile.", success: false });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.helperText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Failed to load profile."}</Text>
        <Pressable onPress={loadProfile} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Hero ── */}
      <View style={styles.heroCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {profile.fullName.trim().charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.heroName}>{profile.fullName}</Text>
        <Text style={styles.heroTitle}>{profile.title || "Lawyer"}</Text>
        <View style={styles.heroPill}>
          <Text style={styles.heroPillText}>Syndicate: {profile.syndicateCardNumber}</Text>
        </View>
      </View>

      {/* ── Who viewed your profile ── */}
      {!isEditing && (
        <Pressable
          style={({ pressed }) => [styles.viewersCard, pressed && { opacity: 0.82 }]}
          onPress={() => router.push("/profile-viewers")}
        >
          <View style={styles.viewersIconWrap}>
            <Ionicons name="eye-outline" size={22} color={C.primary} />
          </View>
          <View style={styles.viewersTextWrap}>
            <Text style={styles.viewersTitle}>Who viewed your profile</Text>
            <Text style={styles.viewersSub}>See lawyers who visited your page</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
        </Pressable>
      )}

      {/* ── Info card ── */}
      {!isEditing && (
        <View style={styles.card}>
          <InfoRow label="Title" value={profile.title || "—"} />
          <Divider />
          <InfoRow label="WhatsApp" value={profile.whatsAppNumber || "—"} />
          <Divider />
          <InfoRow
            label="Active Cities"
            value={
              profile.activeCities.length
                ? profile.activeCities.map((c) => c.name).join(", ")
                : "—"
            }
          />
        </View>
      )}

      {/* ── Edit button or edit form ── */}
      {!isEditing ? (
        <Pressable
          onPress={() => {
            resetFormFromProfile();
            setSaveMessage(null);
            setIsEditing(true);
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Edit Profile</Text>
        </Pressable>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>

          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor={C.textSecondary}
          />

          <Text style={styles.fieldLabel}>WhatsApp Number</Text>
          <TextInput
            value={whatsAppNumber}
            onChangeText={setWhatsAppNumber}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor={C.textSecondary}
          />

          <Text style={styles.fieldLabel}>Active Cities</Text>
          <View style={styles.citiesWrap}>
            {cityOptions.map((city) => {
              const selected = cityIds.includes(city.id);
              return (
                <Pressable
                  key={city.id}
                  onPress={() => toggleCity(city.id)}
                  style={[styles.cityChip, selected && styles.cityChipActive]}
                >
                  <Text style={[styles.cityChipText, selected && styles.cityChipTextActive]}>
                    {city.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {saveMessage ? (
            <View style={[
              styles.messageBox,
              saveMessage.success ? styles.messageBoxSuccess : styles.messageBoxError,
            ]}>
              <Text style={[
                styles.messageText,
                saveMessage.success ? styles.messageTextSuccess : styles.messageTextError,
              ]}>
                {saveMessage.text}
              </Text>
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => {
                resetFormFromProfile();
                setSaveMessage(null);
                setIsEditing(false);
              }}
              style={styles.outlineButton}
            >
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={[styles.primaryButton, styles.flexButton, isSaving && { opacity: 0.7 }]}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Logout ── */}
      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

// ── Small sub-components ──────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 110, gap: 12 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
    gap: 14,
  },

  // Hero
  heroCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: C.primary,
    alignItems: "center",
    gap: 6,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarInitial: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },
  heroName: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", textAlign: "center" },
  heroTitle: { color: "rgba(255,255,255,0.7)", fontSize: 14, textAlign: "center" },
  heroPill: {
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  heroPillText: { color: "rgba(255,255,255,0.85)", fontWeight: "600", fontSize: 12 },

  // Card
  card: {
    borderRadius: 12,
    backgroundColor: C.card,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },

  // Info rows
  infoRow: { gap: 2 },
  infoLabel: { fontSize: 11, fontWeight: "700", color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: "600", color: C.textPrimary },
  divider: { height: 1, backgroundColor: C.border },

  // Form
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textSecondary,
    marginBottom: -4,
  },
  input: {
    borderWidth: 1,
    borderColor: C.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: C.bg,
    color: C.textPrimary,
    fontSize: 14,
  },
  citiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cityChip: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cityChipActive: { borderColor: C.primary, backgroundColor: "#EFF6FF" },
  cityChipText: { color: C.textSecondary, fontSize: 13 },
  cityChipTextActive: { color: C.primary, fontWeight: "700" },

  // Messages
  messageBox: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  messageBoxSuccess: { borderColor: "#A7F3D0", backgroundColor: C.successBg },
  messageBoxError: { borderColor: "#FECACA", backgroundColor: C.dangerBg },
  messageText: { fontSize: 13, fontWeight: "600" },
  messageTextSuccess: { color: C.success },
  messageTextError: { color: C.danger },

  // Buttons
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  flexButton: { flex: 1 },
  primaryButton: {
    borderRadius: 10,
    backgroundColor: C.primary,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  outlineButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: { color: C.textPrimary, fontWeight: "700", fontSize: 15 },
  logoutButton: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    backgroundColor: C.dangerBg,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { color: C.danger, fontSize: 15, fontWeight: "700" },

  // Misc
  helperText: { color: C.textSecondary, fontSize: 14 },
  errorText: { color: C.danger, textAlign: "center", fontSize: 15 },

  // Profile viewers teaser card
  viewersCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    backgroundColor: C.card,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  viewersIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  viewersTextWrap: { flex: 1, gap: 2 },
  viewersTitle: { fontSize: 15, fontWeight: "700", color: C.primary },
  viewersSub: { fontSize: 12, color: C.textSecondary },
});
