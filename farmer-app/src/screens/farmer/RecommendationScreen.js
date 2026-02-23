import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import T from "../../components/T";
import { supabase } from "../../config/key";

const safeText = (v) => (v ? v : "-");

export default function RecommendationScreen() {
  const [latestImageUrl, setLatestImageUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH LATEST IMAGE ---------- */
  async function fetchLatestImage() {
    const { data } = await supabase.storage
      .from("plant-images")
      .list("", {
        limit: 1,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (data?.length) {
      const file = data[0].name;
      const { data: urlData } = supabase.storage
        .from("plant-images")
        .getPublicUrl(file);

      setLatestImageUrl(urlData.publicUrl + "?t=" + Date.now());
    }
  }

  /* ---------- FETCH LATEST ANALYSIS ---------- */
  async function fetchLatestAnalysis() {
    const { data } = await supabase
      .from("analysis_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (data?.length) {
      setAnalysis(data[0]);
    }
  }

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchLatestImage();
      await fetchLatestAnalysis();
      setLoading(false);
    }
    load();
  }, []);

  /* ---------- SCREEN FOCUS REFRESH (CRITICAL) ---------- */
  useFocusEffect(
    useCallback(() => {
      fetchLatestImage();
      fetchLatestAnalysis();
    }, [])
  );

  /* ---------- REALTIME LISTENER ---------- */
  useEffect(() => {
    const channel = supabase
      .channel("analysis-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analysis_results",
        },
        async (payload) => {
          setAnalysis(payload.new);
          await fetchLatestImage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ---------- LOADING ---------- */
  if (loading || !analysis) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  const { crop, disease, is_healthy, confidence, recommendations } = analysis;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* 📷 IMAGE */}
      <View style={styles.imageCard}>
        <T style={styles.cardTitle}>📷 Latest Field Image</T>
        {latestImageUrl ? (
          <Image source={{ uri: latestImageUrl }} style={styles.cropImage} />
        ) : (
          <T>No image available</T>
        )}
      </View>

      {/* 🌱 CROP SUMMARY */}
      <View style={styles.issueCard}>
        <T style={styles.issueTitle}>🌱 Crop</T>
        <T style={styles.issueName}>{crop.toUpperCase()}</T>

        <T style={styles.issueSeverity}>
          Status: {is_healthy ? "Healthy ✅" : "Disease Detected ⚠️"}
        </T>

        {!is_healthy && (
          <>
            <T style={styles.diseaseText}>🦠 {safeText(disease)}</T>
            <T style={styles.confidence}>
              Confidence: {(confidence * 100).toFixed(1)}%
            </T>
          </>
        )}
      </View>

      {/* 🧬 SYMPTOMS */}
      {recommendations?.symptoms?.length > 0 && (
        <View style={styles.infoCard}>
          <T style={styles.cardTitle}>🧬 Symptoms</T>
          {recommendations.symptoms.map((s, i) => (
            <T key={i} style={styles.infoText}>• {s}</T>
          ))}
        </View>
      )}

      {/* 🛡 PREVENTIVE MEASURES */}
      {recommendations?.preventive_measures?.length > 0 && (
        <View style={styles.infoCard}>
          <T style={styles.cardTitle}>🛡 Preventive Measures</T>
          {recommendations.preventive_measures.map((p, i) => (
            <T key={i} style={styles.infoText}>• {p}</T>
          ))}
        </View>
      )}

      {/* ✅ ACTIONS */}
      {recommendations?.actions?.length > 0 && (
        <View style={styles.actionCard}>
          <T style={styles.cardTitle}>✅ Immediate Actions</T>
          {recommendations.actions.map((a, i) => (
            <T key={i} style={styles.actionText}>✔ {a}</T>
          ))}
        </View>
      )}

      {/* 🧪 PROTECTION */}
      {recommendations?.protection?.length > 0 && (
        <View style={styles.infoCard}>
          <T style={styles.cardTitle}>🧪 Protection</T>
          {recommendations.protection.map((p, i) => (
            <T key={i} style={styles.infoText}>• {p}</T>
          ))}
        </View>
      )}

      {/* 🌿 NUTRIENTS */}
      {recommendations?.nutrients && (
        <View style={styles.infoCard}>
          <T style={styles.cardTitle}>🌿 Nutrient Advice</T>

          {recommendations.nutrients.increase?.length > 0 && (
            <T style={styles.infoText}>
              ➕ Increase: {recommendations.nutrients.increase.join(", ")}
            </T>
          )}

          {recommendations.nutrients.avoid?.length > 0 && (
            <T style={styles.infoText}>
              ❌ Avoid: {recommendations.nutrients.avoid.join(", ")}
            </T>
          )}

          {recommendations.nutrients.balance?.length > 0 && (
            <T style={styles.infoText}>
              ⚖ Balance: {recommendations.nutrients.balance.join(", ")}
            </T>
          )}
        </View>
      )}

      {/* ✔ CONFIRM */}
      <TouchableOpacity style={styles.confirmButton}>
        <T style={styles.confirmText}>✔ Action Taken</T>
      </TouchableOpacity>

    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 14 },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  imageCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  cropImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginTop: 8,
  },

  issueCard: {
    backgroundColor: "#fff3e0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  issueTitle: { fontWeight: "bold", color: "#e65100" },
  issueName: { fontSize: 22, fontWeight: "bold", color: "#bf360c" },
  issueSeverity: { marginTop: 6, fontWeight: "bold" },
  diseaseText: { marginTop: 6, color: "#c62828", fontWeight: "bold" },
  confidence: { fontSize: 13, color: "#555" },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  actionCard: {
    backgroundColor: "#e8f5e9",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  cardTitle: { fontWeight: "bold", marginBottom: 6 },
  infoText: { fontSize: 13, color: "#444", marginVertical: 2 },
  actionText: { fontSize: 14, color: "#2e7d32", marginVertical: 2 },

  confirmButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 30,
  },

  confirmText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
