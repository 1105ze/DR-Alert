import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker'
import { API_BASE_URL } from "../config";


const SignUp = () => {
  const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [agreePolicy, setAgreePolicy] = useState(false);
    const [licenseImageBase64, setLicenseImageBase64] = useState(null)
    const [licenseImageUri, setLicenseImageUri] = useState(null)
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [gender, setGender] = useState(null)
    const [showGenderList, setShowGenderList] = useState(false)
    const [role, setRole] = useState(null)
    const [showRoleList, setShowRoleList] = useState(false)
    const [specialization, setSpecialization] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const pickLicenseImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: true,
      })

      if (!result.canceled && result.assets[0].base64) {
        setLicenseImageUri(result.assets[0].uri)
        setLicenseImageBase64(result.assets[0].base64)
        console.log("Base64 length:", result.assets[0].base64.length)
      } else {
        alert("Image selection failed")
      }
    }

    // send information to database
    const handleSignup = async () => {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const formattedDOB = dateOfBirth.split('/').reverse().join('-')

      console.log("Submitting signup:", {
        role,
        gender,
        base64Length: licenseImageBase64?.length,
      });

      if (role === 'Doctor') {
        if (!licenseImageBase64 || licenseImageBase64.length < 100) {
          alert("Please upload a valid medical license image.");
          return;
        }
        console.log("Sending license base64 length:", licenseImageBase64.length);  // Check in Expo logs
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/accounts/signup/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            role: role.toLowerCase(),
            gender: gender.toLowerCase(),
            date_of_birth: formattedDOB,
            specialization: specialization,
            ...(role === 'Doctor' && { license_image: licenseImageBase64 }),  // ← Only include if Doctor and base64 exists
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Account created successfully");
          console.log("Saved to PostgreSQL:", data);
          router.push('/');

          // optional: navigate to login screen
          // navigation.navigate("Login");
        } else {
          console.log("Signup error:", data);
          alert(JSON.stringify(data));
        }
      } catch (error) {
        console.error("Network error:", error);
        alert("Server not reachable");
      }
    };


return (
  <ScrollView>
    <View>
        <View>
            <TouchableOpacity style={styles.back} onPress={() => router.push('/firstpage')}>
                <Image source={require('../assets/back_icon.png')} style={styles.backImage} />
            </TouchableOpacity>
        </View>

        <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Start Screening For Diabetic Retinopathy</Text>
        </View>

        <View style={styles.box}>
            <View style={styles.inputRow}>
                <Image source={require('../assets/people_icon.png')} style={styles.iconImage} />
                <TextInput
                  placeholder="Enter Username"
                  value={username}
                  onChangeText={setUsername}
                  style={{ flex: 1 }}
                />
            </View>

            <View style={styles.inputRow}>
                <Image source={require('../assets/email_icon.png')} style={styles.iconImage} />
                <TextInput
                  placeholder="Enter Email"
                  value={email}
                  onChangeText={setEmail}
                  style={{ flex: 1 }}
                />
            </View>

            <View style={styles.inputRow}>
              <Image
                source={require('../assets/clock_icon.png')}
                style={styles.iconImage}
              />
              <TextInput
                placeholder="Date of Birth (YYYY-MM-DD)"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                style={{ flex: 1 }}
              />
            </View>

{/* Gender */}
            <View>
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => setShowGenderList(!showGenderList)}
              >
                <Image
                  source={require('../assets/people_icon.png')}
                  style={styles.iconImage}
                />
                <Text style={{ color: gender ? '#000' : '#999', flex: 1 }}>
                  {gender || 'Select Gender'}
                </Text>

                <Image
                  source={require('../assets/dropdown_arrow.png')}
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>

              {showGenderList && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setGender('Male')
                      setShowGenderList(false)
                    }}
                  >
                    <Text>Male</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setGender('Female')
                      setShowGenderList(false)
                    }}
                  >
                    <Text>Female</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setGender('Other')
                      setShowGenderList(false)
                    }}
                  >
                    <Text>Other</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

