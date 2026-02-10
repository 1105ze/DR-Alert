import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Switch} from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "../config";
import { Alert } from "react-native";

const profile = () => {
    const router = useRouter();
    const [notifEnabled, setNotifEnabled] = React.useState(true);
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    useEffect(() => {
        const loadProfile = async () => {
            try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/api/accounts/profile/`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (data.profile_image) {
                const imageUri = data.profile_image.startsWith("data:")
                    ? data.profile_image
                    : `data:image/jpeg;base64,${data.profile_image}`;

                setProfileImage(imageUri);
                }
            } catch (e) {
            console.error("Failed to load profile image", e);
            }
        };

        loadProfile();
        }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 0.7,
        });

        if (result.canceled) return;

        const base64Image = result.assets[0].base64;
        const previewUri = `data:image/jpeg;base64,${base64Image}`;

        Alert.alert(
            "Update Profile Picture",
            "Do you want to use this image as your profile picture?",
            [
            { text: "Cancel", style: "cancel" },
            {
                text: "Confirm",
                onPress: async () => {
                setProfileImage(previewUri);

                try {
                    const token = await AsyncStorage.getItem("accessToken");

                    await fetch(`${API_BASE_URL}/api/accounts/profile/`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        profile_image: base64Image,
                    }),
                    });

                    // 🔹 update stored user cache
                    const storedUser = JSON.parse(await AsyncStorage.getItem("user"));
                    storedUser.profile_image = previewUri;
                    await AsyncStorage.setItem("user", JSON.stringify(storedUser));

                } catch (e) {
                    console.error("Upload profile image failed", e);
                }
                },
            },
            ]
        );
        };
        useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");

            if (!storedUser) {
            router.replace("/firstpage");
            return;
            }

            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        };

        loadUser();
        }, []);

    return (
        <ScrollView>
            <View>
                <View style={styles.header}>
                    <View>
                        <TouchableOpacity
                            style={styles.back}
                            onPress={() =>
                                router.push(user?.role === "doctor" ? "/doctorhome" : "/home")
                            }
                            >
                            <Text style={styles.backText}>‹   Profile</Text>
                        </TouchableOpacity>
                    </View>
                
                    <View style={styles.profileWrap}>
                       <TouchableOpacity style={styles.profileCircle} onPress={pickImage}>
                            <Image
                                source={
                                profileImage
                                    ? { uri: profileImage }
                                    : require("../assets/people_icon.png")
                                }
                                style={styles.profileImage}
                            />
                            </TouchableOpacity>

                        <TouchableOpacity style={styles.editBadge} onPress={pickImage}>
                            <Image source={require('../assets/edit_icon.png')} style={styles.editImage} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.nameText}>{user ? user.username : ""}</Text>
                </View>

                <View style={styles.button}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() =>
                            router.push(
                            user?.role === "doctor"
                                ? "/doctorpersonaldetail"
                                : "/personaldetail"
                            )
                        }
                        >
                        <Image source={require('../assets/people_icon.png')} style={styles.rowImage} />
                        <Text style={styles.rowText}>Personal Details</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.backIcon}>›</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.row}>
                        <Image source={require('../assets/medical_icon.png')} style={styles.rowImage} />
                        <Text style={styles.rowText}>Medical Details </Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.backIcon}>›</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.secondRow}>
                    <View style={styles.row}>
                        <Image source={require('../assets/notification_icon.png')} style={styles.rowImage} />
                        <Text style={styles.rowText}>Notifications</Text>
                        <Switch
                        value={notifEnabled}
                        onValueChange={setNotifEnabled}
                        trackColor={{ false: "#C8CDD4", true: "#9CC3FF" }}
                        thumbColor={notifEnabled ? "#2E73FF" : "#F4F4F4"}
                        style={styles.switchButton}
                        />
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.row}>
                        <Image source={require('../assets/language_icon.png')} style={styles.rowImage} />
                        <Text style={styles.rowText}>Language    </Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.languageText}>Eng</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.row}>
                        <Image source={require('../assets/phone_icon.png')} style={styles.rowImage} />
                        <Text style={styles.rowText}>Help & Support </Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.backIcon}>›</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.row}>
                        <Image source={require('../assets/database_icon.png')} style={styles.rowImage} />
                        <Text style={styles.rowText}>Data Deletion    </Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.backIcon}>›</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.row}>
                        <Image source={require('../assets/iphone_icon.png')} style={styles.rowImage} />
                        <Text style={styles.rowText}>About App         </Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.backIcon}>›</Text>
                        </View>
                    </TouchableOpacity>

                </View>                    
                
                <TouchableOpacity style={styles.signoutButton} onPress={() => router.push("/firstpage")}>
                    <Image source={require('../assets/signout_icon.png')} style={styles.signoutImage} />
                    <Text style={styles.signoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    This is a screening tool only. Consult a healthcare professional for diagnosis.
                </Text>
            
            </View>
        </ScrollView>
    )
}

export default profile

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#88C8FF',
        paddingBottom: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 18,
    },
    back: {
        paddingVertical: 15,
        borderRadius: 100,
        marginTop: 30,
        marginLeft: 20,
    },
    backText: {
        fontSize: 20,
    },
    profileWrap: {
        marginTop: 18,
        alignSelf: "center",
        position: "relative",
    },
    profileCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "#FFFFFF",
        borderWidth: 4,
        borderColor: "#4da3ff",
        justifyContent: "center",
        alignItems: "center",
    },
    // profileImage: {
    //     width: 120,
    //     height: 120,
    //     marginRight: 10,
    //     resizeMode: 'contain',
    //     marginLeft: "8",
    // },
    profileImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        },

    editBadge: {
        position: "absolute",
        right: 6,
        bottom: 14,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#4da3ff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    editImage: {
        width: 20,
        height: 20,
        marginRight: 10,
        resizeMode: 'contain',
        marginLeft: "8",
    },
    nameText: {
        fontSize: 35,
        fontWeight: "700",
        marginTop: 20,
        textAlign: 'center',
    },
    button: {
        position: 'absolute',
        marginTop: 340,
        marginHorizontal: 18,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        alignItems: "center",
        paddingVertical: 5,
    },
    rowImage: {
        width: 16,
        height: 16,
        marginLeft: 20,
    },
    rowText: {
        fontSize: 15,
        fontWeight: "500",
        marginLeft: 10,
    },
    rowRight: {
        marginLeft: 190,
    },
    backIcon: {
        fontSize: 30,
    },
    divider: {
        height: 1,
        backgroundColor: "black",
        opacity: 0.15,
    },
    secondRow: {
        position: 'absolute',
        marginTop: 480,
        marginHorizontal: 18,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
    },
    switchButton: {
        marginLeft: 170,
    },
    languageText: {
        fontSize: 18,
        marginTop: 5,
        marginBottom: 5,
    },
    signoutButton: {
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 420,
        alignItems: "center",
        flexDirection: "row",
        borderWidth: 2,
        borderColor: 'red',
        marginHorizontal: 50,
    },
    signoutImage: {
        width: 20,
        height: 20,
        marginLeft: "125",  
    },
    signoutText: {
        fontSize: 16,
        fontWeight: "700",
        color: "red",
        marginLeft: 5,
    },
    disclaimer: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 100,
  }
})