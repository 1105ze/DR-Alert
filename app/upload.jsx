import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from "../config";


const upload = () => {
  const router = useRouter();
    const [image, setImage] = useState(null);
    const [user, setUser] = useState(null);
    useEffect(() => { 
      const loadUser = async () => { 
        const storedUser = await AsyncStorage.getItem("user"); 
        console.log("STORED USER:", storedUser); 
        if (storedUser) { setUser(JSON.parse(storedUser)); 

        } 
      }; 
      loadUser(); 
    }, []);
    const [imageBase64, setImageBase64] = useState(null);
    const openImagePicker = async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('Gallery permission is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true, // 🔹 get base64 here
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageBase64(result.assets[0].base64);
      }
    };

    const uploadImageToBackend = async () => {
      if (!imageBase64) {
        alert("No image selected");
        return;
      }

      if (!user) {
        alert("User not logged in");
        return;
      }


      try {
        const response = await fetch(
          `${API_BASE_URL}/api/accounts/retinal-images/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_data: imageBase64,
              uploaded_by_type: user.role,   // "doctor" or "patient"
              uploaded_by_id: user.id,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Upload failed");
          return;
        }

        alert("Image uploaded successfully");
        setImage(null);
        setImageBase64(null);

      } catch (error) {
        alert("Error uploading image");
      }
    };



  return (
    <View style={{flex: 1}}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.profile} onPress={() => router.push('/home')}>
                <Image source={require('../assets/people_icon.png')} style={styles.profileImage} />
            </TouchableOpacity>

            <View style={styles.Texttitle}>
                <Text style={styles.title}>DR Detection</Text>

                <Text style={styles.subtitle}>Diabetic Retinopathy Screening</Text>
            </View>
            <Text style={styles.username}>
              Hey, {user ? user.username : ""}
            </Text>
        </View>

        <View>
            <TouchableOpacity style={styles.back} onPress={() => router.push('/home')}>
                <Text style={styles.notificationText}>‹   Upload Images</Text>
            </TouchableOpacity>
        </View>

        <ScrollView>
            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>How it works</Text>
                <Text style={styles.infoText}>1. Upload a clear retina fundus image</Text>
                <Text style={styles.infoText}>2. Our AI analyzes the image for signs of diabetic retinopathy</Text>
                <Text style={styles.infoText}>3. Get instant results with severity assessment</Text>
            </View>

            <View style={styles.uploadBigbox}>
                <View style={styles.uploadBox}>
                  {image ? (
                  <>
                      {/* IMAGE */}
                      <Image source={{ uri: image }} style={styles.previewImage} />
  
                      {/* OVERLAY BUTTON */}
                      <TouchableOpacity style={styles.chooseButton} onPress={openImagePicker}>
                      <Text style={styles.chooseText}>Choose Different Image</Text>
                      </TouchableOpacity>
                  </>
                  ) : (
                  <TouchableOpacity style={styles.emptyUpload} onPress={openImagePicker} >
                      <Text style={styles.uploadText}>Tap to upload retinal image</Text>
                      <Text style={styles.uploadSub}>Support JPG, PNG formats</Text>
                  </TouchableOpacity>
                  )}
                </View>

                {image && (
                    <TouchableOpacity style={styles.analyzeImage} onPress={uploadImageToBackend}>
                      <Image source={require('../assets/camera_icon.png')} style={styles.cameraIcon} />
                      <Text style={styles.analyzeText}>Analyze Image</Text>
                    </TouchableOpacity>
                  )}
            </View>

            <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/history')}>
                <Image source={require('../assets/clock_icon.png')} style={styles.clockIcon} />
                <Text style={styles.historyText}>View Detection History</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
                This is a screening tool only. Consult a healthcare professional for diagnosis.
            </Text>
        </ScrollView>
    </View>
  )
}

export default upload

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
  notificationText: {
    fontSize: 20,
  },
  back: {
    paddingVertical: 15,
    borderRadius: 100,
    marginTop: 10,
    marginLeft: 30,
    marginRight: 100,
  },
  infoBox: {
    borderWidth: 2,
    borderColor: '#4da3ff',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    marginLeft: '6%',
    marginRight: '6%',
    backgroundColor: '#c1ddfeff'
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 6
  },
  infoText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
    marginRight: '10%'
  },
  uploadBigbox: {
    borderWidth: 2,
    borderColor: "#4da3ff",
    marginTop: '5%',
    marginLeft: '6%',
    marginRight: '6%',
    borderRadius: 12,
    paddingVertical: 10,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4da3ff',
    borderRadius: 12,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '5%',
    marginTop: '5%',
    marginLeft: '6%',
    marginRight: '6%',
    position: 'relative',
    overflow: 'hidden'
  },
  uploadText: {
    marginTop: 8,
    fontWeight: '600'
  },
  uploadSub: {
    fontSize: 12,
    color: '#777'
  },
    previewImage: {  
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
},
  emptyUpload: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    },
  chooseButton: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: '#4da3ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    zIndex: 10,
    },
  chooseText: {
    fontWeight: 'bold',
    },
  analyzeImage: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4da3ff',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: '6%',
    marginRight: '6%',
    flexDirection: 'row'
  },
  cameraIcon: {
    width: 20,
    height: 25,
    resizeMode: 'contain',
    marginLeft: 105
  },
  analyzeText: {
    fontWeight: 'bold',
    marginLeft: '2%'
  },
  historyButton: {
    backgroundColor: '#88C8FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: '3%',
    marginLeft: '6%',
    marginRight: '6%',
    flexDirection: 'row'
  },
  clockIcon: {
    width: 20,
    height: 25,
    resizeMode: 'contain',
    marginLeft: 105,
  },
  historyText: {
    fontWeight: '600',
    marginLeft: '2%'
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 90,
  }
})