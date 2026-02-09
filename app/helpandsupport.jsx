import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from "expo-router"

const RowItem = ({ children }) => {
  return <View style={styles.rowItem}>{children}</View>;
};

const helpandsupport = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* FAQs */}
          <Text style={styles.sectionTitle}>FAQs</Text>

          <RowItem>
            <Text style={styles.qMark}>?</Text>
            <Text style={styles.rowText}>
              What is Diabetic Retinopathy?
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.qMark}>?</Text>
            <Text style={styles.rowText}>
              Is this app a medical diagnosis tool?
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.qMark}>?</Text>
            <Text style={styles.rowText}>
              How accurate are the AI results?
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.qMark}>?</Text>
            <Text style={styles.rowText}>
              What should I do if result is Severe?
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.qMark}>?</Text>
            <Text style={styles.rowText}>
              Who can see my uploaded images?
            </Text>
          </RowItem>

          {/* How to Use */}
          <Text style={styles.sectionTitle}>How to Use the App</Text>

          <RowItem>
            <Text style={styles.number}>1.</Text>
            <Text style={styles.rowText}>
              Upload a clear retinal fundus image
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.number}>2.</Text>
            <Text style={styles.rowText}>Wait for AI analysis</Text>
          </RowItem>

          <RowItem>
            <Text style={styles.number}>3.</Text>
            <Text style={styles.rowText}>
              View diagnosis and confidence score
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.number}>4.</Text>
            <Text style={styles.rowText}>
              Check AI explanation (Grad-CAM)
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.number}>5.</Text>
            <Text style={styles.rowText}>
              View report and recommendations
            </Text>
          </RowItem>

          {/* Understanding Results */}
          <Text style={styles.sectionTitle}>Understanding Results</Text>

          <RowItem>
            <Text style={styles.greenDot}>●</Text>
            <Text style={styles.rowText}>No DR – No signs detected</Text>
          </RowItem>

          <RowItem>
            <Text style={styles.yellowDot}>●</Text>
            <Text style={styles.rowText}>
              Mild / Moderate – Early changes detected
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.redDot}>●</Text>
            <Text style={styles.rowText}>
              Severe / Proliferative – Urgent medical attention advised
            </Text>
          </RowItem>

          {/* Contact */}
          <Text style={styles.sectionTitle}>Contact</Text>

          <RowItem>
            <Text style={styles.icon}>✉️</Text>
            <Text style={styles.rowText}>
              Email Support: support@drscreening.app
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.icon}>📞</Text>
            <Text style={styles.rowText}>
              Hotline (optional / mock): +60 12-345 6789
            </Text>
          </RowItem>

          <RowItem>
            <Text style={styles.icon}>🕒</Text>
            <Text style={styles.rowText}>
              Support Hours: Mon–Fri, 9AM–5PM
            </Text>
          </RowItem>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a screening tool only. Consult a healthcare professional for
            diagnosis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default helpandsupport

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#88C8FF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  backBtn: { padding: 8, marginRight: 8 },
  backIcon: { fontSize: 24, fontWeight: "700" },
  headerTitle: { fontSize: 22, fontWeight: "800" },

  scroll: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 26,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 12,
  },

  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
  },

  rowText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },

  qMark: {
    color: "red",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 12,
  },

  number: {
    fontSize: 16,
    fontWeight: "900",
    marginRight: 12,
  },

  greenDot: { color: "green", fontSize: 16, marginRight: 12 },
  yellowDot: { color: "#F4B400", fontSize: 16, marginRight: 12 },
  redDot: { color: "red", fontSize: 16, marginRight: 12 },

  icon: {
    fontSize: 16,
    marginRight: 12,
  },

  footer: {
    marginTop: 18,
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    opacity: 0.75,
    textAlign: "center",
  },
});