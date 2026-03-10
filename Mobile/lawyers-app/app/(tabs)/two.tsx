import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "@/lib/auth/session";
import { useTheme } from "@/lib/ThemeContext";
import { fetchCourtsAndCities } from "@/lib/features/lookups/api";
import type { LookupCity } from "@/lib/features/lookups/types";
import { fetchMyLawyerProfile, updateMyLawyerProfile } from "@/lib/features/lawyers/api";
import type { MyLawyerProfile } from "@/lib/features/lawyers/types";

// ── Design tokens (LinkedIn-style) ───────────────────────────────────────────
const C = {
  primary: "#0A2540",
  bg: "#F3F2EF",
  card: "#FFFFFF",
  textPrimary: "#191919",
  textSecondary: "#666666",
  border: "#EBEBEB",
  inputBorder: "#D1D5DB",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  success: "#059669",
  successBg: "#ECFDF5",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
};

type CityOption = { id: string; name: string };

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
};

function createThemedStyles(theme: ThemeColors) {
  return {
    container: { flex: 1, backgroundColor: theme.background },
    centered: {
      flex: 1,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: theme.background,
      padding: 24,
      gap: 14,
    },
    helperText: { color: theme.textSecondary, fontSize: 14 },
    errorText: { color: C.danger, textAlign: "center" as const, fontSize: 15 },
    bannerText: { color: theme.text, fontSize: 14, fontWeight: "500" as const },
  };
}

