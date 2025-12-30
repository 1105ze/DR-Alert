import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';


const historyData = [
  {
    id: '1',
    result: 'Normal',
    color: '#4CAF50',
    image: require('../assets/eye_open.png'),
    time: '11/18/2025, 4:30:00 PM',
  },
  {
    id: '2',
    result: 'Mild',
    color: '#6BC6C3',
    image: require('../assets/eye_open.png'),
    time: '11/18/2025, 4:30:00 PM',
  },
  {
    id: '3',
    result: 'Moderate',
    color: '#FFC107',
    image: require('../assets/eye_open.png'),
    time: '11/18/2025, 4:30:00 PM',
  },
  {
    id: '4',
    result: 'Severe',
    color: '#FF9800',
    image: require('../assets/eye_open.png'),
    time: '11/18/2025, 4:30:00 PM',
  },
  {
    id: '5',
    result: 'Proliferative',
    color: '#F44336',
    image: require('../assets/eye_open.png'),
    time: '11/18/2025, 4:30:00 PM',
  },
  
]

const history = () => {
  const router = useRouter();
    return (
        <View>
            <View style={styles.header}>
                <TouchableOpacity style={styles.profile} onPress={() => router.push('/home')}>
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
                    <Text style={styles.historyText}>‹   Detection History</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
                    {historyData.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.card, { borderColor: item.color }]}
                        onPress={() => router.push('/result')}
                    >
                        <Image source={item.image} style={styles.cardImage} />

                        <View style={styles.cardContent}>
                        <View style={[styles.badge, { borderColor: item.color }]}>
                            <Text style={[styles.badgeText, { color: item.color }]}>
                            {item.result}
                            </Text>
                        </View>

                        <Text style={styles.time}>{item.time}</Text>
                        </View>

                        <Text style={[styles.arrow, { color: item.color }]}>›</Text>
                    </TouchableOpacity>
                    ))}            
                    
                    <TouchableOpacity style={styles.analysisButton} onPress={() => router.push('/upload')}>
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

export default history

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
    color: '#555',
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
    marginLeft: 130
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