import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSession } from "@/lib/auth/session";
import { useTheme } from "@/lib/ThemeContext";
import { fetchPublicLawyerProfile } from "@/lib/features/lawyers/api";
import type { PublicLawyerProfile } from "@/lib/features/lawyers/types";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#0A2540",
  accent: "#0070F3",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  verified: "#059669",
  verifiedBg: "#ECFDF5",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
};

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

function openWhatsApp(number: string) {
  const clean = number.replace(/\D/g, "");
  Linking.openURL(`https://wa.me/${clean}`).catch(() => {});
}

export default function PublicProfileScreen() {
  const { lawyerId } = useLocalSearchParams<{ lawyerId: string }>();
  const { token } = useSession();
  const { theme } = useTheme();
  const router = useRouter();

  const [profile, setProfile] = useState<PublicLawyerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lawyerId || !token) {
      setError("Invalid profile link.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchPublicLawyerProfile(token, lawyerId)
      .then(setProfile)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load profile.";
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, [lawyerId, token]);

  // Update header title once we have the name
  const headerTitle = profile?.fullName ?? "Lawyer Profile";

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View style={[styles.centered, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading profile...</Text>
        </View>
      </>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error || !profile) {
    return (
      <>
        <Stack.Screen options={{ title: "Profile" }} />
        <View style={[styles.centered, { backgroundColor: theme.background }]}>
          <Ionicons name="person-remove-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Profile not found</Text>
          <Text style={[styles.errorSubtitle, { color: theme.textSecondary }]}>{error ?? "This profile could not be loaded."}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>

        {/* ── Avatar hero ── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{getInitial(profile.fullName)}</Text>
          </View>

          <Text style={styles.heroName}>{profile.fullName}</Text>

          {profile.title ? (
            <Text style={styles.heroTitle}>{profile.title}</Text>
          ) : null}

          {profile.isVerified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={C.verified} />
              <Text style={styles.verifiedText}>Verified Lawyer</Text>
            </View>
          ) : null}
        </View>

        {/* ── Details card ── */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <InfoRow
            theme={theme}
            icon="card-outline"
            label="Syndicate Number"
            value={profile.syndicateCardNumber}
          />
          <Separator theme={theme} />
          <InfoRow
            theme={theme}
            icon="calendar-outline"
            label="Member since"
            value={new Date(profile.createdAt).getFullYear().toString()}
          />
        </View>

        {/* ── Active cities ── */}
        {profile.activeCities.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={16} color={C.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Active in</Text>
            </View>
            <View style={styles.citiesWrap}>
              {profile.activeCities.map((city) => (
                <View key={city.id} style={[styles.cityChip, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Text style={[styles.cityChipText, { color: theme.text }]}>{city.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── WhatsApp CTA ── */}
        <Pressable
          style={({ pressed }) => [styles.whatsAppButton, pressed && { opacity: 0.85 }]}
          onPress={() => openWhatsApp(profile.whatsAppNumber)}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.whatsAppButtonText}>Contact via WhatsApp</Text>
        </Pressable>

      </ScrollView>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  theme,
  icon,
  label,
  value,
}: {
  theme: { text: string; textSecondary: string };
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={C.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function Separator({ theme }: { theme: { border: string } }) {
  return <View style={[styles.separator, { backgroundColor: theme.border }]} />;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 48, gap: 12 },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 32,
    gap: 12,
  },
  loadingText: { color: C.textSecondary, fontSize: 14, marginTop: 4 },

  // Error
  errorTitle: { fontSize: 18, fontWeight: "800", color: C.textPrimary, textAlign: "center" },
  errorSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  backButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  backButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Hero
  heroCard: {
    borderRadius: 16,
    backgroundColor: C.primary,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarInitial: { color: "#FFFFFF", fontSize: 36, fontWeight: "800" },
  heroName: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", textAlign: "center" },
  heroTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    backgroundColor: C.verifiedBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  verifiedText: { color: C.verified, fontWeight: "700", fontSize: 12 },

  // Card
  card: {
    borderRadius: 12,
    backgroundColor: C.card,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Info rows
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoTextWrap: { flex: 1, gap: 2 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: 15, fontWeight: "600", color: C.textPrimary },
  separator: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  // Cities
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: C.primary },
  citiesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cityChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cityChipText: { fontSize: 13, fontWeight: "600", color: C.textPrimary },

  // WhatsApp button
  whatsAppButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "#25D366",
    height: 52,
  },
  whatsAppButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