export default function ProfileTab() {
  const router = useRouter();
  const { token, signOut, profile: authProfile, refreshProfile } = useSession();
  const { isDarkMode, theme, toggleTheme } = useTheme();

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

  // Refresh session when Profile tab gains focus — when pending approval or suspended
  const refreshRef = useRef(refreshProfile);
  refreshRef.current = refreshProfile;
  useFocusEffect(
    useCallback(() => {
      if (!authProfile?.isVerified || authProfile?.isSuspended) {
        refreshRef.current();
      }
    }, [authProfile?.isVerified, authProfile?.isSuspended])
  );

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

  const themedStyles = useMemo(() => createThemedStyles(theme), [theme]);

  if (isLoading) {
    return (
      <View style={[themedStyles.centered]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={themedStyles.helperText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[themedStyles.centered]}>
        <Text style={themedStyles.errorText}>{error ?? "Failed to load profile."}</Text>
        <Pressable onPress={loadProfile} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const cityNames = profile.activeCities.map((c) => c.name).join(", ") || "—";
  const isVerified = authProfile?.isVerified ?? true;
  const isSuspended = authProfile?.isSuspended ?? false;

  return (
    <ScrollView style={[themedStyles.container]} contentContainerStyle={styles.content}>
      {/* ── Pending approval banner ─────────────────────────────────────────── */}
      {!isVerified && (
        <View style={styles.bannerPending}>
          <Ionicons name="time-outline" size={20} color="#B76E00" />
          <View style={styles.bannerPendingContent}>
            <Text style={styles.bannerPendingText}>
              Pending Approval. We are verifying your syndicate credentials.
            </Text>
            <Pressable
              onPress={() => refreshProfile()}
              style={({ pressed }) => [styles.bannerPendingBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.bannerPendingBtnText}>Check status</Text>
            </Pressable>
          </View>
        </View>
      )}
      {isSuspended && (
        <View style={styles.bannerDanger}>
          <Ionicons name="ban-outline" size={20} color={C.danger} />
          <View style={styles.bannerDangerContent}>
            <Text style={themedStyles.bannerText}>
              Your account is suspended. You are in read-only mode.
            </Text>
            <Pressable
              onPress={() => refreshProfile()}
              style={({ pressed }) => [styles.bannerDangerBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.bannerDangerBtnText}>Check status</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Cover banner (Navy Blue) ─────────────────────────────────────────── */}
      <View style={styles.cover} />

      {/* ── Profile picture (overlaps cover, white border) ───────────────────── */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {profile.fullName.trim().charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* ── Intro card ──────────────────────────────────────────────────────── */}
      <View style={[styles.introCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.profileName, { color: theme.text }]}>{profile.fullName}</Text>
        <Text style={[styles.profileTitle, { color: theme.text }]}>
          {profile.title || "Lawyer"} • Syndicate #{profile.syndicateCardNumber}
        </Text>
        <Text style={[styles.profileLocation, { color: theme.textSecondary }]}>{cityNames}</Text>
      </View>

      {/* ── Appearance row ─────────────────────────────────────────────────── */}
      <View style={[styles.settingsRow, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Ionicons name="moon-outline" size={20} color={theme.text} />
        <Text style={[styles.settingsRowText, { color: theme.text }]}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      {!isEditing && (
        <Pressable
          style={({ pressed }) => [styles.statsRow, pressed && { opacity: 0.8 }]}
          onPress={() => router.push("/profile-viewers")}
        >
          <Ionicons name="eye-outline" size={18} color={C.primary} />
          <Text style={[styles.statsText, { color: theme.text }]}>Who viewed your profile</Text>
          <Ionicons name="chevron-forward" size={16} color={C.primary} />
        </Pressable>
      )}

      {/* ── Action buttons ─────────────────────────────────────────────────── */}
      {!isEditing ? (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              resetFormFromProfile();
              setSaveMessage(null);
              setIsEditing(true);
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.primaryButtonText}>Edit Profile</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.outlineButton, { backgroundColor: theme.card, borderColor: theme.border }, pressed && { opacity: 0.9 }]}
            onPress={() => router.push({ pathname: "/public-profile/[lawyerId]", params: { lawyerId: profile.id } })}
          >
            <Text style={[styles.outlineButtonText, { color: theme.text }]}>View as others see</Text>
          </Pressable>
        </View>
      ) : null}

      {/* ── About / Info card ───────────────────────────────────────────────── */}
      {!isEditing && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>About</Text>
          <InfoRow label="Title" value={profile.title || "—"} theme={theme} />
          <RowDivider theme={theme} />
          <InfoRow label="WhatsApp" value={profile.whatsAppNumber || "—"} theme={theme} />
          <RowDivider theme={theme} />
          <InfoRow label="Active Cities" value={cityNames} theme={theme} />
        </View>
      )}

      {/* ── Edit form ──────────────────────────────────────────────────────── */}
      {isEditing && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Edit Profile</Text>

          <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Lawyer, Legal Consultant"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>WhatsApp Number</Text>
          <TextInput
            value={whatsAppNumber}
            onChangeText={setWhatsAppNumber}
            keyboardType="phone-pad"
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Active Cities</Text>
          <View style={styles.citiesWrap}>
            {cityOptions.map((city) => {
              const selected = cityIds.includes(city.id);
              return (
                <Pressable
                  key={city.id}
                  onPress={() => toggleCity(city.id)}
                  style={[
                    styles.cityChip,
                    {
                      backgroundColor: selected ? "#EFF6FF" : theme.background,
                      borderColor: selected ? C.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cityChipText,
                      { color: selected ? C.primary : theme.textSecondary },
                      selected && styles.cityChipTextActive,
                    ]}
                  >
                    {city.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {saveMessage ? (
            <View
              style={[
                styles.messageBox,
                saveMessage.success ? styles.messageBoxSuccess : styles.messageBoxError,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  saveMessage.success ? styles.messageTextSuccess : styles.messageTextError,
                ]}
              >
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
              style={({ pressed }) => [styles.outlineButton, { backgroundColor: theme.card, borderColor: theme.border }, pressed && { opacity: 0.9 }]}
            >
              <Text style={[styles.outlineButtonText, { color: theme.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={[styles.primaryButton, styles.flexButton, isSaving && { opacity: 0.7 }]}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Logout ──────────────────────────────────────────────────────────── */}
      <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.9 }]}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value, theme }: { label: string; value: string; theme: ThemeColors }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function RowDivider({ theme }: { theme: ThemeColors }) {
  return <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 110 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
    gap: 14,
  },
  helperText: { color: C.textSecondary, fontSize: 14 },
  errorText: { color: C.danger, textAlign: "center", fontSize: 15 },

  bannerPending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF4E5",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FFB020",
  },
  bannerPendingContent: { flex: 1, gap: 8 },
  bannerPendingText: {
    color: "#B76E00",
    fontWeight: "700",
    fontSize: 14,
  },
  bannerPendingBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#B76E00",
  },
  bannerPendingBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  bannerDanger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.dangerBg,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  bannerDangerContent: { flex: 1, gap: 8 },
  bannerDangerBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: C.danger,
  },
  bannerDangerBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  bannerText: { color: C.textPrimary, fontSize: 14, fontWeight: "500" },

  cover: {
    height: 120,
    backgroundColor: C.primary,
  },
  avatarWrap: {
    marginTop: -50,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.primary,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...C.shadow,
  },
  avatarInitial: { color: "#FFFFFF", fontSize: 40, fontWeight: "700" },

  introCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    ...C.shadow,
  },
  profileName: { fontSize: 24, fontWeight: "700" },
  profileTitle: { fontSize: 16, marginTop: 4 },
  profileLocation: { fontSize: 14, marginTop: 4 },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderRadius: 12,
  },
  settingsRowText: { flex: 1, fontSize: 15, fontWeight: "600" },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
  },
  statsText: { fontSize: 14, fontWeight: "600", color: C.primary },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  outlineButton: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "#666666",
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: { color: C.textPrimary, fontSize: 15, fontWeight: "600" },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: C.card,
    borderRadius: 12,
    ...C.shadow,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: C.textPrimary, marginBottom: 12 },

  infoRow: { gap: 4 },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: 15, color: C.textPrimary, fontWeight: "500" },
  rowDivider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  fieldLabel: { fontSize: 13, fontWeight: "600", color: C.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: C.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.bg,
    color: C.textPrimary,
    fontSize: 14,
    marginBottom: 12,
  },
  citiesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
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

  messageBox: { borderRadius: 8, padding: 12, borderWidth: 1, marginBottom: 12 },
  messageBoxSuccess: { borderColor: "#A7F3D0", backgroundColor: C.successBg },
  messageBoxError: { borderColor: "#FECACA", backgroundColor: C.dangerBg },
  messageText: { fontSize: 13, fontWeight: "600" },
  messageTextSuccess: { color: C.success },
  messageTextError: { color: C.danger },

  actionsRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  flexButton: { flex: 1 },

  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 48,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    backgroundColor: C.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { color: C.danger, fontSize: 15, fontWeight: "700" },
});