{/* role */}
            <View>
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => setShowRoleList(!showRoleList)}
              >
                <Image
                  source={require('../assets/people_icon.png')}
                  style={styles.iconImage}
                />
                <Text style={{ color: role ? '#000' : '#999', 
                  flex: 1,
                }}>
                  {role || 'Select Role'}
                </Text>

                <Image
                  source={require('../assets/dropdown_arrow.png')}
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>

              {showRoleList && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setRole('Patient')
                      setShowRoleList(false)
                    }}
                  >
                    <Text>Patient</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setRole('Doctor')
                      setShowRoleList(false)
                    }}
                  >
                    <Text>Doctor</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Doctor-only fields */}
            {role === 'Doctor' && (
              <>
                {/* Specialization */}
                <View style={styles.inputRow}>
                  <Image
                    source={require('../assets/people_icon.png')}
                    style={styles.iconImage}
                  />
                  <TextInput
                    placeholder="Enter Specialization"
                    value={specialization}
                    onChangeText={setSpecialization}
                  />
                </View>

                {/* License upload */}
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={pickLicenseImage}
                >
                  <Text style={{ color: '#555' }}>
                    {licenseImageUri ? 'License Uploaded' : 'Upload Medical License'}
                  </Text>
                </TouchableOpacity>

                {licenseImageUri && (
                  <View style={styles.licenseContainer}>
                    <Text style={styles.licenseText}>
                      License image selected
                    </Text>

                    <Image
                      source={{ uri: licenseImageUri }}
                      style={styles.licensePreview}
                    />
                  </View>
                )}
              </>
            )}

            <View style={styles.inputRow}>
                <Image source={require('../assets/password_icon.png')} style={styles.iconImage} />
                <TextInput
                  placeholder="Enter Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={{ flex: 1 }}
                />
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
                {confirmPassword !== '' && password !== confirmPassword && (
                  <Text style={styles.errorText}>
                    Passwords do not match
                  </Text>
                )}
            </View>

            <View style={styles.agree}>
                <TouchableOpacity style={styles.checkbox} onPress={() => setAgreePolicy(!agreePolicy)}>
                    <Image source={agreePolicy ?require('../assets/check_filled.png') :require('../assets/check_empty.png')} style={styles.checkboxIcon}/>
                </TouchableOpacity>

                <Text style={styles.agreeText}>I agree to the Privacy Policy</Text>
            </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (
              !agreePolicy ||
              !role ||
              !password ||
              !confirmPassword ||
              password !== confirmPassword ||
              !dateOfBirth ||
              !gender ||
              (role === 'Doctor' && (!specialization || !licenseImageUri))
            ) && { opacity: 0.5 }
          ]}
          disabled={
            !agreePolicy ||
            !role ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword ||
            !dateOfBirth ||
            !gender ||
            (role === 'Doctor' && (!specialization || !licenseImageUri))
          }
          onPress={handleSignup}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>


        {/* Sign Up */}
        <View style={styles.signupRow}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.signupLink}>  Sign In</Text>
            </TouchableOpacity>
        </View>
    </View>
  </ScrollView>
)
}

export default SignUp

const styles = StyleSheet.create({
  back: {
    backgroundColor: "#88C8FF",
    paddingVertical: 15,
    borderRadius: 100,
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
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginTop: 30, 
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "700",
    alignItems: "center",
    color: "#88C8FF",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#555",
  },
  box: {
    padding: 20,
    marginLeft: 40,
    marginRight: 40,
    marginTop: 40, 
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
  iconImage: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  checkboxIcon: {
    width: 20,
    height: 20,
    tintColor: "#555", // optional
  },
  agree: {
    flexDirection: "row",
    marginTop: 10,
  },
  agreeText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 3,
  },
  button: {
    backgroundColor: "#88C8FF",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 40,
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
dropdown: {
  backgroundColor: '#fff',
  borderRadius: 8,
  marginTop: 4,
  marginHorizontal: 10,
  borderWidth: 1,
  borderColor: '#ccc',
},

dropdownItem: {
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
arrowIcon: {
  width: 14,
  height: 14,
  tintColor: '#555',
},
uploadBox: {
  height: 50,
  borderRadius: 8,
  backgroundColor: '#97d8f7b9',
  marginVertical: 8,
  justifyContent: 'center',
  alignItems: 'center',
},
licenseContainer: {
  alignItems: 'center',
  marginTop: 8,
},

licenseText: {
  fontSize: 12,
  color: '#555',
  marginBottom: 6,
  textAlign: 'center',
},

licensePreview: {
  width: 120,
  height: 120,
  borderRadius: 8,
},
errorText: {
  color: 'red',
  fontSize: 12,
  marginTop: 4,
  marginLeft: 4,
},

})