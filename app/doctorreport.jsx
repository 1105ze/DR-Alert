import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert, TextInput } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const doctorreport = () => {
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

  const stageColor = getStageColor(stage);

  const [editMode, setEditMode] = useState(false);
  const [editableReport, setEditableReport] = useState(null);

  useEffect(() => {
    if (retinaData?.report_data) {
      setEditableReport(retinaData.report_data);
    }
  }, [retinaData]);

  const saveEditedReport = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      const res = await fetch(
        `${API_BASE_URL}/api/accounts/update_report/${retinaData.prediction_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            report_data: editableReport,
          }),
        }
      );

      if (res.ok) {

        // update local state so UI refreshes immediately
        setRetinaData(prev => ({
          ...prev,
          report_data: editableReport
        }));

        Alert.alert("Success", "Report updated");
        setEditMode(false);

      } else {
        Alert.alert("Error", "Failed to update report");
      }

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong");
    }
  };


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
                <Text style={styles.profileLine}>
                  {retinaData?.medical_details?.conditions
                    ? Object.entries(retinaData.medical_details.conditions)
                        .filter(([key, value]) => value === true)
                        .map(([key]) => key)
                        .join(", ") || "None"
                    : "None"}
                </Text>

                <View style={styles.sectionDivider} />

                <Text style={styles.sectionTitle}>Vision Symptoms</Text>
                <Text style={styles.profileLine}>
                  {retinaData?.medical_details?.symptoms
                    ? Object.entries(retinaData.medical_details.symptoms)
                        .filter(([key, value]) => value === true)
                        .map(([key]) => key)
                        .join(", ") || "None"
                    : "None"}
                </Text>
            </View>

          {/* Result block (pink) */}
          <View style={[styles.resultCard, { backgroundColor: stageColor }]}>
            <View
              style={[
                styles.resultIconCircle,
                {
                  backgroundColor: stageColor,
                  borderColor: "#222",
                },
              ]}
            >
              <Text style={styles.resultIcon}>!</Text>
            </View>

            <Text style={styles.resultStage}>
              {stage}
            </Text>
            <Text style={styles.resultConfidence}>
              Confidence: {confidence}%
            </Text>

            <View style={styles.findingPill}>
              <Text style={styles.findingText}>
                {isValidated
                  ? `${stage} diabetic retinopathy confirmed.`
                  : `${stage} diabetic retinopathy detected.`}
              </Text>
            </View>
          </View>

          {/* Recommendations next steps */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🏥  Recommendations next steps</Text>

            {editMode
              ? editableReport?.next_steps?.map((item, index) => (
                  <TextInput
                    key={index}
                    style={styles.input}
                    value={item}
                    onChangeText={(text) => {
                      const updated = [...editableReport.next_steps];
                      updated[index] = text;

                      setEditableReport({
                        ...editableReport,
                        next_steps: updated,
                      });
                    }}
                  />
                ))
              : report?.next_steps?.map((item, index) => (
                  <Text key={index} style={styles.infoLine}>{item}</Text>
                ))
            }
          </View>

          {/* Diet recommendations */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🥦  Diet Recommendations</Text>

            <View style={styles.dietRow}>
              {/* Green box */}
              <View style={[styles.dietBox, styles.dietGood]}>
                {editMode
                  ? editableReport?.diet?.good?.map((item, index) => (
                      <TextInput
                        key={index}
                        style={styles.input}
                        value={item}
                        onChangeText={(text) => {
                          const updated = [...editableReport.diet.good];
                          updated[index] = text;

                          setEditableReport({
                            ...editableReport,
                            diet: {
                              ...editableReport.diet,
                              good: updated
                            }
                          });
                        }}
                      />
                    ))
                  : report?.diet?.good?.map((item, index) => (
                      <View key={index} style={styles.dietItem}>
                        <Text style={styles.goodIcon}>✅</Text>
                        <Text style={styles.dietText}>{item}</Text>
                      </View>
                    ))
                }
              </View>

              {/* Red box */}
              <View style={[styles.dietBox, styles.dietBad]}>
                {editMode
                  ? editableReport?.diet?.avoid?.map((item, index) => (
                      <TextInput
                        key={index}
                        style={styles.input}
                        value={item}
                        onChangeText={(text) => {
                          const updated = [...editableReport.diet.avoid];
                          updated[index] = text;

                          setEditableReport({
                            ...editableReport,
                            diet: {
                              ...editableReport.diet,
                              avoid: updated
                            }
                          });
                        }}
                      />
                    ))
                  : report?.diet?.avoid?.map((item, index) => (
                      <View key={index} style={styles.dietItem}>
                        <Text style={styles.badIcon}>❌</Text>
                        <Text style={styles.dietText}>{item}</Text>
                      </View>
                    ))
                }
              </View>
            </View>
          </View>

          {/* Exercise recommendations */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚴‍♂️  Exercise Recommendations</Text>

            {editMode
              ? editableReport?.exercise?.map((item, index) => (
                  <TextInput
                    key={index}
                    style={styles.input}
                    value={item}
                    onChangeText={(text) => {
                      const updated = [...editableReport.exercise];
                      updated[index] = text;

                      setEditableReport({
                        ...editableReport,
                        exercise: updated,
                      });
                    }}
                  />
                ))
              : report?.exercise?.map((item, index) => (
                  <Text key={index} style={styles.infoLine}>{item}</Text>
                ))
            }
          </View>

          {/* Prevention tips */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚫  Prevention Tips</Text>

            {editMode
              ? editableReport?.prevention?.map((item, index) => (
                  <TextInput
                    key={index}
                    style={styles.input}
                    value={item}
                    onChangeText={(text) => {
                      const updated = [...editableReport.prevention];
                      updated[index] = text;

                      setEditableReport({
                        ...editableReport,
                        prevention: updated,
                      });
                    }}
                  />
                ))
              : report?.prevention?.map((item, index) => (
                  <Text key={index} style={styles.infoLine}>{item}</Text>
                ))
            }
          </View>

          {/* Important */}
          <View style={styles.importantWrap}>
            <Text style={styles.importantTitle}>❗ Important</Text>
            <Text style={styles.importantText}>Eye Exam every 6-12 months</Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => {
            if (!isValidated) {
              Alert.alert(
                "Report Not Validated",
                "This report must be validated by a doctor before editing."
              );
              return;
            }
            setEditMode(true);
          }}>
          <Text style={styles.editText}>Edit Report</Text>
        </TouchableOpacity>

          {editMode && (
            <TouchableOpacity style={styles.editBtn} onPress={saveEditedReport}>
              <Text style={styles.editText}>Save Report</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.editBtn} onPress={onDownloadReport}>
            <Text style={styles.editText}>Download Report</Text>
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
  resultIcon: {
  fontSize: 26,
  fontWeight: "900",
  color: "#111",
},
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
  input: {
  borderWidth: 1,
  borderColor: "#7DBEFF",
  borderRadius: 8,
  padding: 10,
  marginBottom: 10,
  backgroundColor: "#FFFFFF"
},
});