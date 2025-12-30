import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

const firstpage = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logoImage} />

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
            <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
    

    {/* Sign Up */}
        <TouchableOpacity style={styles.signup} onPress={() => router.push('/SignUp')}>
            <Text style={styles.signupLink}>Create an account</Text>
        </TouchableOpacity>
    </View>
  )
}

export default firstpage

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#88C8FF',
  },
  logoImage: {
    width: 300,
    height: 300,
    marginTop: 200,
    marginLeft: 70,
  },
  button: {
    backgroundColor: "#acd5f9ff",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 180,
    alignItems: "center",
    marginLeft: 100,
    marginRight: 100,
  },
  buttonText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16, 
  },
  signup: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: 'center',
  },
  signupLink: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 500,
  },
})