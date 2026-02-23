import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import api from "../../services/api";

export default function RegisterFarmerScreen() {
  const [phone, setPhone] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [language, setLanguage] = useState("Tamil");
  const [loading, setLoading] = useState(false);

  const registerFarmer = async () => {
    if (!phone || !deviceId || !language) {
      Alert.alert("Missing details", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/volunteer/register-farmer", {
        phone,
        device_id: deviceId,
        language,
      });

      Alert.alert("Success", "Farmer registered successfully");

      // reset form
      setPhone("");
      setDeviceId("");
      setLanguage("Tamil");
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to register farmer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>👩‍🌾 Register Farmer</Text>
      <Text style={styles.subHeader}>
        Link farmer with device & language preference
      </Text>

      {/* FORM CARD */}
      <View style={styles.card}>
        {/* PHONE */}
        <Text style={styles.label}>Farmer Phone Number</Text>
        <TextInput
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />

        {/* DEVICE ID */}
        <Text style={styles.label}>Device ID</Text>
        <TextInput
          placeholder="Enter ESP32 Device ID"
          value={deviceId}
          onChangeText={setDeviceId}
          style={styles.input}
        />

        {/* LANGUAGE */}
        <Text style={styles.label}>Preferred Language</Text>
        <View style={styles.languageRow}>
          {["Tamil", "Telugu", "Hindi", "English"].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.langButton,
                language === lang && styles.activeLang,
              ]}
              onPress={() => setLanguage(lang)}
            >
              <Text
                style={[
                  styles.langText,
                  language === lang && styles.activeLangText,
                ]}
              >
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* REGISTER BUTTON */}
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={registerFarmer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerText}>
              ✔ Register Farmer
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        ℹ Registration done by authorized volunteer
      </Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    backgroundColor: "#f1f3f6",
    padding: 10,
    borderRadius: 8,
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  langButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
  },
  activeLang: {
    backgroundColor: "#2e7d32",
  },
  langText: {
    fontSize: 13,
  },
  activeLangText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerBtn: {
    backgroundColor: "#2e7d32",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  registerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  footer: {
    marginTop: 12,
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
});
