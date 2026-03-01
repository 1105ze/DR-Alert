import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from "../config";
import { useLocalSearchParams } from "expo-router";



const doctorresult = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);

    const [alreadyValidated, setAlreadyValidated] = useState(false);
    
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
   
    const [comment, setComment] = useState("");
    const [signature, setSignature] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitValidation = async () => {
        if (!retinaData?.prediction_id) {
            alert("Prediction not ready");
            return;
        }

        if (!finalStage) {
            alert("Please select final DR stage");
            return;
        }

        if (!comment.trim()) {
            alert("Please enter comment");
            return;
        }

        if (!signature.trim()) {
            alert("Please enter signature");
            return;
        }

        try {
            setIsSubmitting(true);

            const token = await AsyncStorage.getItem("accessToken");

            const res = await fetch(
                `${API_BASE_URL}/api/accounts/doctor/validate/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        prediction_id: retinaData.prediction_id,
                        doctor_comments: comment,
                        doctor_final_stage: finalStage,
                        digital_signature: signature,
                    }),
                }
            );

            if (res.ok) {
                alert("Validation submitted successfully");
                // setAlreadyValidated(true);
                router.replace("/doctorworklisthistory");
            } else {
                alert("Submission failed");
            }
        } catch (error) {
            alert("Error submitting");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [finalStage, setFinalStage] = useState(null);
    const stageOptions = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];

    const { retinalImageId } = useLocalSearchParams();
    const [retinaData, setRetinaData] = useState(null);
    useEffect(() => {
        const fetchRetina = async () => {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token || !retinalImageId) return;

            const res = await fetch(
            `${API_BASE_URL}/api/accounts/retina/${retinalImageId}/`,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            if (res.ok) {
                const data = await res.json();
                setRetinaData(data);

                if (data.validated) {
                    setAlreadyValidated(true);
                    setFinalStage(data.doctor_final_stage);
                    setComment(data.doctor_comments || "");
                    setSignature(data.digital_signature || "");
                }
            }
        };

        fetchRetina();
        }, [retinalImageId]);

    const isValidated = retinaData?.validated;

    // const adviceText = isValidated
    //     ? retinaData?.report_data?.findings || "Doctor report not available."
    //     : retinaData?.predicted_stage
    //         ? `${retinaData.predicted_stage} diabetic retinopathy detected.`
    //         : "Awaiting AI result.";
    const adviceText = retinaData?.predicted_stage
    ? `${retinaData.predicted_stage} diabetic retinopathy detected.`
    : "Awaiting AI result.";

    const validationStatusText = isValidated
        ? "Doctor validated"
        : "Waiting doctor to validate.";


    return (
        <View style={{ flex: 1 }}>
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

                <View style={styles.Texttitle}>
                    <Text style={styles.title}>DR Detection</Text>

                    <Text style={styles.subtitle}>Diabetic Retinopathy Screening</Text>
                </View>
                <Text style={styles.username}>{user ? user.username : ""}</Text>
            </View>

            <View>
                <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                    <Text style={styles.backText}>‹   Result</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={styles.firstCard}>
                    <View style={styles.warningSection}>
                        <Image source={require('../assets/warning_icon.png')} style={styles.warningIcon} />
                        <Text style={styles.warningText}>Prelimary AI Result</Text>
                    </View>
                    <Text style={styles.stageText}>
                        {retinaData?.predicted_stage || "Loading..."}
                    </Text>

                    <Text style={styles.confidenceText}>
                        {retinaData?.confidence !== null && retinaData?.confidence !== undefined
                            ? `Confidence: ${(retinaData.confidence * 100).toFixed(0)}%`
                            : "Confidence: --"}
                    </Text>

                    <View style={styles.adviceColumn}>
                        <Text style={styles.adviceText}>
                            {adviceText}
                        </Text>

                        <Text
                            style={{
                            marginTop: 8,
                            fontSize: 12,
                            fontWeight: "600",
                            textAlign: "center",
                            color: isValidated ? "green" : "#444",
                            }}
                        >
                            {validationStatusText}
                        </Text>
                        </View>

                    <TouchableOpacity style={styles.button} onPress={() => router.push('/gradcam')} >
                        <Text style={styles.buttonText}>View AI Explanation (Grad-CAM)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: "/doctorreport", params: { retinalImageId },})} >
                        <Text style={styles.buttonText}>View Report</Text>
                    </TouchableOpacity>
                </View>


                    <View style={styles.imageCard}>
                        {retinaData && (
                            <Image
                            source={{
                                uri: `data:image/jpeg;base64,${retinaData.image_base64}`,
                            }}
                            style={styles.fundusImage}
                            />
                        )}

                        <Text style={styles.analyzedText}>
                            Analyzed on {retinaData 
                                ? new Date(retinaData.created_at).toLocaleString() 
                                : ""}
                        </Text>
                    </View>

                    {/* Doctor Verify Section */}
                    <View style={styles.verifyBox}>
                        <Text style={styles.verifyTitle}>Doctor Specialist Verify</Text>

                        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
                            Final DR Stage (Doctor Decision)
                        </Text>

                        <View style={{ marginBottom: 12 }}>
                            {stageOptions.map((stage) => (
                                <TouchableOpacity
                                    key={stage}
                                    onPress={() => !alreadyValidated && setFinalStage(stage)}
                                    style={{
                                        padding: 10,
                                        borderWidth: 1,
                                        borderColor: finalStage === stage ? "#007AFF" : "#ccc",
                                        borderRadius: 8,
                                        marginBottom: 6,
                                        backgroundColor: finalStage === stage ? "#e6f2ff" : "#fff",
                                    }}
                                    >
                                    <Text>{stage}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Comment box */}
                        <View style={styles.commentBox}>
                            <TextInput
                                placeholder="Comment.."
                                style={styles.commentInput}
                                multiline
                                value={comment}
                                onChangeText={setComment}
                                editable={!alreadyValidated}
                            />
                        </View>

                        {/* Signature + Button */}
                        <View style={styles.signRow}>
                            <View style={styles.signatureLine}>
                                <TextInput
                                    placeholder="Signature"
                                    value={signature}
                                    onChangeText={setSignature}
                                    style={styles.signatureInput}
                                    editable={!alreadyValidated}
                                />
                                </View>

                            <TouchableOpacity
                                style={styles.doneBtn}
                                onPress={handleSubmitValidation}
                                disabled={isSubmitting || alreadyValidated}
                            >
                                <Text style={styles.doneBtnText}>
                                    {alreadyValidated
                                        ? "Verified"
                                        : isSubmitting
                                        ? "Submitting..."
                                        : "Done Verify"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.bigBtn}
                        onPress={() => router.push("/doctorhistory")}
                        >
                        <Text style={styles.bigBtnText}>View All Results</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.bigBtn}
                        onPress={() => router.push("/doctorhome")}
                        >
                        <Text style={styles.bigBtnText}>Back to home</Text>
                    </TouchableOpacity>

                        {/* Disclaimer */}
                    <View style={styles.disclaimerBox}>
                        <Text style={styles.disclaimerText}>
                            Medical Disclaimer: This is a screening tool and not a substitute for
                            professional medical diagnosis.
                        </Text>
                        <Text style={styles.disclaimerText}>
                            Please consult with a qualified ophthalmologist or healthcare
                            provider for proper diagnosis and treatment.
                        </Text>
                    </View>

                        <Text style={styles.disclaimer}>
                            This is a screening tool only. Consult a healthcare professional for diagnosis.
                        </Text>
            </ScrollView>
        
        </View>
    )
}

export default doctorresult

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        marginTop: 10,
        backgroundColor: "#88C8FF",
        paddingVertical: 15,
    },
    // profile: {
    //     backgroundColor: "#aad5fcff",
    //     paddingVertical: 15,
    //     borderRadius: 100,
    //     marginLeft: 30,
    //     alignItems: "center",
    //     borderWidth: 3,
    //     borderColor: '#54adfaff',
    // },
    // profileImage: {
    //     width: 43,
    //     height: 30,
    //     marginRight: 10,
    //     resizeMode: 'contain',
    //     marginLeft: "8",
    // },
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
  overflow: "hidden",   // 🔥 REQUIRED for circle
},
profileImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",  // 🔥 REQUIRED
},
    Texttitle: {
        flex: 1,
        marginTop: 5
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    subtitle: {
        fontSize: 14,
        marginLeft: 10,
        marginTop: 8,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 30,
        marginTop: 18,
    },    
    back: {
        paddingVertical: 15,
        borderRadius: 100,
        marginTop: 10,
        marginLeft: 30,
        marginRight: 100,
    },
    backText: {
        fontSize: 20,
    },
    firstCard: {
        backgroundColor: '#fe9696ff',
        width: 385,
        borderRadius: 18,
        marginLeft: 30,
        marginTop: 10,
    },
    warningSection: {
        flexDirection: 'row',
        marginTop: 20,
    },
    warningIcon: {
        width: 50,
        height: 50,
        marginLeft: 50,
    },
    warningText: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 20,
        marginTop: 15,
    },
    stageText: {
        textAlign: 'center',
        fontSize: 15,
    },
    confidenceText: {
        textAlign: 'center',
        fontSize: 15,
        marginTop: 15,        
    },
adviceColumn: {
    backgroundColor: '#aad5fcff',
    borderRadius: 18,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    minHeight: 85,
    borderWidth: 1,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
},
adviceText: {
    fontSize: 14,
    textAlign: "center",
},
    button: {
        backgroundColor: '#88C8FF',
        paddingVertical: 12,
        borderRadius: 10,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
    },
    buttonText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    secondCard: {
        backgroundColor: '#aad5fcff',
        width: 385,
        borderRadius: 18,
        marginLeft: 30,
        marginTop: 10,
    },
    doctorTitle: {
        textAlign: 'center',
        fontWeight: '700',
        marginTop: 20,
        fontSize: 16,
    },
    secondCard: {
        backgroundColor: "#d6eeff",
        borderRadius: 18,
        marginHorizontal: 18,
        marginTop: 12,
        paddingBottom: 16,
    },
    doctorTitle: {
        textAlign: "center",
        fontWeight: "700",
        marginTop: 16,
        fontSize: 16,
    },
    verifyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14,
        marginHorizontal: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#b9dbff",
    },
    chooseDoctorLabel: { width: 110, fontSize: 14 },
    selectField: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#66b3ff",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        justifyContent: "space-between",
    },
    selectText: { 
        fontSize: 14, 
        fontWeight: "600" 
    },
    chev: { 
        fontSize: 16, 
        fontWeight: "900" 
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 18,
        marginTop: 14,
    },
    smallBtn: {
        backgroundColor: "#88C8FF",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 26,
    },
    smallBtnText: { 
        fontWeight: "700" 
    },
    verifyHint: { 
        textAlign: "center", 
        marginTop: 10, 
        fontSize: 11, 
        opacity: 0.75 
    },
    verifyHint2: { 
        textAlign: "center", 
        marginTop: 6, 
        fontSize: 12, 
        opacity: 0.9 
    },
    profileCard: {
        marginTop: 14,
        marginHorizontal: 16,
        backgroundColor: "#d6eeff",
        borderRadius: 16,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#b9dbff",
    },
    closeX: { position: "absolute", left: 10, top: 8, padding: 6, zIndex: 3 },
    closeXText: { fontSize: 18, fontWeight: "900", color: "#d00000" },
    profileLeft: { marginRight: 12 },
    docAvatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#fff" },
    profileRight: { flex: 1, paddingLeft: 6 },
    docName: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
    docLine: { fontSize: 13, marginBottom: 2 },

    imageCard: {
        borderRadius: 18,
        marginHorizontal: 18,
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#b9dbff",
        overflow: "hidden",
        backgroundColor: "#fff",
    },
    fundusImage: { 
        width: "100%", 
        height: 260, 
        resizeMode: "contain", 
        backgroundColor: "#fff" 
    },
    analyzedText: { 
        padding: 12, 
        fontSize: 12, 
        opacity: 0.8 
    },
    verifyBox: {
        backgroundColor: "#d6eeff",
        marginHorizontal: 18,
        marginTop: 15,
        borderRadius: 18,
        padding: 15,
        borderWidth: 1,
        borderColor: "#b9dbff",
    },
    verifyTitle: {
        textAlign: "center",
        fontWeight: "800",
        fontSize: 16,
        marginBottom: 12,
    },
    commentBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        height: 110,
        padding: 12,
        borderWidth: 1,
        borderColor: "#cce5ff",
        justifyContent: "flex-start",
    },
    commentInput: {
        fontSize: 13,
        color: "#000",
        height: "100%",
    },
    signRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14,
        justifyContent: "space-between",
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderColor: "#999",
        width: "50%",
        paddingBottom: 4,
    },
    signatureInput: {
        fontSize: 20,
        fontStyle: "italic",
        letterSpacing: 1,
        textAlign: "center",
        color: "#333",
    },
    signatureText: {
        fontSize: 11,
        color: "grey",
    },
    doneBtn: {
        backgroundColor: "#88C8FF",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    doneBtnText: {
        fontWeight: "800",
    },
    bigBtn: {
        backgroundColor: "#88C8FF",
        marginHorizontal: 18,
        marginTop: 10,
        borderRadius: 12,
        paddingVertical: 14,
    },
    bigBtnText: { 
        textAlign: "center", 
        fontWeight: "800" 
    },
    disclaimerBox: {
        marginHorizontal: 18,
        marginTop: 12,
        backgroundColor: "#d6eeff",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "#b9dbff",
    },
    disclaimerText: { 
        fontSize: 12, 
        lineHeight: 16, 
        opacity: 0.9 
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        paddingHorizontal: 18,
    },
    modalCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        maxHeight: "70%",
    },
    modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
    modalItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    modalItemActive: { backgroundColor: "#eef7ff" },
    modalAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
    modalItemName: { fontSize: 14, fontWeight: "800" },
    modalItemSub: { fontSize: 12, opacity: 0.8, marginTop: 2 },
    check: { fontSize: 18, fontWeight: "900", marginLeft: 10 },
    sep: { height: 1, backgroundColor: "#eee", marginVertical: 2 },
    modalCloseBtn: {
        marginTop: 10,
        backgroundColor: "#88C8FF",
        borderRadius: 12,
        paddingVertical: 12,
    },
    modalCloseText: { textAlign: "center", fontWeight: "800" },
    disclaimer: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 90,
        marginBottom: 10,
    }
})