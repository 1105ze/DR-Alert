import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import React from 'react'
import { useRouter } from "expo-router"

const gradcam = () => {
  const router = useRouter();

  // Replace these with real data (from params / state / API)
  const stage = "Severe";
  const confidence = "80%";

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
        <Text style={styles.backText}>Back To Results</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Page title */}
        <View style={styles.pageTitleWrap}>
          <Text style={styles.pageTitle}>AI Explanation</Text>
          <Text style={styles.pageSubTitle}>
            Understanding the classification using Grad-CAM visualization
          </Text>
        </View>

        {/* Classification + confidence card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>Classification Result</Text>
            <View style={styles.stagePill}>
              <Text style={styles.stageText}>{stage}</Text>
            </View>
          </View>

          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>Confidence</Text>
            <Text style={styles.confidenceText}>{confidence}</Text>
          </View>
        </View>

        {/* Heatmap section */}
        <View style={styles.heatmapCard}>
          <Text style={styles.sectionTitle}>Heatmap Visualization</Text>

          <View style={styles.heatmapInner}>
            {/* Heatmap placeholder (put your Grad-CAM image here) */}
            <View style={styles.heatmapBox}>
              {/* Option A: Use local asset */}
              {/* <Image
                source={require("../assets/gradcam_sample.png")}
                style={styles.heatmapImage}
              /> */}

              {/* Option B: Keep placeholder box empty (like your screenshot) */}
            </View>

            <View style={styles.heatmapExplain}>
              <Text style={styles.heatmapExplainText}>
                Red/warm areas indicate regions that strongly influenced the
                AI’s classification. These are the areas the model focused on
                when making its prediction.
              </Text>
            </View>
          </View>
        </View>

        {/* Key Findings */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Key Findings</Text>
          <Text style={styles.infoText}>
            Highlighted regions show abnormal retinal features such as
            hemorrhages or exudates that strongly influenced the AI’s prediction.
          </Text>
        </View>

        {/* About Grad-CAM */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Grad-CAM</Text>
          <Text style={styles.infoText}>
            Grad-CAM visualizes the areas of the retinal image the AI focused on
            when making its classification, improving transparency and trust.
          </Text>
        </View>

        {/* Bottom button */}
        <TouchableOpacity style={styles.bigBtn} onPress={() => router.back()}>
          <Text style={styles.bigBtnText}>Back To Results</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          This is a screening tool only. Consult a healthcare professional for
          diagnosis.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default gradcam;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#EAF6FF" },
  scroll: { paddingBottom: 28 },

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

  pageTitleWrap: { paddingHorizontal: 18, paddingBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: "400" },
  pageSubTitle: { marginTop: 8, fontSize: 14, opacity: 0.85 },

  summaryCard: {
    backgroundColor: "#BFE1FF",
    marginHorizontal: 16,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#7DBEFF",
  },
  summaryLeft: { flex: 1 },
  summaryRight: { alignItems: "flex-end", justifyContent: "center" },
  summaryLabel: { fontSize: 16, fontWeight: "600", color: "#173A73" },

  stagePill: {
    marginTop: 14,
    backgroundColor: "#E9B9B9",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
  },
  stageText: { fontSize: 16 },

  confidenceText: {
    marginTop: 12,
    fontSize: 34,
    fontWeight: "500",
    color: "#173A73",
  },

  heatmapCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D3ECFF",
  },
  sectionTitle: { fontSize: 26, fontWeight: "400", marginBottom: 12 },

  heatmapInner: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#7DBEFF",
    padding: 14,
    backgroundColor: "#F7FCFF",
  },
  heatmapBox: {
    height: 380,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#7DBEFF",
    backgroundColor: "#FFFFFF",
  },
  heatmapImage: { width: "100%", height: "100%", borderRadius: 18 },

  heatmapExplain: {
    marginTop: 14,
    backgroundColor: "#BFE1FF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#7DBEFF",
  },
  heatmapExplainText: { fontSize: 14, lineHeight: 18 },

  infoCard: {
    backgroundColor: "#BFE1FF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#7DBEFF",
  },
  infoTitle: { fontSize: 18, fontWeight: "500", marginBottom: 10 },
  infoText: { fontSize: 14, lineHeight: 18 },

  bigBtn: {
    backgroundColor: "#88C8FF",
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  bigBtnText: { fontSize: 18, fontWeight: "500" },

  footerText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    opacity: 0.75,
    paddingHorizontal: 18,
  },
});