import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LanguageContext } from "../../context/LanguageContext";
import { useTranslate } from "../../hooks/useTranslate";

export default function LanguageScreen() {
  const { language, setLanguage } = useContext(LanguageContext);

  const title = useTranslate("Select Language");
  const info1 = useTranslate("Language saved globally");
  const info2 = useTranslate("App updates dynamically");

  const languages = [
    { code: "ta", label: "தமிழ் (Tamil)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "hi", label: "हिंदी (Hindi)" },
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "en", label: "English" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 {title}</Text>

      {languages.map(lang => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageCard,
            language === lang.code && styles.activeCard,
          ]}
          onPress={() => setLanguage(lang.code)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.languageText,
              language === lang.code && styles.activeText,
            ]}
          >
            {lang.label} {language === lang.code ? "✔" : ""}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>✔ {info1}</Text>
        <Text style={styles.infoText}>✔ {info2}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  languageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  activeCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#2e7d32",
    backgroundColor: "#f1f8f4",
  },
  languageText: {
    fontSize: 16,
    color: "#000",
  },
  activeText: {
    fontWeight: "bold",
    color: "#2e7d32",
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 13,
    color: "#2e7d32",
  },
});
