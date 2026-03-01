import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const doctorreport = () => {
  const router = useRouter();

  const { retinalImageId } = useLocalSearchParams();
  const [retinaData, setRetinaData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token || !retinalImageId) return;

      const res = await fetch(
        `${API_BASE_URL}/api/accounts/retina/${retinalImageId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setRetinaData(data);
      }
    };

    fetchData();
  }, [retinalImageId]);

  const isValidated = retinaData?.validated;

  const stage = isValidated
    ? retinaData?.doctor_final_stage
    : retinaData?.predicted_stage;

  const report = retinaData?.report_data ?? null;

  const confidence = retinaData?.confidence
    ? (retinaData.confidence * 100).toFixed(0)
    : null;


  const onDownloadReport = () => {
    // Later: generate PDF + download/share
    Alert.alert("Download Report", "PDF download function can be connected here.");
  };

  const uploader = retinaData?.uploader;


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

            {/* User Information */}
            <View style={styles.profileCard}>
              <Text style={styles.profileLine}>
                Username: {uploader?.username || "--"}
              </Text>

              <Text style={styles.profileLine}>
                Gender: {uploader?.gender || "--"}
              </Text>

              <Text style={styles.profileLine}>
                Date of Birth: {uploader?.date_of_birth
                  ? new Date(uploader.date_of_birth).toLocaleDateString()
                  : "--"}
              </Text>

              <Text style={styles.profileLine}>
                Role: {uploader?.role || "--"}
              </Text>

              <Text style={styles.profileLine}>
                Email: {uploader?.email || "--"}
              </Text>
            </View>

            {/* Medical & Vision */}
            <View style={styles.profileCard}>
                <Text style={styles.sectionTitle}>Medical Conditions</Text>
                <Text style={styles.profileLine}>None</Text>

                <View style={styles.sectionDivider} />

                <Text style={styles.sectionTitle}>Vision Symptoms</Text>
                <Text style={styles.profileLine}>Blurred Vision</Text>
                <Text style={styles.profileLine}>Eye Pressure</Text>
            </View>

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
              <Text style={styles.findingText}>{report?.findings}</Text>
            </View>
          </View>

          {/* Recommendations next steps */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🏥  Recommendations next steps</Text>

            {report?.next_steps?.map((item, index) => (
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
                {report?.diet?.good?.map((item, index) => (
                  <View key={index} style={styles.dietItem}>
                    <Text style={styles.goodIcon}>✅</Text>
                    <Text style={styles.dietText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Red box */}
              <View style={[styles.dietBox, styles.dietBad]}>
                {report?.diet?.avoid?.map((item, index) => (
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

            {report?.exercise?.map((item, index) => (
              <Text key={index} style={styles.infoLine}>
                {item}
              </Text>
            ))}
          </View>

          {/* Prevention tips */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚫  Prevention Tips</Text>

            {report?.prevention?.map((item, index) => (
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
          <TouchableOpacity style={styles.editBtn} onPress={onDownloadReport}>
            <Text style={styles.editText}>Edit Report</Text>
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

export default doctorreport;

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
  backIcon: { 
    fontSize: 22, 
    marginRight: 10 
    },
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
    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#7DBEFF",
    },
    profileLine: {
        fontSize: 15,
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        marginTop: 6,
        marginBottom: 4,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: "#333",
        marginVertical: 8,
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

  editBtn: {
    backgroundColor: "#88C8FF",
    marginTop: 18,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  editText: { fontSize: 16, fontWeight: "800" },

  footerText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    opacity: 0.75,
    paddingHorizontal: 18,
  },
});