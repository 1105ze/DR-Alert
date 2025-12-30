import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Home = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const handleSignIn = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 🔥 REMOVE OLD USER COMPLETELY
        await AsyncStorage.removeItem("user");

        // ✅ SAVE NEW USER
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            username: data.user.username,
            role: data.user.role,
          })
        );

        alert("Login successful!");

        router.replace('/home');
      } else {
        if (data.error === "NO_ACCOUNT") {
          alert("No account found. Please create an account.");
        } else if (data.error === "INVALID_PASSWORD") {
          alert("Invalid username or password.");
        } else {
          alert("Login failed.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server not reachable");
    }
  };

  return (
    <View>
  {/* Header */}        
      <View>
        <TouchableOpacity style={styles.back} onPress={() => router.push('/firstpage')}>
          <Image source={require('../assets/back_icon.png')} style={styles.backImage} />
        </TouchableOpacity>
      </View>

      {/* Profile Icon */}
      <View style={styles.avatarWrapper}>
        <Image source={require('../assets/logo.png')} style={styles.logoImage} />
      </View>

      {/* Welcome Text */}
      <View style={styles.welcometext}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to access your screening history</Text>
      </View>

      {/* Login Box */}
      <View style={styles.box}>
        <View style={styles.inputRow}>
            <Image source={require('../assets/people_icon.png')} style={styles.iconImage} />
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.textInput}
            />
        </View>


        <View style={styles.inputRow}>
            <Image source={require('../assets/password_icon.png')} style={styles.iconImage} />

            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.textInput}
            />
            
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} >
                <Image source={showPassword ? require('../assets/eye_open.png') : require('../assets/eye_closed.png')}style={styles.eyeIcon}/>
            </TouchableOpacity>
        </View>

        <View style={styles.forgetpassword}>
            <TouchableOpacity style={styles.checkbox} onPress={() => setRememberMe(!rememberMe)}>
                <Image source={rememberMe ?require('../assets/check_filled.png') :require('../assets/check_empty.png')} style={styles.checkboxIcon}/>
            </TouchableOpacity>

            <Text style={styles.remember}>Remember me</Text>

            <TouchableOpacity>
                <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
        </View>
      </View>


        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      

      {/* Sign Up */}
      <View style={styles.signupRow}>
        <Text>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/SignUp')}>
          <Text style={styles.signupLink}>  Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>

  )
}

export default Home

const styles = StyleSheet.create({
  back: {
    backgroundColor: "#88C8FF",
    paddingVertical: 15,
    borderRadius: 50,
    marginTop: 40,
    marginLeft: 50,
    marginRight: 720,
    alignItems: "center",
  },
  backImage: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
    marginLeft: "5",
  },
  avatarWrapper: {
    alignItems: "center",
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  welcometext:{
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginTop: 20,
    color: "lightblue",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBotton: 50,
  },
  box: {
    padding: 20,
    borderRadius: 12,
    marginLeft: 40,
    marginRight: 40,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#97d8f7b9",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
    height: 50,
  },
  textInput: {
    flex: 1,
    paddingVertical: 0  
  },
  iconImage: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  eyeBtn: {
    paddingLeft: 10,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: "#555",
  },
  forgotPasswordLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#88C8FF',
    paddingVertical: 1,
    marginLeft: 80,
  },
  forgetpassword: {
    flexDirection: "row",
    marginTop: 10,
  },

  checkboxIcon: {
    width: 20,
    height: 20,
    tintColor: "#555", // optional
  },
  remember: {
    fontSize: 14,
    color: "#555",
    marginLeft: 3,
  },
  button: {
    backgroundColor: "#88C8FF",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 150,
    alignItems: "center",
    marginLeft: 60,
    marginRight: 60,
  },
  buttonText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16, 
  },
  signupRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: 'center',
  },
  signupLink: {
    color: "#88C8FF",
    fontWeight: "700",
  },
})


