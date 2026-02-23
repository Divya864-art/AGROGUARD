import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import T from "../../components/T";
import { supabase } from "../../config/key";
import { generateAlerts } from "../../utils/alertEngine";
import { useAlerts } from "../../context/AlertContext";

export default function AlertScreen() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const { setAlertCount } = useAlerts();

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    setLoading(true);

    /* 👤 Crop from profile */
    const profile = await supabase
      .from("Profiles")
      .select("selected_crop")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const crop = profile.data?.selected_crop;

    /* 🌡 Latest sensor data */
    const sensor = await supabase
      .from("sensor_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    /* 🧬 Latest analysis */
    const analysis = await supabase
      .from("analysis_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const dynamicAlerts = generateAlerts({
      crop,
      sensor: sensor.data,
      analysis: analysis.data,
    });

    setAlerts(dynamicAlerts);
    setAlertCount(dynamicAlerts.length); // 🔔 BADGE UPDATE
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <T style={styles.title}>🚨 Smart Alerts</T>

      {alerts.length === 0 ? (
        <View style={styles.card}>
          <T style={styles.ok}>✅ Crop is Healthy</T>
          <T>All environmental and health conditions are optimal.</T>
        </View>
      ) : (
        alerts.map((a, i) => (
          <View key={i} style={styles.card}>
            <T style={styles.alertTitle}>{a.title}</T>
            <T style={styles.alertText}>{a.message}</T>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f5f7fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  alertTitle: { fontSize: 16, fontWeight: "bold" },
  alertText: { fontSize: 14, color: "#333" },
  ok: { fontSize: 16, fontWeight: "bold", color: "#2e7d32" },
});
