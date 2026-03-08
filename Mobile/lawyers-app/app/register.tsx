import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { fetchCourtsAndCities } from "@/lib/features/lookups/api";
import type { LookupCity } from "@/lib/features/lookups/types";
import { registerLawyer } from "@/lib/features/lawyers/api";

type CityOption = {
  id: string;
  name: string;
};

const countries = [
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
];

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [syndicateCardNumber, setSyndicateCardNumber] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [countryCode, setCountryCode] = useState({ code: "+20", flag: "🇪🇬" });
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [citiesLookup, setCitiesLookup] = useState<LookupCity[]>([]);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);

  const [isLoadingLookups, setIsLoadingLookups] = useState(false);
  const [lookupsError, setLookupsError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const cities = useMemo<CityOption[]>(
    () =>
      citiesLookup.map((city) => ({
        id: city.id,
        name: city.name,
      })),
    [citiesLookup],
  );

  const loadLookups = async () => {
    setIsLoadingLookups(true);
    setLookupsError(null);

    try {
      const data = await fetchCourtsAndCities();
      setCitiesLookup(data);
    } catch {
      setLookupsError("Failed to load cities list.");
    } finally {
      setIsLoadingLookups(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  const toggleCity = (cityId: string) => {
    setSelectedCityIds((prev) =>
      prev.includes(cityId) ? prev.filter((id) => id !== cityId) : [...prev, cityId],
    );
  };

  const handleSubmit = async () => {
    if (
      !fullName.trim() ||
      !syndicateCardNumber.trim() ||
      !whatsAppNumber.trim() ||
      !email.trim() ||
      !password.trim() ||
      selectedCityIds.length === 0
    ) {
      setSubmitError("Please complete all required fields and select at least one city.");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    let rawPhone = whatsAppNumber.trim();
    if (rawPhone.startsWith("0")) {
      rawPhone = rawPhone.substring(1);
    }
    const formattedWhatsApp = countryCode.code + " " + rawPhone;

    try {
      await registerLawyer({
        fullName: fullName.trim(),
        title: title.trim() || "Lawyer",
        syndicateCardNumber: syndicateCardNumber.trim(),
        whatsAppNumber: formattedWhatsApp,
        cityIds: selectedCityIds,
        email: email.trim(),
        password,
      });

      setSubmitSuccess("Registration submitted successfully. Wait for admin approval.");
      setTimeout(() => {
        router.replace("/login");
      }, 900);
    } catch {
      setSubmitError("Registration failed. Check data and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Lawyer Registration" }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Lawyer Registration</Text>
        <Text style={styles.subtitle}>Create your lawyer account request.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput value={fullName} onChangeText={setFullName} style={styles.input} />

          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Lawyer"
            style={styles.input}
          />

          <Text style={styles.label}>Syndicate Card Number *</Text>
          <TextInput
            value={syndicateCardNumber}
            onChangeText={setSyndicateCardNumber}
            style={styles.input}
          />

          <Text style={styles.label}>WhatsApp Number *</Text>
          <View style={styles.whatsAppRow}>
            <TouchableOpacity
              onPress={() => setIsDropdownVisible(true)}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text style={styles.whatsAppPrefix}>
                {countryCode.flag} {countryCode.code}
              </Text>
              <Ionicons
                name="chevron-down-outline"
                size={16}
                color="#0A2540"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
            <View style={styles.whatsAppDivider} />
            <TextInput
              value={whatsAppNumber}
              onChangeText={setWhatsAppNumber}
              keyboardType="phone-pad"
              placeholder="1015985768"
              placeholderTextColor="#999999"
              style={styles.whatsAppInput}
            />
            {isDropdownVisible && (
              <View style={styles.dropdown}>
                <ScrollView
                  nestedScrollEnabled
                  style={{ maxHeight: 200 }}
                  showsVerticalScrollIndicator
                >
                  {countries.map((item) => (
                    <TouchableOpacity
                      key={item.code}
                      onPress={() => {
                        setCountryCode(item);
                        setIsDropdownVisible(false);
                      }}
                      style={styles.dropdownRow}
                    >
                      <Text style={styles.dropdownText}>
                        {item.flag} {item.code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <Text style={styles.label}>Email *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.labelInline}>Active Cities *</Text>
            <Pressable onPress={loadLookups}>
              <Text style={styles.reloadText}>Reload</Text>
            </Pressable>
          </View>

          {isLoadingLookups ? (
            <View style={styles.row}>
              <ActivityIndicator size="small" color="#1f5bd8" />
              <Text style={styles.helperText}>Loading cities...</Text>
            </View>
          ) : lookupsError ? (
            <Text style={styles.errorText}>{lookupsError}</Text>
          ) : (
            <View style={styles.citiesWrap}>
              {cities.map((city) => {
                const selected = selectedCityIds.includes(city.id);
                return (
                  <Pressable
                    key={city.id}
                    onPress={() => toggleCity(city.id)}
                    style={[styles.cityChip, selected ? styles.cityChipActive : null]}
                  >
                    <Text style={[styles.cityText, selected ? styles.cityTextActive : null]}>
                      {city.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[styles.submitButton, isSubmitting ? { opacity: 0.7 } : null]}
        >
          <Text style={styles.submitText}>{isSubmitting ? "Submitting..." : "Register"}</Text>
        </Pressable>

        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        {submitSuccess ? <Text style={styles.successText}>{submitSuccess}</Text> : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6fb",
  },
  content: {
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#13294b",
  },
  subtitle: {
    marginTop: 6,
    color: "#5b7297",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d7e1f3",
    backgroundColor: "#fff",
    padding: 14,
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    color: "#2c3f61",
    fontWeight: "600",
    fontSize: 13,
  },
  labelInline: {
    color: "#2c3f61",
    fontWeight: "700",
    fontSize: 13,
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
  whatsAppRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F2EF",
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 16,
    position: "relative",
    zIndex: 50,
    elevation: 50,
  },
  dropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    width: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 100,
    zIndex: 100,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F2EF",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  whatsAppPrefix: {
    fontSize: 16,
    color: "#0A2540",
    fontWeight: "bold",
    marginRight: 8,
  },
  whatsAppDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#CCC",
    marginRight: 8,
  },
  whatsAppInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2e49",
    padding: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reloadText: {
    color: "#1f5bd8",
    fontWeight: "700",
  },
  helperText: {
    color: "#60769a",
  },
  citiesWrap: {
    marginTop: 10,
    gap: 8,
  },
  cityChip: {
    borderWidth: 1,
    borderColor: "#d7e1f3",
    backgroundColor: "#f9fbff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  submitButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#1f5bd8",
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "#b13550",
  },
  successText: {
    color: "#1e7a3e",
  },
});
