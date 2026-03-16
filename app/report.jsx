import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const report = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    useEffect(() => {
      const loadUser = async () => {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      };

      loadUser();
    }, []);

  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/accounts/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile_image) {
          setProfileImage(
            data.profile_image.startsWith("data:")
              ? data.profile_image
              : `data:image/jpeg;base64,${data.profile_image}`
          );
        }
      }
    };

    loadProfileImage();
  }, []);

    const { retinalImageId } = useLocalSearchParams();
    const [reportData, setReportData] = useState(null);
    const [retinaData, setRetinaData] = useState(null);

    useEffect(() => {
      const loadReport = async () => {
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
          setReportData(data.report_data);
        }
      };

      loadReport();
    }, [retinalImageId]);

    const isValidated = retinaData?.validated;

    const stageToShow =
      retinaData?.validated
        ? retinaData?.doctor_final_stage
        : retinaData?.predicted_stage;

  const confidenceToShow = retinaData?.validated
    ? "Doctor Verified"
    : retinaData?.confidence != null
    ? `${Math.round(retinaData.confidence * 100)}%`
    : "--";


  const uploader = retinaData?.uploader;

  const onDownloadReport = async () => {
    try {

      const html = `
      <html>
      <body style="font-family: Arial; padding:20px">

      <h1>Diabetic Retinopathy Screening Report</h1>

      <h2>Patient Information</h2>
      <p><b>Username:</b> ${uploader?.username || "--"}</p>
      <p><b>Gender:</b> ${uploader?.gender || "--"}</p>
      <p><b>Date of Birth:</b> ${uploader?.date_of_birth || "--"}</p>
      <p><b>Email:</b> ${uploader?.email || "--"}</p>

      <h2>Detection Result</h2>
      <p><b>Stage:</b> ${stageToShow}</p>
      <p><b>${retinaData?.validated ? "Status" : "Confidence"}:</b> ${confidenceToShow}</p>

      <h2>Next Steps</h2>
      ${nextSteps.map(i => `<p>• ${i}</p>`).join("")}

      <h2>Diet Recommendations</h2>
      <h3>Recommended</h3>
      ${dietGood.map(i => `<p>• ${i}</p>`).join("")}

      <h3>Avoid</h3>
      ${dietAvoid.map(i => `<p>• ${i}</p>`).join("")}

      <h2>Exercise</h2>
      ${exercise.map(i => `<p>• ${i}</p>`).join("")}

      <h2>Prevention Tips</h2>
      ${prevention.map(i => `<p>• ${i}</p>`).join("")}

      <br/>
      <p><b>Important:</b> Eye Exam every 6-12 months.</p>

      <br/><br/>
      <p style="font-size:12px;color:gray">
      This is a screening tool only. Consult a healthcare professional for diagnosis.
      </p>

      </body>
      </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      const pdfPath = FileSystem.documentDirectory + "DR_Report.pdf";

      await FileSystem.moveAsync({
        from: uri,
        to: pdfPath,
      });

      await Sharing.shareAsync(pdfPath);

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to generate report");
    }
  };

  const currentTemplate = reportData || {};

  const findings = currentTemplate.findings || "No findings available.";
  const nextSteps = currentTemplate.next_steps || [];
  const dietGood = currentTemplate.diet?.good || [];
  const dietAvoid = currentTemplate.diet?.avoid || [];
  const exercise = currentTemplate.exercise || [];
  const prevention = currentTemplate.prevention || [];

  if (!retinaData) {
    return (
      <SafeAreaView style={styles.page}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Loading report...
        </Text>
      </SafeAreaView>
    );
  }

  const getStageColor = (stage) => {
    switch (stage) {
      case "No DR":
        return "#4CAF50";
      case "Mild":
        return "#13a09b";
      case "Moderate":
        return "#FFC107";
      case "Severe":
        return "#d16d37";
      case "Proliferative":
        return "#F44336";
    }
  };

  const stageColor = getStageColor(stageToShow);


  return (
    <SafeAreaView style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profile} onPress={() => router.push('/profile')}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../assets/people_icon.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>DR Detection</Text>
          <Text style={styles.headerSubtitle}>Diabetic Retinopathy Screening</Text>
        </View>
        <Text style={styles.username}>{user ? user.username : ""}</Text>
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
          <View style={[styles.resultCard, { backgroundColor: stageColor }]}>
            <View
              style={[
                styles.resultIconCircle,
                { backgroundColor: stageColor },
              ]}
            >
              <Text style={styles.resultIcon}>!</Text>
            </View>

            <Text style={styles.resultStage}>
              {stageToShow || "Loading..."}
            </Text>

            <Text style={styles.resultConfidence}>
              {isValidated
                ? `Status: ${confidenceToShow}`
                : `Confidence: ${confidenceToShow}`
              }
            </Text>

            <View style={styles.findingPill}>
              <Text style={styles.findingText}>
                {retinaData?.validated
                  ? `${stageToShow} diabetic retinopathy confirmed.`
                  : `${stageToShow} diabetic retinopathy detected.`}
              </Text>
            </View>
          </View>

          {/* Recommendations next steps */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🏥  Recommendations next steps</Text>

            {nextSteps.map((item, index) => (
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
                {dietGood.map((item, index) => (
                  <View key={index} style={styles.dietItem}>
                    <Text style={styles.goodIcon}>✅</Text>
                    <Text style={styles.dietText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Red box */}
              <View style={[styles.dietBox, styles.dietBad]}>
                {dietAvoid.map((item, index) => (
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

            {exercise.map((item, index) => (
              <Text key={index} style={styles.infoLine}>
                {item}
              </Text>
            ))}
          </View>

          {/* Prevention tips */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚫  Prevention Tips</Text>

            {prevention.map((item, index) => (
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
  flexDirection: "row",
  marginTop: 10,
  backgroundColor: "#88C8FF",
  paddingVertical: 15,
},

profile: {
  width: 56,
  height: 56,
  borderRadius: 28,
  marginLeft: 30,
  borderWidth: 3,
  borderColor: "#54adfa",
  backgroundColor: "#aad5fc",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
},

profileImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},

headerTitleWrap: {
  flex: 1,
  marginTop: 5,
},

headerTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginLeft: 10,
},

headerSubtitle: {
  fontSize: 14,
  marginLeft: 10,
  marginTop: 8,
},

username: {
  fontSize: 18,
  fontWeight: "bold",
  marginRight: 30,
  marginTop: 18,
},

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
  resultStage: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
  },
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
  dietText: {   
      fontSize: 15,
      flex: 1,
      flexWrap: "wrap", 
    },

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