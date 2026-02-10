import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import T from "../../components/T";
import { supabase } from "../../config/key";
/* Reusable components */
import RiskIndicator from "../../components/RiskIndicator";
import SensorCard from "../../components/SensorCard";

export default function DashboardScreen() {

  // 🔹 SENSOR STATES
  const [temperature, setTemperature] = useState("--");
  const [humidity, setHumidity] = useState("--");
  const [soil, setSoil] = useState("--");

  // 🔹 IMAGE STATE
  const [latestImageUrl, setLatestImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);

  const [riskScore, setRiskScore] = useState(0);
  const [riskStatus, setRiskStatus] = useState("SAFE");


  useEffect(() => {
    fetchLatestData();
    fetchLatestImage();
    calculateRisk();
    const interval = setInterval(() => {
      fetchLatestData();
      fetchLatestImage();
      calculateRisk();
    }, 5000); // refresh every 5 sec

    return () => clearInterval(interval);
  }, []);

  // 🔹 FETCH SENSOR DATA
  async function fetchLatestData() {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data?.length > 0) {
      setTemperature(data[0].temperature);
      setHumidity(data[0].humidity);
      setSoil(data[0].soil);
    }
  }
  async function calculateRisk() {
  let score = 0;

  // 🔴 Disease risk
  const { data: analysis } = await supabase
    .from("analysis_results")
    .select("disease, confidence, is_healthy")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (analysis && !analysis.is_healthy) {
    score += 40;

    if (analysis.confidence > 0.7) score += 20;
  }

  // 🌡 Sensor risk
  const { data: sensor } = await supabase
    .from("sensor_data")
    .select("temperature, humidity, soil")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (sensor) {
    if (sensor.temperature > 35 || sensor.temperature < 18) score += 15;
    if (sensor.humidity > 80) score += 15;
    if (sensor.soil < 40) score += 10;
  }

  // 🎯 Clamp score
  score = Math.min(score, 100);

  setRiskScore(score);

  setRiskStatus(
    score > 70 ? "HIGH RISK" :
    score > 40 ? "WARNING" : "SAFE"
  );
}

  // 🔹 FETCH LATEST IMAGE FROM SUPABASE STORAGE
  async function fetchLatestImage() {
  try {
    setLoadingImage(true);

    const res = await supabase
      .storage
      .from("plant-images")
      .list("", {
        limit: 1,
        sortBy: { column: "updated_at", order: "desc" },
      });

    console.log("RAW RESPONSE:", res);

    if (res.error) {
      console.error("Storage error:", res.error.message);
      setLoadingImage(false);
      return;
    }

    if (res.data && res.data.length > 0) {
      const latestFile = res.data[0].name;

      const publicRes = supabase
        .storage
        .from("plant-images")
        .getPublicUrl(latestFile);

      setLatestImageUrl(
        publicRes.data.publicUrl + "?t=" + Date.now()
      );
    } else {
      console.log("No files found in bucket");
    }

    setLoadingImage(false);
  } catch (err) {
    console.error("Unexpected error:", err);
    setLoadingImage(false);
  }
}



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* 🌱 FARM HEALTH */}
      <View style={styles.healthCard}>
        <T style={styles.healthTitle}>🌱 Farm Health Status</T>
        <T style={[
          styles.healthStatus,
          riskScore > 70 ? styles.highRisk :
          riskScore > 40 ? styles.mediumRisk : styles.safe
        ]}>
          {riskStatus}
        </T>
        <T style={styles.riskValue}>Risk Score: {riskScore} / 100</T>
      </View>

      {/* 🌡 SENSORS */}
      <T style={styles.sectionTitle}>Live Field Conditions</T>
      <View style={styles.sensorGrid}>
        <SensorCard title="Temperature" value={`${temperature} °C`} />
        <SensorCard title="Humidity" value={`${humidity} %`} />
        <SensorCard title="Soil Moisture" value={`${soil} %`} />
        <SensorCard title="Leaf Wetness" value="Wet" />
      </View>

      {/* ⚠ RISK */}
      <T style={styles.sectionTitle}>Crop Health Analysis</T>
      <RiskIndicator risk={riskScore} label="Disease Risk Level" />

      {/* 🌱 IMAGE */}
      <View style={styles.cropCard}>
        <T style={styles.cardHeader}>Latest Crop Image</T>

        {loadingImage ? (
          <ActivityIndicator size="large" color="#4caf50" />
        ) : latestImageUrl ? (
          <Image
            source={{ uri: latestImageUrl }}
            style={styles.cropImage}
          />
        ) : (
          <T style={{ textAlign: "center" }}>No image available</T>
        )}

        <T style={styles.cropStatus}>🟡 Early Stress Detected</T>
        <T style={styles.cropSub}>
          Minor discoloration & high humidity observed
        </T>
      </View>

      <T style={styles.footerText}>
        ⏱ Live from field • 🟢
      </T>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 12 },
  healthCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  healthTitle: { fontWeight: "bold", fontSize: 16 },
  healthStatus: { marginTop: 8, fontSize: 20, textAlign: "center" },
  riskValue: { textAlign: "center", color: "#555" },
  safe: { color: "#2e7d32" },
  mediumRisk: { color: "#f9a825" },
  highRisk: { color: "#c62828" },
  sectionTitle: { fontWeight: "bold", marginVertical: 10 },
  sensorGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cropCard: { backgroundColor: "#fff", borderRadius: 14, padding: 12, marginTop: 10 },
  cardHeader: { fontWeight: "bold", marginBottom: 6 },
  cropImage: { width: "100%", height: 180, borderRadius: 10 },
  cropStatus: { marginTop: 8, textAlign: "center", color: "#f9a825" },
  cropSub: { textAlign: "center", color: "#666" },
  footerText: { textAlign: "center", fontSize: 12, color: "#777", marginTop: 10 },
});
