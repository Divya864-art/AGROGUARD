import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RiskIndicator({ risk, label }) {
  const color =
    risk < 40 ? "#2e7d32" : risk < 70 ? "#f9a825" : "#c62828";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.risk, { color }]}>{risk}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  risk: {
    fontSize: 28,
    fontWeight: "bold",
  },
});
