import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import T from "../../components/T";
import { askGemini } from "../../services/geminiService";

export default function HelpScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const makePhoneCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleAskExpert = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const response = await askGemini(question);
      setAnswer(response);
    } catch (e) {
      setAnswer("❌ Unable to get response. Try again.");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>

      {/* AI ASSISTANT */}
      <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
        <T style={styles.cardTitle}>🤖 Agri AI Assistant</T>
        <T style={styles.cardSubtitle}>
          Ask anything about crops, disease & sensors
        </T>
      </TouchableOpacity>

      {/* AGRICULTURE OFFICERS */}
      <T style={styles.sectionTitle}>Agriculture Officers</T>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => makePhoneCall("+919876543210")}
        >
          <T style={styles.rowTitle}>📞 District Agriculture Officer</T>
          <T style={styles.rowSubtitle}>+91 98765 43210</T>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => makePhoneCall("+919123456789")}
        >
          <T style={styles.rowTitle}>📞 Local Field Officer</T>
          <T style={styles.rowSubtitle}>+91 91234 56789</T>
        </TouchableOpacity>
      </View>

      {/* EMERGENCY HELPLINES */}
      <T style={styles.sectionTitle}>Emergency Helplines</T>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => makePhoneCall("1551")}
        >
          <T style={styles.rowTitle}>🧑‍🌾 Kisan Call Center</T>
          <T style={styles.rowSubtitle}>1551</T>
        </TouchableOpacity>
      </View>

      {/* AI CHAT MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <T style={styles.modalTitle}>🌾 Agri AI Assistant</T>

          <TextInput
            placeholder="Type your farming question..."
            value={question}
            onChangeText={setQuestion}
            style={styles.input}
            multiline
          />

          <TouchableOpacity style={styles.actionButton} onPress={handleAskExpert}>
            <T style={styles.actionText}>Ask AI</T>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#2e7d32" />}

          {answer ? (
            <ScrollView style={styles.answerBox}>
              <T style={styles.answerText}>{answer}</T>
            </ScrollView>
          ) : null}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
              setQuestion("");
              setAnswer("");
            }}
          >
            <T style={styles.closeText}>Close</T>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: "#555",
  },
  row: {
    paddingVertical: 6,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowSubtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2e7d32",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    minHeight: 80,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  answerBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: "#c62828",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
