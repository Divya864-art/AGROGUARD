import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState("FARMER"); // FARMER | VOLUNTEER

  const handleLogin = () => {
    if (role === "FARMER") {
      navigation.replace("Farmer");
    } else {
      navigation.replace("Volunteer");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Crop Intelligence</Text>
      <Text style={styles.subTitle}>Login</Text>

      <TextInput placeholder="Phone / Email" style={styles.input} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />

      {/* ROLE TOGGLE */}
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "FARMER" && styles.activeRole,
          ]}
          onPress={() => setRole("FARMER")}
        >
          <Text
            style={[
              styles.roleText,
              role === "FARMER" && styles.activeText,
            ]}
          >
            🌾 Farmer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "VOLUNTEER" && styles.activeRole,
          ]}
          onPress={() => setRole("VOLUNTEER")}
        >
          <Text
            style={[
              styles.roleText,
              role === "VOLUNTEER" && styles.activeText,
            ]}
          >
            🤝 Volunteer
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.link}>New user? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#ddd",
  },
  activeRole: {
    backgroundColor: "#2e7d32",
  },
  roleText: {
    fontSize: 14,
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    marginTop: 12,
    color: "#2e7d32",
  },
});
