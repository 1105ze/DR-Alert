import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

const report = () => {
    const router = useRouter();

  // Temporary backend simulation (until model integration)
  const stageFromBackend = null;
  const confidenceFromBackend = null;

  // Fallback values
  const fallbackStage = "Severe";
  const fallbackConfidence = 80;

  const stage = stageFromBackend || fallbackStage;
  const confidence = confidenceFromBackend ?? fallbackConfidence;

  const onDownloadReport = () => {
    // Later: generate PDF + download/share
    Alert.alert("Download Report", "PDF download function can be connected here.");
  };

  const stageTemplates = {
    "No DR": {
      findings: "No signs of diabetic retinopathy detected.",
      nextSteps: [
        "Routine eye check every 12 months",
        "Maintain stable blood glucose level"
      ],
      diet: {
        good: ["Balanced diet", "Leafy greens", "Whole grains"],
        avoid: ["Excess sugar", "Processed snacks"]
      },
      exercise: [
        "At least 150 minutes light activity weekly",
        "Regular walking or stretching"
      ],
      prevention: [
        "Annual eye screening",
        "Monitor blood sugar regularly"
      ]
    },

    "Mild": {
      findings: "Mild non-proliferative diabetic retinopathy detected.",
      nextSteps: [
        "Follow-up every 6–12 months",
        "Improve glucose control"
      ],
      diet: {
        good: ["Omega-3 fish", "Vegetables", "Low GI food"],
        avoid: ["Sugary drinks", "High carbohydrate snacks"]
      },
      exercise: [
        "Moderate exercise 150 minutes per week",
        "Light strength training"
      ],
      prevention: [
        "Regular eye monitoring",
        "Control blood pressure"
      ]
    },

    "Moderate": {
      findings: "Moderate diabetic retinopathy detected.",
      nextSteps: [
        "Consult ophthalmologist within 3 months",
        "Retinal imaging follow-up required"
      ],
      diet: {
        good: ["High fiber food", "Lean protein", "Green vegetables"],
        avoid: ["Fried food", "Sweet desserts"]
      },
      exercise: [
        "Regular walking or cycling",
        "Avoid intense exercise if unstable glucose"
      ],
      prevention: [
        "Strict sugar monitoring",
        "Eye exam every 6 months"
      ]
    },

    "Severe": {
      findings: "Severe diabetic retinopathy detected.",
      nextSteps: [
        "Immediate ophthalmologist appointment",
        "Possible treatment discussion",
        "Retinal imaging follow-up"
      ],
      diet: {
        good: ["Leafy greens", "Omega-3 rich fish", "Whole grains"],
        avoid: ["Sugary foods", "Sweetened drinks", "Fried food"]
      },
      exercise: [
        "Moderate physical activity weekly",
        "Avoid high-intensity exercise"
      ],
      prevention: [
        "Frequent eye examinations",
        "Strict glucose control",
        "Avoid smoking"
      ]
    },

    "Proliferative": {
      findings: "Proliferative diabetic retinopathy detected.",
      nextSteps: [
        "Urgent specialist referral",
        "Possible laser or surgical treatment"
      ],
      diet: {
        good: ["Low sugar diet", "High fiber vegetables"],
        avoid: ["All refined sugars", "High fat food"]
      },
      exercise: [
        "Light exercise only",
        "Avoid strain or heavy lifting"
      ],
      prevention: [
        "Immediate medical supervision",
        "Frequent retinal monitoring"
      ]
    }
  };

  const currentTemplate = stageTemplates[stage] ?? stageTemplates["No DR"];

  return (
    <SafeAreaView style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle} />
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>DR Detection</Text>
          <Text style={styles.headerSubtitle}>Diabetic Retinopathy Screening</Text>
        </View>
        <Text style={styles.headerName}>Ze Gui</Text>
      </View>

      {/* Back row */}
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.backText}>Result</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Main container card (light background) */}
        <View style={styles.containerCard}>
          {/* Result block (pink) */}
          <View style={styles.resultCard}>
            <View style={styles.resultIconCircle}>
              <Text style={styles.resultIcon}>!</Text>
            </View>

            <Text style={styles.resultStage}>{stage}</Text>
            <Text style={styles.resultConfidence}>
              Confidence: {confidence}%
            </Text>

            <View style={styles.findingPill}>
              <Text style={styles.findingText}>{currentTemplate.findings}</Text>
            </View>
          </View>

          {/* Recommendations next steps */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🏥  Recommendations next steps</Text>

            {currentTemplate.nextSteps.map((item, index) => (
              <Text key={index} style={styles.infoLine}>
                {item}
              </Text>
            ))}
          </View>

          {/* Diet recommendations */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🥦  Diet Recommendations</Text>

            <View style={styles.dietRow}>
              
              {/* Green box */}
              <View style={[styles.dietBox, styles.dietGood]}>
                {currentTemplate.diet.good.map((item, index) => (
                  <View key={index} style={styles.dietItem}>
                    <Text style={styles.goodIcon}>✅</Text>
                    <Text style={styles.dietText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Red box */}
              <View style={[styles.dietBox, styles.dietBad]}>
                {currentTemplate.diet.avoid.map((item, index) => (
                  <View key={index} style={styles.dietItem}>
                    <Text style={styles.badIcon}>❌</Text>
                    <Text style={styles.dietText}>{item}</Text>
                  </View>
                ))}
              </View>

            </View>
          </View>

          {/* Exercise recommendations */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚴‍♂️  Exercise Recommendations</Text>

            {currentTemplate.exercise.map((item, index) => (
              <Text key={index} style={styles.infoLine}>
                {item}
              </Text>
            ))}
          </View>

          {/* Prevention tips */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚫  Prevention Tips</Text>

            {currentTemplate.prevention.map((item, index) => (
              <View key={index}>
                <View style={styles.tipRow}>
                  <Text style={styles.tipText}>{item}</Text>
                </View>
                <View style={styles.tipDivider} />
              </View>
            ))}
          </View>

          {/* Important */}
          <View style={styles.importantWrap}>
            <Text style={styles.importantTitle}>❗ Important</Text>
            <Text style={styles.importantText}>Eye Exam every 6-12 months</Text>
          </View>

          {/* Download button */}
          <TouchableOpacity style={styles.downloadBtn} onPress={onDownloadReport}>
            <Text style={styles.downloadText}>Download Report</Text>
          </TouchableOpacity>
        </View>

        {/* Footer note */}
        <Text style={styles.footerText}>
          This is a screening tool only. Consult a healthcare professional for
          diagnosis.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default report;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#EAF6FF" },

  header: {
    backgroundColor: "#88C8FF",
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#BFE1FF",
    borderWidth: 3,
    borderColor: "#6BB6FF",
  },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSubtitle: { marginTop: 6, fontSize: 13 },
  headerName: { fontSize: 16, fontWeight: "800" },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  backIcon: { fontSize: 22, marginRight: 10 },
  backText: { fontSize: 18 },

  scroll: { paddingBottom: 28 },

  containerCard: {
    backgroundColor: "#F7FCFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D3ECFF",
  },

  resultCard: {
    backgroundColor: "#F29292",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  resultIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "#222",
    backgroundColor: "#F29292",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  resultIcon: { fontSize: 26, fontWeight: "900", color: "#111" },
  resultStage: { fontSize: 18, fontWeight: "400", marginTop: 6 },
  resultConfidence: { fontSize: 16, marginTop: 10 },
  findingPill: {
    backgroundColor: "#BFE1FF",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#7DBEFF",
    width: "90%",
    alignItems: "center",
  },
  findingText: { fontSize: 15, fontWeight: "500" },

  infoCard: {
    backgroundColor: "#BFE1FF",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#7DBEFF",
  },
  infoTitle: { fontSize: 16, fontWeight: "500", marginBottom: 10 },
  infoLine: { fontSize: 15, marginBottom: 10, lineHeight: 20 },

  dietRow: { flexDirection: "row", gap: 12 },
  dietBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  dietGood: { backgroundColor: "#A8FF9F", borderColor: "#4EEA4E" },
  dietBad: { backgroundColor: "#F29292", borderColor: "#E04C4C" },

  dietItem: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  goodIcon: { fontSize: 18, marginRight: 10 },
  badIcon: { fontSize: 18, marginRight: 10 },
  dietText: { fontSize: 15 },

  tipRow: { paddingVertical: 6 },
  tipText: { fontSize: 15 },
  tipDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    marginTop: 4,
  },

  importantWrap: {
    marginTop: 14,
    paddingHorizontal: 2,
  },
  importantTitle: { color: "#C80000", fontWeight: "800", fontSize: 16 },
  importantText: { marginTop: 6, fontSize: 15 },

  downloadBtn: {
    backgroundColor: "#88C8FF",
    marginTop: 18,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  downloadText: { fontSize: 16, fontWeight: "800" },

  footerText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    opacity: 0.75,
    paddingHorizontal: 18,
  },
});