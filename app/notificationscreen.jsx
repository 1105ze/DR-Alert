import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from "../config";


  const notificationscreen = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
      const fetchNotifications = async () => {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch(
          `${API_BASE_URL}/api/accounts/notifications/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setNotifications(data);

        // 👇 AUTO mark unread as read when page opens
        const unread = data.filter((n) => !n.is_read);

        await Promise.all(
          unread.map((n) =>
            fetch(
              `${API_BASE_URL}/api/accounts/notifications/${n.id}/read/`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
          )
        );

        // update UI
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      };

      fetchNotifications();
    }, []);


    useEffect(() => {
      const loadUser = async () => {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      };
      loadUser();
    }, []);

    const markAllAsRead = async () => {
      const token = await AsyncStorage.getItem("accessToken");

      await Promise.all(
        notifications
          .filter((n) => !n.is_read)
          .map((n) =>
            fetch(`${API_BASE_URL}/api/accounts/notifications/${n.id}/read/`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
          )
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    };

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
              <Text style={styles.username}>Hey, {user ? user.username : ""}</Text>
          </View>

          <View>
              <TouchableOpacity style={styles.back} onPress={() => router.push('/home')}>
                  <Text style={styles.notificationText}>‹   Notifications</Text>
              </TouchableOpacity>
          </View>

          <ScrollView>
            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  item.is_read && styles.grayCard
                ]}
                onPress={async () => {
                  const token = await AsyncStorage.getItem("accessToken");

                  await fetch(`${API_BASE_URL}/api/accounts/notifications/${item.id}/read/`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  setNotifications((prev) =>
                    prev.map((n) =>
                      n.id === item.id ? { ...n, is_read: true } : n
                    )
                  );
                }}
              >
                <Image
                  source={require('../assets/note_icon.png')}
                  style={styles.noteImage}
                />

                <View>
                  <Text style={styles.topic}>
                    {item.receiver_role === "doctor"
                      ? "Doctor Notification"
                      : "Patient Notification"}
                  </Text>

                  <Text style={styles.cardText}>{item.message}</Text>

                  <Text style={styles.time}>
                    {new Date(item.sent_at).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.markRead} onPress={markAllAsRead}>
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
