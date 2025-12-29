import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

const notificationscreen = () => {
  const router = useRouter();
    return (
      <View>
          <View style={styles.header}>
              <TouchableOpacity style={styles.profile} onPress={() => router.push('/firstpage')}>
                  <Image source={require('../assets/people_icon.png')} style={styles.profileImage} />
              </TouchableOpacity>

              <View style={styles.Texttitle}>
                  <Text style={styles.title}>DR Detection</Text>

                  <Text style={styles.subtitle}>Diabetic Retinopathy Screening</Text>
              </View>
              <Text style={styles.username}>Ze Gui</Text>
          </View>

          <View>
              <TouchableOpacity style={styles.back} onPress={() => router.push('/home')}>
                  <Text style={styles.notificationText}>‹   Notifications</Text>
              </TouchableOpacity>
          </View>

          <ScrollView>
              <View style={styles.card}>
                  <Image source={require('../assets/note_icon.png')} style={styles.noteImage} />

                  <View>
                      <Text style={styles.topic}>Classification Result is Ready!</Text>

                      <Text style={styles.cardText}>
                        Your image upload from [Date] has been classified and verified.
                        Tap to view the official report and recommended next steps.
                      </Text>

                      <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>View Full Report</Text>
                      </TouchableOpacity>

                      <Text style={styles.time}>2 hours ago</Text>
                  </View>
              </View>

              <View style={[styles.card, styles.grayCard]}>
                  <Image source={require('../assets/medical_icon.png')} style={styles.noteImage} />

                  <View>
                      <Text style={styles.topic}>Time to Re-Screen</Text>

                      <Text style={styles.cardText}>
                        Based on your last [Mild/Moderate] result, it's time for your follow-up screening.
                        We recommend another check within 3 months.
                      </Text>

                      <Text style={styles.time}>2 hours ago</Text>
                  </View>
              </View>
          </ScrollView>

          <TouchableOpacity style={styles.markRead}>
            <Image source={require('../assets/eye_open.png')} style={styles.eyeIcon} />
              <Text style={styles.markReadText}>Mark All As Read</Text>
          </TouchableOpacity>
      </View>
    )
}

export default notificationscreen

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
  noteImage: {
    width: 20,
    height: 25,
    resizeMode: 'contain',
    marginLeft: 35,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
    flexDirection: "row",
  },
  topic: {
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16
  },
  cardText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 25,
    marginLeft: 10,
    marginRight: 70,
    marginTop: 5,
  },
  button: {
    marginTop: 10,
    marginLeft: 10,
    borderWidth: 2.5, 
    borderColor: '#4da3ff', 
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20
  },
  buttonText: {
    color: '#4da3ff',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#444',
    lineHeight: 25,
    marginTop: 10,
    marginLeft: 10,
  },
  grayCard: {
    backgroundColor: '#f1f1f1',
  },
  markRead: {
    borderWidth: 2,
    borderColor: '#4da3ff',
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 12,
    marginLeft: 120,
    marginRight: 120,
    marginTop: 180,
    flexDirection: 'row'
  },
  markReadText: {
    color: '#4da3ff',
    fontWeight: '600',
    marginLeft: 10,
  },
  eyeIcon: {
    width: 20,
    height: 25,
    resizeMode: 'contain',
    marginLeft: 20,
    tintColor: '#4da3ff',
  },
})
