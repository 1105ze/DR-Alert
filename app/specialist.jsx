import {StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, FlatList, Image} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

const Specialist = () => {
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");

        if (!token) {
          console.error("❌ No access token found");
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/accounts/doctors/verified/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const text = await res.text();

        if (!res.ok) {
          throw new Error(text);
        }

        const data = JSON.parse(text);
        setDoctors(data);
      } catch (err) {
        console.error("Failed to load doctors:", err.message);
      }
    };

    loadDoctors();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;

    return doctors.filter((d) =>
      (d.name || "").toLowerCase().includes(q)
    );
  }, [query, doctors]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderDoctor = ({ item }) => {
    const expanded = expandedId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.chevBtn}
          onPress={() => toggleExpand(item.id)}
        >
          <Text style={styles.chevIcon}>{expanded ? "⌃" : "⌄"}</Text>
        </TouchableOpacity>

        {item.profile_image ? (
          <Image
            source={{
              uri: item.profile_image.startsWith("data:")
                ? item.profile_image
                : `data:image/jpeg;base64,${item.profile_image}`,
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.name?.charAt(0) || "D"}
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.email}</Text>

          {expanded && (
            <Text style={styles.extra}>{item.specialization}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View style={styles.avatarCircle} />
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>DR Detection</Text>
          <Text style={styles.headerSubtitle}>
            Diabetic Retinopathy Screening
          </Text>
        </View>
        <Text style={styles.headerName}>Ze Gui</Text>
      </View>

      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Find a Specialist</Text>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search doctor"
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionTitle}>Specialist</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDoctor}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This is a screening tool only. Consult a healthcare professional for diagnosis.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Specialist;


const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    backgroundColor: "#88C8FF",
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#BFE1FF",
    borderWidth: 3,
    borderColor: "#6BB6FF",
  },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSubtitle: { marginTop: 6, fontSize: 13 },
  headerName: { fontSize: 16, fontWeight: "800" },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  backIcon: { fontSize: 22, marginRight: 10 },
  backText: { fontSize: 18 },

  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    paddingHorizontal: 18,
    marginTop: 4,
  },

  searchBar: {
    marginTop: 14,
    marginHorizontal: 18,
    backgroundColor: "#D6EEFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },

  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 6,
  },

  card: {
    backgroundColor: "#D6EEFF",
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  chevBtn: {
    position: "absolute",
    left: 12,
    top: 12,
    padding: 6,
    zIndex: 2,
  },
  chevIcon: { fontSize: 18, fontWeight: "900" },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginLeft: 26, // leave space for the chevron like your screenshot
    backgroundColor: "#fff",
  },

  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 20, fontWeight: "800" },
  sub: { fontSize: 14, marginTop: 4, opacity: 0.9 },
  exp: { fontSize: 20, fontWeight: "500", marginTop: 8 },
  extra: { fontSize: 18, fontWeight: "400", marginTop: 6 },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  footerText: { fontSize: 12, opacity: 0.75, textAlign: "center" },

  avatarPlaceholder: {
  width: 84,
  height: 84,
  borderRadius: 42,
  marginLeft: 26,
  backgroundColor: "#88C8FF",
  alignItems: "center",
  justifyContent: "center",
},

avatarText: {
  fontSize: 32,
  fontWeight: "800",
  color: "#fff",
},
});