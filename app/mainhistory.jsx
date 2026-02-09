import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function mainhistory() {
  const router = useRouter();

  // Fake data (later can connect to backend)
  const history = [
    {
      id: 1,
      status: "Moderate",
      color: "#E53935",
      date: "3/8/2025, 4:30:00 PM",
      image: require("../assets/eye_open.png"),
    },
    {
      id: 2,
      status: "Mild",
      color: "#7CCAC3",
      date: "23/6/2025, 4:30:00 PM",
      image: require("../assets/eye_open.png"),
    },
    {
      id: 3,
      status: "Mild",
      color: "#7CCAC3",
      date: "1/4/2025, 4:30:00 PM",
      image: require("../assets/eye_open.png"),
    },
  ];
    function StatusLine({ color }) {
    return (
        <View style={styles.statusLineRow}>
        <View style={[styles.statusLineDot, { backgroundColor: color }]} />
        <View style={styles.horizontalLine} />
        </View>
    );
    }

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detection History</Text>
      </View>

      {/* DR Stage */}
      <Text style={styles.title}>DR Stage</Text>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color="#4CAF50" text="No DR" />
        <LegendItem color="#7CCAC3" text="Mild NPDR" />
        <LegendItem color="#FFC107" text="Moderate NPDR" />
        <LegendItem color="#FF7043" text="Severe NPDR" />
        <LegendItem color="#E53935" text="Proliferative DR" />
      </View>

      {/* Timeline (Graph Style) */}
      <View style={styles.timelineContainer}>
        
        {/* Background Status Lines & Dots */}
        <View style={styles.backgroundLinesContainer}>
          <StatusLine color="#E53935" /> {/* Proliferative */}
          <StatusLine color="#FF7043" /> {/* Severe */}
          <StatusLine color="#FFC107" /> {/* Moderate */}
          <StatusLine color="#7CCAC3" /> {/* Mild */}
          <StatusLine color="#4CAF50" /> {/* No DR */}
        </View>

        <View style={styles.pointsWrapper}>
          {[
            { label: "Dec 2024", progress: 0.1 },
            { label: "Feb 2025", progress: 0.3 },
            { label: "Apr 2025", progress: 0.5 },
            { label: "June 2025", progress: 0.5 },
            { label: "Aug 2025", progress: 0.8 },
          ].map((item, index) => (
            <View key={index} style={styles.graphColumn}>
              <View 
                style={[
                  styles.timelineDot, 
                  { bottom: `${item.progress * 100}%` }
                ]} 
              />
              <Text style={styles.timelineDateText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>


      {/* History Title */}
      <View style={styles.historyHeader}>
        <Text style={styles.title}>History</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
      </View>

      {/* History List */}
      {history.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.card, { borderColor: item.color }]}
          onPress={() => router.push('/result')}
        >

          <Image source={item.image} style={styles.image} />

          <View style={styles.cardContent}>

            <View
              style={[
                styles.statusBadge,
                { borderColor: item.color },
              ]}
            >
              <Text style={{ color: item.color }}>
                {item.status}
              </Text>
            </View>

            <Text style={styles.date}>{item.date}</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={item.color}
          />

        </TouchableOpacity>
      ))}

      {/* Footer */}
      <Text style={styles.footer}>
        This is a screening tool only. Consult a healthcare professional for diagnosis.
      </Text>

    </ScrollView>
  );
}

/* Legend Component */
function LegendItem({ color, text }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    padding: 16,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  /* Titles */
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  /* Legend */
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 6,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },

  timelineContainer: {
    height: 220, 
    marginVertical: 20,
    position: 'relative',
    paddingBottom: 40,
  },
  backgroundLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40, // Match the paddingBottom of container
    justifyContent: 'space-between',
  },
  statusLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statusLineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  horizontalLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#000',
  },
  pointsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginLeft: 20, // Offset to start after the status dots
    paddingHorizontal: 10,
  },
  graphColumn: {
    alignItems: 'center',
    width: 60,
  },
  timelineDot: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6BB6FF',
    borderWidth: 3,
    borderColor: '#2F80ED',
    zIndex: 10,
    // Add a slight shadow to make it pop like in Figma
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  timelineDateText: {
    position: 'absolute',
    bottom: -30,
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    width: 70,
  },

  /* History */
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  seeAll: {
    color: "#777",
  },

  /* Cards */
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 14,
    backgroundColor: "#FFF",
  },

  image: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 12,
  },

  cardContent: {
    flex: 1,
  },

  statusBadge: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },

  date: {
    color: "#444",
  },

  /* Footer */
  footer: {
    textAlign: "center",
    color: "#666",
    marginVertical: 30,
    fontSize: 12,
  },
});
