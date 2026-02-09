import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native'
import React from 'react'
import { useRouter } from "expo-router"

const CheckboxRow = ({ label, checked, onToggle }) => {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <Text style={styles.rowText}>{label}</Text>
    </TouchableOpacity>
  );
};

const medicaldetail = () => {
  const router = useRouter();

  const [conditions, setConditions] = React.useState({
    diabetes: false,
    hypertension: false,
    cholesterol: false,
    heart: false,
    kidney: false,
  });

  const [symptoms, setSymptoms] = React.useState({
    blurred: false,
    night: false,
    floaters: false,
    pain: false,
    none: false,
  });

  const [conditionNotes, setConditionNotes] = React.useState("");
  const [symptomNotes, setSymptomNotes] = React.useState("");

  const toggleCondition = (key) => {
    setConditions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSymptom = (key) => {
    // If "No noticeable symptoms" selected -> turn off other symptom options
    if (key === "none") {
      setSymptoms((prev) => {
        const newVal = !prev.none;
        return {
          blurred: false,
          night: false,
          floaters: false,
          pain: false,
          none: newVal,
        };
      });
      return;
    }

    // If selecting any symptom -> turn off "none"
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key], none: false }));
  };

  const onSubmit = () => {
    const payload = {
      conditions,
      conditionNotes,
      symptoms,
      symptomNotes,
    };

    // Later connect to database/API; for now just show message
    Alert.alert("Saved", "Your medical details have been saved.");
    // console.log(payload);
    // router.back(); // optional
  };

    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#88C8FF" }}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Details</Text>
        </View>

        {/* IMPORTANT: style={{flex:1}} */}
        <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        >
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Medical Conditions</Text>

            <CheckboxRow
            label="Diabetes"
            checked={conditions.diabetes}
            onToggle={() => toggleCondition("diabetes")}
            />
            <CheckboxRow
            label="Hypertension"
            checked={conditions.hypertension}
            onToggle={() => toggleCondition("hypertension")}
            />
            <CheckboxRow
            label="High Cholesterol"
            checked={conditions.cholesterol}
            onToggle={() => toggleCondition("cholesterol")}
            />
            <CheckboxRow
            label="Heart Disease"
            checked={conditions.heart}
            onToggle={() => toggleCondition("heart")}
            />
            <CheckboxRow
            label="Kidney Disease"
            checked={conditions.kidney}
            onToggle={() => toggleCondition("kidney")}
            />

            <TextInput
            value={conditionNotes}
            onChangeText={setConditionNotes}
            placeholder="Additional Notes.."
            placeholderTextColor="#777"
            style={styles.notes}
            multiline
            />

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Vision Symptoms</Text>

            <CheckboxRow
            label="Blurred vision"
            checked={symptoms.blurred}
            onToggle={() => toggleSymptom("blurred")}
            />
            <CheckboxRow
            label="Difficulty seeing at night"
            checked={symptoms.night}
            onToggle={() => toggleSymptom("night")}
            />
            <CheckboxRow
            label="Floaters (black spots)"
            checked={symptoms.floaters}
            onToggle={() => toggleSymptom("floaters")}
            />
            <CheckboxRow
            label="Eye pain or pressure"
            checked={symptoms.pain}
            onToggle={() => toggleSymptom("pain")}
            />
            <CheckboxRow
            label="No noticeable symptoms"
            checked={symptoms.none}
            onToggle={() => toggleSymptom("none")}
            />

            <TextInput
            value={symptomNotes}
            onChangeText={setSymptomNotes}
            placeholder="Additional Notes.."
            placeholderTextColor="#777"
            style={styles.notes}
            multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
            <Text style={styles.submitText}>Submit & Save</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.footer}>
            <Text style={styles.footerText}>
            This is a screening tool only. Consult a healthcare professional for
            diagnosis.
            </Text>
        </View>
        </ScrollView>
    </SafeAreaView>
    );
};

export default medicaldetail;

const styles = StyleSheet.create({

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  backBtn: { padding: 8, marginRight: 8 },
  backIcon: { fontSize: 24, fontWeight: "700" },
  headerTitle: { fontSize: 22, fontWeight: "800" },

  scroll: {
  paddingTop: 10,
  paddingBottom: 18,
  paddingHorizontal: 0,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,

    // shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    // shadow (Android)
    elevation: 6,
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#000",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#88C8FF",
    borderColor: "#000",
  },
  checkMark: { fontSize: 16, fontWeight: "900" },
  rowText: { fontSize: 22, fontWeight: "700" },

  notes: {
    borderWidth: 1.5,
    borderColor: "#CFCFCF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: 8,
    minHeight: 44,
  },

  divider: {
    height: 2,
    backgroundColor: "#111",
    marginVertical: 18,
    opacity: 0.9,
  },

  submitBtn: {
    backgroundColor: "#88C8FF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: { fontSize: 22, fontWeight: "900" },

  footer: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    alignItems: "center",
  },
  footerText: { fontSize: 12, opacity: 0.75, textAlign: "center" },
});