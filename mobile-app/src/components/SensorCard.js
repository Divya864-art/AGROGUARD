import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SensorCard({ title, value, status }) {
  const getColor = () => {
    if (status === "normal") return "#2e7d32";
    if (status === "warning") return "#f9a825";
    return "#c62828";
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: getColor() }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 3,
  },
  title: {
    fontSize: 13,
    color: "#555",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
});
