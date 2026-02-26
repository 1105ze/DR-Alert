import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from "../config";


const doctorworklist = () => {
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

const [cases, setCases] = useState([]);
    useEffect(() => {
    const loadCases = async () => {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch(
        `${API_BASE_URL}/api/accounts/doctor/review/`,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        if (res.ok) {
        const data = await res.json();
        setCases(data);
        }
    };

    loadCases();
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
    return (
        <View>
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
                    <Text style={styles.historyText}>‹  Patient WorkList</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
                {cases.map(item => (
                <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() =>
                    router.push({
                        pathname: "/doctorresult",
                        params: { retinalImageId: item.id },
                    })
                    }
                >
                    <Image
                    source={{
                        uri: `data:image/jpeg;base64,${item.image_base64}`,
                    }}
                    style={styles.cardImage}
                    />

                    <View style={styles.cardContent}>
                    <Text style={styles.time}>
                        {new Date(item.created_at).toLocaleString()}
                    </Text>
                    <Text style={styles.name}>
                        {item.patient_name ? item.patient_name : "Unknown Patient"}
                    </Text>

                        <Text style={styles.name}>
                        Case ID: {item.id}
                        </Text>
                    </View>

                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
                ))}           
                    
                    <TouchableOpacity style={styles.analysisButton} onPress={() => router.push('/upload')} >
                        <Image source={require('../assets/upload_icon.png')} style={styles.uploadIcon} />
                        <Text style={styles.analysisText}>New Analysis</Text>
                    </TouchableOpacity>

                    <Text style={styles.disclaimer}>
                        This is a screening tool only. Consult a healthcare professional for diagnosis.
                    </Text>
            </ScrollView>
        </View>
    )
}

export default doctorworklist

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: "#88C8FF",
    paddingVertical: 15,
  },
  // profile: {
  //   backgroundColor: "#aad5fcff",
  //   paddingVertical: 15,
  //   borderRadius: 100,
  //   marginLeft: 30,
  //   alignItems: "center",
  //   borderWidth: 3,
  //   borderColor: '#54adfaff',
  //   },
  // profileImage: {
  //   width: 43,
  //   height: 30,
  //   marginRight: 10,
  //   resizeMode: 'contain',
  //   marginLeft: "8",
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
  historyText: {
    fontSize: 20,
  },
  back: {
    paddingVertical: 15,
    borderRadius: 100,
    marginTop: 10,
    marginLeft: 30,
    marginRight: 100,
  },
  card: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 14,
    padding: 25,
    marginHorizontal: '6%',
    marginTop: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  badge: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  time: {
    marginTop: 6,
    fontSize: 12,
  },
  name: {
    marginTop: 3,
    fontSize: 12,
  },
  arrow: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  analysisButton: {
    backgroundColor: '#88C8FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
    flexDirection: 'row'
  },
  uploadIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginLeft: 130,
  },
  analysisText: {
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 90,
    marginBottom: 10,
  }
})