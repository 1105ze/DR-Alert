import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

const aboutapp = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹  About App</Text>
        </TouchableOpacity>
      </View>

      {/* Content Card */}
      <View style={styles.card}>
        <Text style={styles.description}>
          This application is an AI-assisted diabetic retinopathy screening tool designed
          to help users detect early signs of diabetic eye disease using retinal fundus images.
          By leveraging deep learning and explainable AI techniques, the app provides fast,
          accessible, and transparent screening results to support early medical intervention.
        </Text>

        <View style={styles.divider} />

        {/* Objectives */}
        <Text style={styles.listItemTitle}>Purpose</Text>
        <View style={styles.featureCard}>
            <Text style={styles.listItem}>1. Enable early detection of diabetic retinopathy</Text>
        </View>

        <View style={styles.featureCard}>
            <Text style={styles.listItem}>2. Support patients with accessible eye health information</Text>
        </View>

        <View style={styles.featureCard}>
            <Text style={styles.listItem}>3. Assist healthcare professionals with AI-generated insights</Text>
        </View>

        <View style={styles.featureCard}>
            <Text style={styles.listItem}>4. Reduce reliance on manual screening for initial assessment</Text>
        </View>

        {/* Feature Cards */}
        <Text style={styles.cardTitle}>Key Features</Text>
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>🧠  AI-Based Classification – Detects DR severity levels</Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureText}>🔍  Explainable AI (Grad-CAM) – Visual explanation of predictions</Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureText}>📄  AI-Generated Reports – Clear and structured screening summaries</Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureText}>🔐  Data Privacy & Security – Encrypted and protected user data</Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureText}>📱  User-Friendly Interface – Designed for ease of use</Text>
        </View>

        <View>
            <Text style={styles.versionTitle}>Version</Text>
            <Text style={styles.versionCard}>Version: 1.0</Text>
            <Text style={styles.versionCard}>Last Update: Dec 2025</Text>
            <Text style={styles.versionCard}>Platform: Mobile Application</Text>
            <Text style={styles.versionCard}>Developed by: CapStone Project Team</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        This is a screening tool only. Consult a healthcare professional for diagnosis.
      </Text>
    </ScrollView>
  );
};


export default aboutapp

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8EC9F9',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backText: {
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    opacity: 0.2,
    marginBottom: 15,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 15,
  },
  listItem: {
    fontSize: 15,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  versionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 30,
  },  
  versionCard: {
    marginTop: 5,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 20,
    marginBottom: 30,
    color: '#333',
  },
});