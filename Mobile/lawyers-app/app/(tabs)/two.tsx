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
import type { LookupCourt } from "@/lib/features/lookups/types";
import { fetchMyLawyerProfile, updateMyLawyerProfile } from "@/lib/features/lawyers/api";
import type { MyLawyerProfile } from "@/lib/features/lawyers/types";

type CityOption = {
  id: string;
  name: string;
  courtName: string;
};

export default function ProfileTab() {
  const router = useRouter();
  const { token, signOut } = useSession();

  const [profile, setProfile] = useState<MyLawyerProfile | null>(null);
  const [courts, setCourts] = useState<LookupCourt[]>([]);

  const [title, setTitle] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [cityIds, setCityIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const cities = useMemo<CityOption[]>(
    () =>
      courts.flatMap((court) =>
        court.cities.map((city) => ({
          id: city.id,
          name: city.name,
          courtName: court.name,
        })),
      ),
    [courts],
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
      setCourts(lookupData);
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
    if (!token) {
      setError("No auth token available.");
      return;
    }

    if (!title.trim() || !whatsAppNumber.trim() || cityIds.length === 0) {
      setSaveMessage("Please fill title, WhatsApp and select at least one city.");
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

      setSaveMessage("Profile updated successfully.");
      setIsEditing(false);
      await loadProfile();
    } catch {
      setSaveMessage("Failed to update profile.");
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
        <ActivityIndicator size="large" color="#1f5bd8" />
        <Text style={styles.helperText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Failed to load profile."}</Text>
        <Pressable onPress={loadProfile} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Verified Lawyer</Text>
        <Text style={styles.heroName}>{profile.fullName}</Text>
        <Text style={styles.heroMeta}>Syndicate: {profile.syndicateCardNumber}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Title</Text>
        <Text style={styles.value}>{profile.title || "-"}</Text>

        <Text style={styles.label}>WhatsApp</Text>
        <Text style={styles.value}>{profile.whatsAppNumber || "-"}</Text>

        <Text style={styles.label}>Active Cities</Text>
        <Text style={styles.value}>
          {profile.activeCities.length
            ? profile.activeCities.map((city) => city.name).join(", ")
            : "-"}
        </Text>
      </View>

      {!isEditing ? (
        <Pressable
          onPress={() => {
            resetFormFromProfile();
            setSaveMessage(null);
            setIsEditing(true);
          }}
          style={styles.editButton}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </Pressable>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>

          <Text style={styles.label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} style={styles.input} />

          <Text style={styles.label}>WhatsApp Number</Text>
          <TextInput
            value={whatsAppNumber}
            onChangeText={setWhatsAppNumber}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Active Cities</Text>
          <View style={styles.citiesWrap}>
            {cities.map((city) => {
              const selected = cityIds.includes(city.id);
              return (
                <Pressable
                  key={city.id}
                  onPress={() => toggleCity(city.id)}
                  style={[styles.cityChip, selected ? styles.cityChipActive : null]}
                >
                  <Text style={[styles.cityText, selected ? styles.cityTextActive : null]}>
                    {city.name} ({city.courtName})
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => {
                resetFormFromProfile();
                setSaveMessage(null);
                setIsEditing(false);
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={[styles.saveButton, isSaving ? { opacity: 0.7 } : null]}
            >
              <Text style={styles.saveText}>{isSaving ? "Saving..." : "Save Changes"}</Text>
            </Pressable>
          </View>

          {saveMessage ? <Text style={styles.helperText}>{saveMessage}</Text> : null}
        </View>
      )}

      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fc",
    padding: 16,
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
  heroName: {
    marginTop: 4,
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
  },
  heroMeta: {
    marginTop: 8,
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
    marginBottom: 4,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 13,
    color: "#5b7297",
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a2f52",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d2deef",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fbfdff",
    color: "#1f2e49",
  },
  citiesWrap: {
    marginTop: 6,
    gap: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cityChip: {
    borderWidth: 1,
    borderColor: "#d7e1f3",
    backgroundColor: "#f9fbff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cityChipActive: {
    borderColor: "#1f5bd8",
    backgroundColor: "#eaf1ff",
  },
  cityText: {
    color: "#2c3f61",
    fontSize: 13,
  },
  cityTextActive: {
    color: "#1744a9",
    fontWeight: "700",
  },
  editButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#1f5bd8",
    alignItems: "center",
    justifyContent: "center",
  },
  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cad8f1",
    backgroundColor: "#f7faff",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#35507b",
    fontWeight: "700",
  },
  saveButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1f5bd8",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  helperText: {
    marginTop: 10,
    color: "#60769a",
  },
  errorText: {
    color: "#b13550",
    marginBottom: 10,
  },
  retryButton: {
    borderRadius: 10,
    backgroundColor: "#1f5bd8",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4c4cc",
    backgroundColor: "#fff2f5",
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#b13550",
    fontSize: 15,
    fontWeight: "700",
  },
});
