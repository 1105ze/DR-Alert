import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, FlatList, Image } from 'react-native'
import React from 'react'
import{ useRouter } from "expo-router"

const specialist = () => {
   const router = useRouter();

  const doctors = [
    {
      id: "dr-philip",
      name: "Dr.Philip",
      phone: "+60 125839302",
      exp: "10+ years experience",
      hours: "Mon–Fri, 9:00 AM – 5:00 PM",
      specialty: "Retina Specialist",
      clinic: "ABC Eye Specialist Centre",
      location: "Kuala Lumpur, Malaysia",
      avatar: "https://i.pravatar.cc/200?img=12",
    },
    {
      id: "dr-adeline",
      name: "Dr.Adeline",
      phone: "+60 1119018788",
      exp: "8 years experience",
      hours: "Mon–Fri, 9:00 AM – 5:00 PM",
      specialty: "Ophthalmologist",
      clinic: "Sunrise Eye Clinic",
      location: "Kuala Lumpur, Malaysia",
      avatar: "https://i.pravatar.cc/200?img=47",
    },
    {
      id: "dr-darius",
      name: "Dr.Darius",
      phone: "+60 190207612",
      exp: "5 years experience",
      hours: "Mon–Sat, 9:00 AM – 5:00 PM",
      specialty: "Eye Specialist",
      clinic: "VisionCare Specialist",
      location: "Petaling Jaya, Malaysia",
      avatar: "https://i.pravatar.cc/200?img=56",
    },
    {
      id: "dr-raffles",
      name: "Dr.Raffles",
      phone: "+60 130982810",
      exp: "7 years experience",
      hours: "Mon–Fri, 9:00 AM – 5:00 PM",
      specialty: "Retina Specialist",
      clinic: "City Retina Centre",
      location: "Shah Alam, Malaysia",
      avatar: "https://i.pravatar.cc/200?img=65",
    },
    {
      id: "dr-klang",
      name: "Dr.Klang",
      phone: "+60 178906527",
      exp: "4 years experience",
      hours: "Mon–Sun, 9:00 AM – 5:00 PM",
      specialty: "Ophthalmologist",
      clinic: "Klang Specialist Clinic",
      location: "Klang, Malaysia",
      avatar: "https://i.pravatar.cc/200?img=68",
    },
    {
      id: "dr-lee",
      name: "Dr.Lee",
      phone: "+60 189012341",
      exp: "2 years experience",
      hours: "Mon–Sun, 9:00 AM – 5:00 PM",
      specialty: "Eye Specialist",
      clinic: "Lee Eye Centre",
      location: "Subang Jaya, Malaysia",
      avatar: "https://i.pravatar.cc/200?img=14",
    },
  ];

  const [query, setQuery] = React.useState("");
  const [expandedId, setExpandedId] = React.useState(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) => d.name.toLowerCase().includes(q));
  }, [query]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderDoctor = ({ item }) => {
    const expanded = expandedId === item.id;

    return (
      <View style={styles.card}>
        {/* Chevron */}
        <TouchableOpacity
          style={styles.chevBtn}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.chevIcon}>{expanded ? "⌃" : "⌄"}</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <Image source={{ uri: item.avatar }} style={styles.avatar} />

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.phone}</Text>

          <Text style={styles.exp}>{item.exp}</Text>
          <Text style={styles.sub}>{item.hours}</Text>

          {/* Extra lines only when expanded */}
          {expanded ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.extra}>{item.specialty}</Text>
              <Text style={styles.extra}>{item.clinic}</Text>
              <Text style={styles.extra}>{item.location}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle} />
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>DR Detection</Text>
          <Text style={styles.headerSubtitle}>Diabetic Retinopathy Screening</Text>
        </View>
        <Text style={styles.headerName}>Ze Gui</Text>
      </View>

      {/* Back to home */}
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.pageTitle}>Find a Specialist</Text>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor="#6b6b6b"
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionTitle}>Specialist</Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctor}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This is a screening tool only. Consult a healthcare professional for
          diagnosis.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default specialist;

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
});