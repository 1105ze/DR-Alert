import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Video } from "expo-av";

const advertisement = () => {
  const router = useRouter();

  return (        
    <View style={{ flex: 1 }}>
        <View style={styles.header}>
            <View style={styles.avatarCircle} />
            <View style={styles.headerTitleWrap}>
                <Text style={styles.headerTitle}>DR Detection</Text>
                <Text style={styles.headerSubtitle}>Diabetic Retinopathy Screening</Text>
            </View>
            <Text style={styles.headerName}>Ze Gui</Text>
        </View>

        <View>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Text style={styles.backText}>‹   Advertisement</Text>
            </TouchableOpacity>
        </View>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Back Button */}

        {/* Title */}
        <Text style={styles.pageTitle}>Advertisement</Text>

        {/* Header */}
        <Text style={styles.mainTitle}>DIABETIC RETINOPATHY</Text>
        <View style={styles.line} />

        {/* Info Card */}
        <View style={styles.infoCard}>

            <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>
                What is diabetic retinopathy?
                </Text>

                <Text style={styles.infoText}>
                Diabetic retinopathy is the leading cause of blindness in
                working age adults. It occurs when blood vessels in the
                retina are damaged due to high blood sugar.
                </Text>
            </View>

            <Image
                source={require("../assets/retinal_image.jpg")}
                style={styles.eyeImage}
            />
            </View>

            {/* Small Boxes */}
            <View style={styles.smallRow}>

            <View style={styles.smallBox}>
                <Text style={styles.smallTitle}>No Early Symptoms</Text>
                <Text style={styles.smallText}>
                Only regular testing can detect DR.
                </Text>
            </View>

            <View style={styles.smallBox}>
                <Text style={styles.smallTitle}>Managing Risk</Text>
                <Text style={styles.smallText}>
                Control blood sugar to reduce risk.
                </Text>
            </View>

            </View>

            {/* Scan Section */}
            <View style={styles.scanBox}>
            <Text style={styles.scanTitle}>Scans</Text>

            <Text style={styles.scanText}>
                Regular scans can detect early changes and
                reduce vision loss by 95%.
            </Text>
            </View>

        </View>

        {/* Eye Disease Section */}
        <Text style={styles.sectionTitle}>
            DIABETIC EYE DISEASE
        </Text>

        <View style={styles.diseaseCard}>

            <View style={styles.statBox}>
            <Text style={styles.statBig}>25%</Text>
            <Text style={styles.statText}>
                diabetics suffer from DR
            </Text>
            </View>

            <View style={styles.statBox}>
            <Text style={styles.statBig}>76%</Text>
            <Text style={styles.statText}>
                risk reduced with treatment
            </Text>
            </View>

        </View>

        {/* Illustration */}
        <Text style={styles.sectionTitle}>
            Diabetic Retinopathy Illustrations
        </Text>

        <View style={styles.illustrationBox}>
            <Text style={styles.illuTitle}>Diabetic Retinopathy</Text>

            <Image
            source={require("../assets/retinal.png")}
            style={styles.bigImage}
            />
        </View>

        {/* Video */}
        <Text style={styles.sectionTitle}>
            Video: What is Diabetic Retinopathy
        </Text>

        <View style={styles.videoBox}>
        <Video
            source={require("../assets/retinal_video.mp4")} // your real video
            style={styles.video}
            useNativeControls
            resizeMode="contain"
            shouldPlay={false}
        />
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Link:</Text>

        <Text style={styles.faq}>Who suffers from it?</Text>
        <Text style={styles.faq}>Can it be prevented?</Text>
        <Text style={styles.faq}>Can it go away?</Text>

        <View style={{ height: 40 }} />

        </ScrollView>
    </View>
  );
};


export default advertisement

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
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
  headerTitleWrap: { 
    flex: 1, 
    marginLeft: 12 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "800" 
  },
  headerSubtitle: { 
    marginTop: 6, 
    fontSize: 13 
  },
  headerName: { 
    fontSize: 16, 
    fontWeight: "800" 
  },
  /* Back */
  backText: {
    fontSize: 20,
  },
  back: {
    paddingVertical: 15,
    borderRadius: 100,
    marginTop: 10,
    marginLeft: 30,
    marginRight: 100,
  },

  /* Titles */
  pageTitle: {
    textAlign: "center",
    fontSize: 24,
    color: "#88C8FF",
    marginTop: 10,
    fontWeight: "600",
  },

  mainTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 25,
    textAlign: "center",
  },

  line: {
    height: 4,
    backgroundColor: "#F5A623",
    marginVertical: 10,
  },

  /* Info Card */
  infoCard: {
    backgroundColor: "#F7F9FC",
    padding: 15,
    borderRadius: 10,
  },

  infoRow: {
    flexDirection: "row",
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },

  infoText: {
    color: "#555",
    fontSize: 14,
  },

  eyeImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },

  /* Small Boxes */
  smallRow: {
    flexDirection: "row",
    marginTop: 15,
  },

  smallBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    elevation: 2,
  },

  smallTitle: {
    fontWeight: "600",
  },

  smallText: {
    fontSize: 12,
    color: "#666",
  },

  /* Scan */
  scanBox: {
    backgroundColor: "#E6F2FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },

  scanTitle: {
    fontWeight: "700",
  },

  scanText: {
    fontSize: 13,
  },

  /* Section */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 10,
  },

  /* Disease */
  diseaseCard: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  statBox: {
    alignItems: "center",
  },

  statBig: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F44336",
  },

  statText: {
    fontSize: 12,
    textAlign: "center",
  },

  /* Illustration */
  illustrationBox: {
    backgroundColor: "#2DB7A3",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  illuTitle: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 5,
  },

  bigImage: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
  },

  /* Video */
  videoBox: {
    position: "relative",
  },

    video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    },

  playBtn: {
    position: "absolute",
    top: "40%",
    left: "45%",
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  playIcon: {
    color: "#fff",
    fontSize: 20,
  },

  /* FAQ */
  faq: {
    fontSize: 14,
    marginTop: 10,
    color: "#333",
  },
});

