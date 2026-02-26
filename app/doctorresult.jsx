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
    useEffect(() => {
      const loadUser = async () => {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      };
      loadUser();
    }, []);

    const doctors = [
    {
      id: "dr-philip",
      name: "Dr.Philip",
      phone: "+60 125839302",
      exp: "10+ years experience",
      hours: "Mon–Fri; 9:00 AM – 5:00 PM",
      specialty: "Retina Specialist",
      clinic: "ABC Eye Specialist Centre",
      location: "Kuala Lumpur, Malaysia",
      avatar: "https://i.pravatar.cc/200?img=12",
    },
    {
      id: "dr-lee",
      name: "Dr.Lee",
      phone: "+60 1122334455",
      exp: "8 years experience",
      hours: "Mon–Sat; 10:00 AM – 6:00 PM",
      specialty: "Ophthalmologist",
      clinic: "VisionCare Clinic",
      location: "Petaling Jaya, Malaysia",
      avatar: "https://i.pravatar.cc/200?img=32",
    },
    ];

    const [selectedDoctor, setSelectedDoctor] = React.useState(doctors[0]);
    const [showDoctorModal, setShowDoctorModal] = React.useState(false);
    const [showDoctorProfile, setShowDoctorProfile] = React.useState(false);

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
   
    const handleSaveDoctor = () => {
        // you can replace this with API call / database save later
        // for now just keep UI consistent
    };

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
            }
        };

        fetchRetina();
        }, [retinalImageId]);


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
                    <Text style={styles.stageText}>Severe</Text>
                    <Text style={styles.confidenceText}>Confidence: 80%</Text>

                    <View style={styles.adviceColumn}>
                        <Text style={styles.adviceText}>Mild diabetic retinopathy detected. Schedule a follow-up examination within 6-12 months. Continue monitoring blood sugar levels.</Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => router.push('/gradcam')} >
                        <Text style={styles.buttonText}>View AI Explanation (Grad-CAM)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => router.push('/doctorreport')} >
                        <Text style={styles.buttonText}>View Report</Text>
                    </TouchableOpacity>
                </View>

                {/* <View style={styles.secondCard}>
                    <Text style={styles.doctorTitle}>Doctor Specialist Verify</Text>

                    {!showDoctorProfile ? (
                        <>
                        <View style={styles.verifyRow}>
                            <Text style={styles.chooseDoctorLabel}>Choose Doctor</Text>

                            <TouchableOpacity
                            style={styles.selectField}
                            activeOpacity={0.85}
                            onPress={() => setShowDoctorModal(true)}
                            >
                            <Text style={styles.selectText}>
                                Default ({selectedDoctor.name})
                            </Text>
                            <Text style={styles.chev}>⌄</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.smallBtn} onPress={handleSaveDoctor}>
                            <Text style={styles.smallBtnText}>Save</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                            style={styles.smallBtn}
                            onPress={() => setShowDoctorProfile(true)}
                            >
                            <Text style={styles.smallBtnText}>View Profile</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.verifyHint}>▲ The Verification process done within 3 days</Text>
                        <Text style={styles.verifyHint2}>
                            The Doctor you choose will check the result
                        </Text>
                        </>
                    ) : (
                        <View style={styles.profileCard}>
                        <Pressable
                            style={styles.closeX}
                            onPress={() => setShowDoctorProfile(false)}
                        >
                            <Text style={styles.closeXText}>✕</Text>
                        </Pressable>

                        <View style={styles.profileLeft}>
                            <Image
                            source={{ uri: selectedDoctor.avatar }}
                            style={styles.docAvatar}
                            />
                        </View>

                        <View style={styles.profileRight}>
                            <Text style={styles.docName}>{selectedDoctor.name}</Text>
                            <Text style={styles.docLine}>{selectedDoctor.phone}</Text>
                            <Text style={styles.docLine}>{selectedDoctor.exp}</Text>
                            <Text style={styles.docLine}>{selectedDoctor.hours}</Text>
                            <Text style={styles.docLine}>{selectedDoctor.specialty}</Text>
                            <Text style={styles.docLine}>{selectedDoctor.clinic}</Text>
                            <Text style={styles.docLine}>{selectedDoctor.location}</Text>
                        </View>
                        </View>
                    )}
                    </View> */}

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

                        {/* Comment box */}
                        <View style={styles.commentBox}>
                            <TextInput placeholder="Comment.." style={styles.commentInput} multiline></TextInput>
                        </View>

                        {/* Signature + Button */}
                        <View style={styles.signRow}>
                            <View style={styles.signatureLine}>
                                <Text style={styles.signatureText}>Digital Signature</Text>
                            </View>

                            <TouchableOpacity style={styles.doneBtn}>
                                <Text style={styles.doneBtnText}>Done Verify</Text>
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
        height: 85,
        borderWidth: 1,
        marginBottom: 20,
    },
    adviceText: {
        marginTop: 15,
        marginLeft: 20,
        marginRight: 20,
        fontSize: 14,
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