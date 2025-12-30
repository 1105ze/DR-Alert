import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, Pressable} from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

const personaldetail = () => {
    const router = useRouter();
    const [isEditing, setIsEditing] = React.useState(false);

    const [username, setUsername] = React.useState("Ze Gui");
    const [gender, setGender] = React.useState("male");
    const [day, setDay] = React.useState("01");
    const [month, setMonth] = React.useState("01");
    const [year, setYear] = React.useState("2025");
    const [occupation, setOccupation] = React.useState("IT");
    const [email, setEmail] = React.useState("123@gmail.com");
    const [contact, setContact] = React.useState("+60 12-3456789");
    const [password, setPassword] = React.useState("Zegui123");

    const occupations = ["IT", "Student", "Doctor", "Teacher", "Engineer", "Others"];
    const [showOccModal, setShowOccModal] = React.useState(false);

    const toggleEdit = () => setIsEditing((v) => !v);

    const saveProfile = () => {
        setIsEditing(false);
    };

    const Radio = ({ label, selected, onPress }) => {
    return (
        <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: '#111',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {selected ? (
            <View style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#111',
            }} />
            ) : null}
        </View>
        <Text style={{ marginLeft: 10, fontSize: 16, fontWeight: '700' }}>{label}</Text>
        </Pressable>
    );
    };

    return (
        <ScrollView>
            <View>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.back} onPress={() => router.push('/home')}>
                        <Text style={styles.backText}>‹   Personal Details</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.label, !isEditing && styles.disabledWrap]}>Username</Text>
                    <TextInput value={username} onChangeText={setUsername} editable={isEditing} style={[styles.labelInput, !isEditing && styles.disabledInput]} />

                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderRow}>
                        <Radio label="Male" selected={gender === "male"} onPress={() => isEditing && setGender("male")} disabled={!isEditing} />
                        <View style={{ width: 22 }} />
                        <Radio label="Female" selected={gender === "female"} onPress={() => isEditing && setGender("female")} disabled={!isEditing} />
                    </View>

                    <Text style={styles.label}>Date of Birth</Text>
                    <View style={styles.dobRow}>
                        <TextInput
                            value={day}
                            onChangeText={(t) => setDay(t.replace(/[^0-9]/g, '').slice(0, 2))}
                            editable={isEditing}
                            keyboardType="number-pad"
                            placeholder="DD"
                            style={[styles.dobInput, !isEditing && styles.inputDisabled]}
                        />
                        <TextInput
                            value={month}
                            onChangeText={(t) => setMonth(t.replace(/[^0-9]/g, '').slice(0, 2))}
                            editable={isEditing}
                            keyboardType="number-pad"
                            placeholder="MM"
                            style={[styles.dobInput, !isEditing && styles.inputDisabled]}
                        />
                        <TextInput
                            value={year}
                            onChangeText={(t) => setYear(t.replace(/[^0-9]/g, '').slice(0, 4))}
                            editable={isEditing}
                            keyboardType="number-pad"
                            placeholder="YYYY"
                            style={[styles.dobInputYear, !isEditing && styles.inputDisabled]}
                        />
                    </View>

                    <Text style={styles.label}>Occupation</Text>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => isEditing && setShowOccModal(true)} style={[styles.selectField, !isEditing && styles.inputDisabled]} >
                        <Text style={[styles.selectText, !isEditing && styles.selectTextDisabled]}>{occupation}</Text>
                        <Text style={styles.chev}>›</Text>
                    </TouchableOpacity>

                    <Text style={[styles.label, !isEditing && styles.disabledWrap]}>Email Address</Text>
                    <TextInput value={email} onChangeText={setEmail} editable={isEditing} style={[styles.labelInput, !isEditing && styles.disabledInput]} />

                    <Text style={[styles.label, !isEditing && styles.disabledWrap]}>Contact Number</Text>
                    <TextInput value={contact} onChangeText={setContact} editable={isEditing} style={[styles.labelInput, !isEditing && styles.disabledInput]} />

                    <Text style={[styles.label, !isEditing && styles.disabledWrap]}>Password</Text>
                    <TextInput value={password} onChangeText={setPassword} editable={isEditing} style={[styles.labelInput, !isEditing && styles.disabledInput]} />
                
                    {!isEditing ? (
                        <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={toggleEdit}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={saveProfile}>
                        <Text style={styles.editButtonText}>Save</Text>
                        </TouchableOpacity>
                    )}
                
                </View>

                {showOccModal && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Select Occupation</Text>

                        {occupations.map((item) => (
                            <TouchableOpacity
                            key={item}
                            style={styles.modalItem}
                            onPress={() => {
                                setOccupation(item);
                                setShowOccModal(false);
                            }}
                            >
                            <Text style={styles.modalItemText}>{item}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setShowOccModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                )}

                <Text style={styles.disclaimer}>
                    This is a screening tool only. Consult a healthcare professional for diagnosis.
                </Text>

            </View>
        </ScrollView>
    )
}

export default personaldetail

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#88C8FF',
        paddingBottom: 200,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 18,
    },
    back: {
        paddingVertical: 15,
        borderRadius: 100,
        marginTop: 30,
        marginLeft: 20,
    },
    backText: {
        fontSize: 20,
    },
    card: {
        position: 'absolute',
        marginTop: 100,
        left: 30,
        right: 30,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    label:{
        fontSize: 15, 
        fontWeight: "800", 
        color: "#0B0B0B",
        marginLeft: 20,
        marginTop: 20,
    },
    labelInput: {
        height: 42,
        paddingHorizontal: 15,
        fontSize: 15,
        color: "#333",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        borderWidth: 1,
        borderRadius: 18,
        borderColor: '#858585ff',
    },
    genderRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        marginTop: 8,
        marginLeft: 20,
    },
    dobRow: {
        flexDirection: "row",
        gap: 12,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 8,
    },
    dobInput: {
        flex: 1,
        height: 42,
        borderWidth: 1,
        borderColor: "#858585ff",
        borderRadius: 14,
        paddingHorizontal: 12,
        fontSize: 15,
        backgroundColor: "#FFF",
    },
    dobInputYear: {
        flex: 1.3,
        height: 42,
        borderWidth: 1,
        borderColor: "#858585ff",
        borderRadius: 14,
        paddingHorizontal: 12,
        fontSize: 15,
        backgroundColor: "#FFF",
    },
    inputDisabled: {
        backgroundColor: "#F0F0F0",
        color: "#777",
    },
    selectField: {
        height: 42,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        borderWidth: 1,
        borderRadius: 18,
        borderColor: '#858585ff',
        paddingHorizontal: 15,
        backgroundColor: "#FFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectText: {
        fontSize: 15,
        color: "#333",
        fontWeight: "600",
    },
    chev: { 
        fontSize: 22, 
        color: "#333" 
    },
    selectTextDisabled: { 
        color: "#777" 
    },
    inputDisabled: { 
        backgroundColor: "#F0F0F0" 
    },
    editButton: {
        marginTop: 30,
        height: 45,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
        borderRadius: 18,
        backgroundColor: "#79B9FF",
        justifyContent: "center",
        alignItems: "center",
  },
    editButtonText: { 
        fontSize: 20, 
        fontWeight: "800", 
        color: "#0B0B0B" 
    },
    modalOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: "#FFF",
        borderRadius: 18,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 10,
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },
    modalItemText: {
        fontSize: 16,
        fontWeight: "700",
    },
    modalClose: {
        marginTop: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#2E73FF",
    },
    disclaimer: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 560,
    }
})