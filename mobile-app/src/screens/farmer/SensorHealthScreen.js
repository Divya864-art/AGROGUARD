import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import T from "../../components/T";
import { supabase } from "../../config/key";

export default function SensorHealthScreen() {
  const [sensor, setSensor] = useState(null);
  const [healthScore, setHealthScore] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLatestData() {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("soil, temperature, humidity, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data?.length) {
      setSensor(data[0]);
      evaluateHealth(data);
    }

    setLoading(false);
  }

  function evaluateHealth(data) {
    let score = 0;
    let warnings = [];

    const latest = data[0];
    const now = Date.now();
    const lastUpdate = new Date(latest.created_at).getTime();
    const secondsAgo = (now - lastUpdate) / 1000;

    /* ⏱ DEVICE ACTIVITY */
    if (secondsAgo < 15) score += 40;
    else if (secondsAgo < 30) {
      score += 20;
      warnings.push("Sensor updates are delayed");
    } else {
      warnings.push("No data received for over 30 seconds (Device inactive)");
    }

    /* 🌡 TEMPERATURE */
    if (latest.temperature >= -10 && latest.temperature <= 60) score += 15;
    else warnings.push("Temperature sensor reading invalid");

    /* 💧 HUMIDITY */
    if (latest.humidity >= 0 && latest.humidity <= 100) score += 15;
    else warnings.push("Humidity sensor reading invalid");

    /* 🌱 SOIL */
    if (latest.soil > 5) score += 15;
    else warnings.push("Soil moisture sensor not responding");

    /* 🧊 STUCK SENSOR CHECK */
    const soilValues = data.map(d => d.soil);
    const isStuck = soilValues.every(v => v === soilValues[0]);
    if (!isStuck) score += 15;
    else warnings.push("Soil moisture sensor value stuck");

    setHealthScore(Math.min(score, 100));
    setAlerts(warnings);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  const secondsAgo = sensor
    ? Math.floor((Date.now() - new Date(sensor.created_at)) / 1000)
    : null;

  const connectionStatus =
    secondsAgo < 15 ? "Active 🟢" :
    secondsAgo < 30 ? "Weak 🟡" :
    "Inactive 🔴";

  return (
    <ScrollView style={styles.container}>
      {/* DEVICE STATUS */}
      <View style={styles.card}>
        <T style={styles.title}>🔧 Sensor Health Dashboard</T>

        <T style={styles.item}>Device ID: ESP32-01</T>

        <T style={styles.item}>
          Status: <T style={
            secondsAgo < 15 ? styles.green :
            secondsAgo < 30 ? styles.yellow :
            styles.red
          }>
            {connectionStatus}
          </T>
        </T>

        <T style={styles.item}>
          Last Update: {secondsAgo !== null ? `${secondsAgo} sec ago` : "--"}
        </T>
      </View>

      {/* SENSOR STATUS */}
      <View style={styles.card}>
        <T style={styles.subtitle}>🧪 Individual Sensor Status</T>

        <T style={sensor.temperature >= -10 && sensor.temperature <= 60 ? styles.sensorOk : styles.sensorWarn}>
          🌡 Temperature Sensor
        </T>

        <T style={sensor.humidity >= 0 && sensor.humidity <= 100 ? styles.sensorOk : styles.sensorWarn}>
          💧 Humidity Sensor
        </T>

        <T style={sensor.soil > 5 ? styles.sensorOk : styles.sensorWarn}>
          🌱 Soil Moisture Sensor
        </T>
      </View>

      {/* HEALTH SCORE */}
      <View style={styles.card}>
        <T style={styles.subtitle}>🩺 Overall Sensor Health</T>
        <T style={healthScore >= 80 ? styles.green : styles.red}>
          Health Score: {healthScore}% {healthScore >= 80 ? "(Good)" : "(Needs Attention)"}
        </T>
      </View>

      {/* ALERTS */}
      <View style={styles.card}>
        <T style={styles.subtitle}>⚠️ Alerts & Recommendations</T>

        {alerts.length === 0 ? (
          <T style={styles.sensorOk}>All sensors operating normally 🟢</T>
        ) : (
          alerts.map((a, i) => (
            <T key={i} style={styles.sensorWarn}>• {a}</T>
          ))
        )}

        {alerts.length > 0 && (
          <T style={styles.recommend}>
            🛠 Recommendation: Check power supply, wiring, or replace faulty sensor module
          </T>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
  },

  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 15, fontWeight: "bold", marginBottom: 6 },
  item: { fontSize: 14, marginTop: 4 },

  green: { color: "#2e7d32", fontWeight: "bold" },
  yellow: { color: "#f9a825", fontWeight: "bold" },
  red: { color: "#c62828", fontWeight: "bold" },

  sensorOk: { fontSize: 14, marginTop: 6, color: "#2e7d32", fontWeight: "bold" },
  sensorWarn: { fontSize: 14, marginTop: 6, color: "#c62828" },

  recommend: { marginTop: 8, fontStyle: "italic" },
});
