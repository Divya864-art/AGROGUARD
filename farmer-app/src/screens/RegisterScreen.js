import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../config/key";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [crop, setCrop] = useState("RICE");

  async function handleRegister() {
    if (!name || !email || !crop) {
      Alert.alert("Error", "Name, Email and Crop are required");
      return;
    }

    const { error } = await supabase
      .from("Profiles")
      .insert({
        name,
        email,
        selected_crop: crop.toLowerCase(),
      });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Account created successfully");
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email (demo email allowed)"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.subTitle}>Select Crop</Text>

      <View style={styles.cropGrid}>
        {["RICE", "TOMATO", "SUGARCANE", "POTATO"].map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.cropBtn,
              crop === c && styles.activeCrop,
            ]}
            onPress={() => setCrop(c)}
          >
            <Text
              style={[
                styles.cropText,
                crop === c && styles.activeText,
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegister}
      >
        <Text style={styles.registerText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already registered? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
  },

  subTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
  },

  cropGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  cropBtn: {
    width: "48%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    marginBottom: 10,
    alignItems: "center",
  },

  activeCrop: {
    backgroundColor: "#2e7d32",
  },

  cropText: {
    fontSize: 13,
  },

  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },

  registerButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  registerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  link: {
    textAlign: "center",
    marginTop: 14,
    color: "#2e7d32",
  },
});
