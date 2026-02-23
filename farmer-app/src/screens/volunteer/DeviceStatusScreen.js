import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import api from "../../services/api";

export default function DeviceStatusScreen() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/device/status");
      setStatus(res.data);
    } catch (error) {
      console.log("Error fetching device status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Fetching device status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>📡 Device Status</Text>

      {/* STATUS CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Connection</Text>
        <Text
          style={[
            styles.status,
            status?.online ? styles.online : styles.offline,
          ]}
        >
          {status?.online ? "ONLINE" : "OFFLINE"}
        </Text>

        <Text style={styles.subText}>
          Last Seen: {status?.lastSeen || "Unknown"}
        </Text>
      </View>

      {/* SENSOR HEALTH */}
      <View style={styles.card}>
        <Text style={styles.label}>Sensor Health</Text>

        <Text style={styles.sensor}>
          🌡 Temperature: {status?.sensors?.temperature || "OK"}
        </Text>
        <Text style={styles.sensor}>
          💧 Soil Moisture: {status?.sensors?.soil || "OK"}
        </Text>
        <Text style={styles.sensor}>
          🍃 Leaf Wetness: {status?.sensors?.leaf || "OK"}
        </Text>
      </View>

      {/* ACTIONS */}
      <View style={styles.card}>
        <Text style={styles.label}>Recommended Action</Text>
        {status?.online ? (
          <Text style={styles.actionOk}>
            ✅ Device is functioning normally
          </Text>
        ) : (
          <Text style={styles.actionWarn}>
            ⚠️ Visit field and check power / network
          </Text>
        )}
      </View>

      {/* REFRESH */}
      <TouchableOpacity style={styles.refreshBtn} onPress={fetchStatus}>
        <Text style={styles.refreshText}>🔄 Refresh Status</Text>
      </TouchableOpacity>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2e7d32",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  status: {
    fontSize: 18,
    fontWeight: "bold",
  },
  online: {
    color: "#2e7d32",
  },
  offline: {
    color: "#c62828",
  },
  subText: {
    marginTop: 6,
    fontSize: 12,
    color: "#666",
  },
  sensor: {
    fontSize: 14,
    marginVertical: 2,
  },
  actionOk: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
  actionWarn: {
    color: "#c62828",
    fontWeight: "bold",
  },
  refreshBtn: {
    marginTop: 10,
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
