import { StyleSheet, Text, View, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { useLocalSearchParams } from "expo-router";
import { API_BASE_URL } from "../config";
import { useState } from "react";

const newpassword = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const resetPassword = async () => {
        if (!password || !confirmPassword) {
            alert("Please fill in both fields");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            const res = await fetch(`${API_BASE_URL}/api/accounts/reset-password/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
            });

            const data = await res.json();

            if (res.ok) {
            alert("Password updated successfully");
            router.replace("/");
            } else {
            alert(data.error || "Failed to reset password");
            }

        } catch (error) {
            console.log(error);
            alert("Server error");
        }
        };


        return (
            <ScrollView>
                <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                    <Image
                        source={require("../assets/back_icon.png")}
                        style={styles.backImage}
                    />
                </TouchableOpacity>
            
                {/* Title */}
                <Text style={styles.headerTitle}>New Password</Text>

                <View>
                    <Text style={styles.passwordText}>Enter New Password</Text>
                </View>

                <View style={styles.inputRow}>
                    <Image source={require('../assets/password_icon.png')} style={styles.iconImage} />
                    <TextInput
                        placeholder="Enter New Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        style={{ flex: 1 }}
                        />
                </View>

                <View>
                    <Text style={styles.ConfirmText}>Confirm Password</Text>
                </View>

                <View style={styles.inputRow}>
                    <Image source={require('../assets/password_icon.png')} style={styles.iconImage} />
                    <TextInput
                        placeholder="Confirm Password"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={{ flex: 1 }}
                        />
                </View>

                <TouchableOpacity style={styles.button} onPress={resetPassword}>
                    <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
            </ScrollView>
        )
}

export default newpassword

const styles = StyleSheet.create({
    back: {
        backgroundColor: "#88C8FF",
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
        marginLeft: 30,
    },

    backImage: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    },

    /* Titles */
    headerTitle: {
        fontSize: 32,
        fontWeight: "700",
        color: "#88C8FF",
        textAlign: "center",
        marginTop: 40,
    },
    passwordText: {
        fontSize: 15,  
        color: "#0B0B0B",
        marginLeft: 40,
        marginTop: 60,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#a6e1fdb9",
        borderRadius: 8,
        paddingHorizontal: 12,
        marginVertical: 8,
        height: 50,
        marginLeft: 30,
        marginRight: 30,
        marginTop: 10, 
    },
    iconImage: {
        width: 20,
        height: 20,
        marginRight: 10,
        resizeMode: 'contain',
    },
    ConfirmText: {
        fontSize: 15,  
        color: "#0B0B0B",
        marginLeft: 40,
        marginTop: 20,
    },
    button: {
        backgroundColor: "#88C8FF",
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 50,
        alignItems: "center",
        marginLeft: 30,
        marginRight: 30,
    },
    buttonText: {
        color: "black",
        fontWeight: "700",
        fontSize: 16, 
    },
})