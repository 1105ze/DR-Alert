import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';



const result = () => {
    const router = useRouter();

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

   
    return (
        <View>
            <View style={styles.header}>
                <TouchableOpacity style={styles.profile} onPress={() => router.push('/profile')}>
                    <Image source={require('../assets/people_icon.png')} style={styles.profileImage} />
                </TouchableOpacity>

                <View style={styles.Texttitle}>
                    <Text style={styles.title}>DR Detection</Text>

                    <Text style={styles.subtitle}>Diabetic Retinopathy Screening</Text>
                </View>
                <Text style={styles.username}>Ze Gui</Text>
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

                    <TouchableOpacity style={styles.button} onPress={() => router.push('/upload')} >
                        <Text style={styles.buttonText}>View AI Explanation (Grad-CAM)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => router.push('/upload')} >
                        <Text style={styles.buttonText}>View Report</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.secondCard}>
                    <Text style={styles.doctorTitle}>Doctor Specialist Verify</Text>
                    <View style={styles.verifyRow}>
                        <Text style={styles.chooseDoctorLabel}>Choose Doctor</Text>

                        {/* Selection row (no picker package) */}
                        <TouchableOpacity
                            style={styles.selectField}
                            activeOpacity={0.85}
                            onPress={() => setShowDoctorModal(true)}
                        >
                            <Text style={styles.selectText}>
                            Default ({selectedDoctor.name})
                            </Text>
                            <Text style={styles.chev}>›</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        
        </View>
    )
}

export default result

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        marginTop: 10,
        backgroundColor: "#88C8FF",
        paddingVertical: 15,
    },
    profile: {
        backgroundColor: "#aad5fcff",
        paddingVertical: 15,
        borderRadius: 100,
        marginLeft: 30,
        alignItems: "center",
        borderWidth: 3,
        borderColor: '#54adfaff',
    },
    profileImage: {
        width: 43,
        height: 30,
        marginRight: 10,
        resizeMode: 'contain',
        marginLeft: "8",
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
})