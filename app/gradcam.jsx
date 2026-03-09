import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import React from 'react'
import { useRouter } from "expo-router"
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { useLocalSearchParams } from "expo-router";

const gradcam = () => {
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
  const [retinaData, setRetinaData] = useState(null);

    useEffect(() => {
    const loadRetina = async () => {
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

    loadRetina();
  }, [retinalImageId]);

    const stage = retinaData?.predicted_stage;

    const confidence =
      retinaData?.confidence != null
        ? `${Math.round(retinaData.confidence * 100)}%`
        : "--";

    const isValidated = retinaData?.validated;

    const finalStage = isValidated
      ? retinaData?.doctor_final_stage
      : retinaData?.predicted_stage;

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
        default:
          return "#333";
      }
    };

    const finalStageColor = getStageColor(finalStage);


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
              <Text style={styles.stageText}>{stage || "Unknown"}</Text>
            </View>
          </View>

          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>Confidence</Text>
            <Text style={styles.confidenceText}>{confidence || "--"}</Text>
          </View>
        </View>

        {isValidated && (
          <View style={styles.findingCard}>
            <Text style={styles.findingTitle}>Doctor Findings</Text>

            <Text style={styles.findingLine}>
              Final DR Stage: 
              <Text style={{ color: finalStageColor, fontWeight: "700" }}>
                {" "}{finalStage || "--"}
              </Text>
            </Text>

            <Text style={styles.findingLine}>
              Validation Status: Doctor Validated
            </Text>

            <Text style={styles.findingExplain}>
              The diagnosis has been reviewed and confirmed by a medical professional.
            </Text>
          </View>
        )}

        {/* Heatmap section */}
        <View style={styles.heatmapCard}>
          <Text style={styles.sectionTitle}>Heatmap Visualization</Text>

          <View style={styles.heatmapInner}>
            {/* Heatmap placeholder (put your Grad-CAM image here) */}
            <View style={styles.heatmapBox}>
              {retinaData?.gradcam_image ? (
                <Image
                  source={{
                    uri: `data:image/png;base64,${retinaData.gradcam_image}`,
                  }}
                  style={styles.heatmapImage}
                />
              ) : (
                <Text style={{ textAlign: "center", marginTop: 160, opacity: 0.5 }}>
                  Heatmap not available
                </Text>
              )}
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
findingCard: {
  backgroundColor: "#E8F7EC",
  marginHorizontal: 16,
  marginTop: 14,
  borderRadius: 18,
  padding: 14,
  borderWidth: 1,
  borderColor: "#7ED197",
},

findingTitle: {
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 10,
  color: "#1E6B3C",
},

findingLine: {
  fontSize: 15,
  marginBottom: 6,
},

findingExplain: {
  marginTop: 6,
  fontSize: 13,
  opacity: 0.8,
},
});