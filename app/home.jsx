import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const home = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        };
        loadUser();
    }, []);

    const ads = [
        {id: "1", image: require('../assets/eye_open.png')},
        {id: "2", image: require('../assets/eye_open.png')},
        {id: "3", image: require('../assets/eye_open.png')},
    ]

    const recentUploads = [
        {
            id: "r1",
            image: require("../assets/eye_open.png"),
            time: "Uploaded by 3/12/2025 8:00:00 P.M.",
        },
        {
            id: "r2",
            image: require("../assets/eye_open.png"),
            time: "Uploaded by 2/12/2025 9:10:00 A.M.",
        },
    ];

    const adListRef = useRef(null);
    const [activeAdIndex, setActiveAdIndex] = useState(0);

    const AD_CARD_WIDTH = 395;

    const onAdScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / AD_CARD_WIDTH);
    setActiveAdIndex(index);
    };

        return (
            <ScrollView contentContainerStyle={styles.container}>
                <View>
                    <View style={styles.topSection}>
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.profile} onPress={() => router.push('/profile')}>
                                <Image source={require('../assets/people_icon.png')} style={styles.profileImage} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.notification} onPress={() => router.push('/notificationscreen')}>
                                <Image source={require('../assets/notification_icon.png')} style={styles.notificationIcon} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.name}>
                            Hey, {user ? user.username : ""}
                        </Text>
                    </View>

                    <View style={styles.navigationBar}>
                        <TouchableOpacity style={styles.navigationButton} onPress={() => router.push('/upload')} >
                            <Image source={require('../assets/upload_icon.png')} style={styles.uploadImage} />
                            <Text style={styles.navigationText}>Upload Image</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.navigationButton} onPress={() => router.push('/history')} >
                            <Image source={require('../assets/clock_icon.png')} style={styles.navigationImage} />
                            <Text style={styles.navigationText}>View History</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.navigationButton} onPress={() => router.push('/upload')} >
                            <Image source={require('../assets/specialist_icon.png')} style={styles.navigationImage} />
                            <Text style={styles.navigationText}>Specialist</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.adsText} >Advertisement</Text>

                    <View style={styles.adsList}>
                        <FlatList 
                            ref={adListRef}
                            data={ads}
                            keyExtractor={(item) => item.id}
                            horizontal pagingEnabled
                            showsHorizontalScrollIndicator = {false}
                            onScroll = {onAdScroll}
                            scrollEventThrottle={16}
                            getItemLayout={(_, index) => ({
                                length: AD_CARD_WIDTH,
                                offset: AD_CARD_WIDTH * index,
                                index,
                            })}
                            onScrollToIndexFailed={(info) => {
                                setTimeout(() => {
                                    adListRef.current?.scrollToIndex({
                                        index: info.index,
                                        animated: true,
                                    });
                                }, 300);
                            }}
                            renderItem={({item}) => (
                                <View style={{width: AD_CARD_WIDTH}}>
                                    <Image source={item.image} style={styles.adsImage} />
                                </View>
                            )}
                        />
                    </View>

                    <View style={styles.adsArrow}>
                        <Text style={styles.adsArrowText}>›</Text>
                    </View>

                    <View style={styles.dotsRow}>
                        {ads.map((_, i) => (
                            <View
                            key={i}
                            style={[styles.dot, i === activeAdIndex ? styles.dotActive : styles.dotInactive,]} />
                        ))}
                    </View>

                    <View style={styles.recentText}>
                        <Text style={styles.recentuploadText}>Recent Upload</Text>
    
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={recentUploads}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingLeft: 20,
                            paddingRight: 10,
                            paddingBottom: 10,
                        }}
                        renderItem={({ item }) => (
                        <TouchableOpacity activeOpacity={0.9} style={styles.recentCard} onPress={() => router.push("/history")}>
                            <Image source={item.image} style={styles.recentImage} />
                            <View style={styles.recentOverlay}>
                            <Text style={styles.recentOverlayText}>{item.time}</Text>
                            </View>
                        </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity style={styles.signoutButton} onPress={() => router.push("/firstpage")}>
                        <Image source={require('../assets/signout_icon.png')} style={styles.signoutImage} />
                        <Text style={styles.signoutText}>Sign Out</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
  )
}

export default home

const styles = StyleSheet.create({
    container: {
        paddingBottom: 50,
    },
    topSection: {
        backgroundColor: '#88C8FF',
        paddingBottom: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 18,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 50,
        paddingHorizontal: 20,
    },
    profile: {
        backgroundColor: "#aad5fcff",
        justifyContent: 'center',
        borderRadius: 30,
        marginLeft: '5%',
        width: 60,
        height: 60,
        alignItems: "center",
        borderWidth: 5,
        borderColor: '#54adfaff',
        },
    profileImage: {
        width: 38,
        height: 38,
        marginRight: 10,
        resizeMode: 'contain',
        marginLeft: "8",
    },
    notification: {
        paddingVertical: 15,
        marginRight: 15,
    },
    notificationIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    name: {
        fontSize: 40,
        fontWeight: "700",
        color: "black",
        marginTop: 15,
        marginLeft: 30,     
    },
    navigationBar: {
        position: 'absolute',
        marginTop: 190,
        marginHorizontal: 20,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#6AAEF8",
        paddingVertical: 14,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: 'white',
    },
    navigationButton: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: 6,
    },
    navigationImage: {
        width: 26,
        height: 26,
        resizeMode: "contain",
        tintColor: "#2E7BEA",
    },
    navigationText: {
        textAligh: "center",
    },
    uploadImage: {
        width: 36,
        height: 30,
        resizeMode: "contain",
        tintColor: "#2E7BEA",
    },
    adsText: {
        fontSize: 25,
        fontWeight: "700",
        color: "black",
        marginTop: 65,
        marginLeft: 30, 
    },
    adsList: {
        marginTop: 12,
        marginHorizontal: 20,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#6AAEF8",
        overflow: "hidden",
        backgroundColor: "#fff",
        paddingVertical: 10,        
    },
    adsImage: {
        width: "100%",
        height: "200",
        resizeMode: "cover",    
    },
    adsArrow: {
        position: "absolute",
        right: 6,
        top: 40,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(255,255,255,0.8)",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 410,
        marginRight: 20,
    },
    adsArrowText: {
        fontSize: 28,
        fontWeight: "900",
        color: "#2E7BEA",
        marginTop: -2,
    },
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 10,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 999,
    },
    dotActive: {
        width: 26,
        backgroundColor: "#88C8FF",
    },
    dotInactive: {
        width: 10,
        backgroundColor: "#CFE4FF",
    },
    recentText: {
        flexDirection: "row",
        marginTop: 20,
        marginBottom: 10, 
    },
    recentuploadText: {
        fontSize: 25,
        fontWeight: "700",
        color: "black",
        marginLeft: 30,
    },
    seeAll: {
        fontSize: 16,
        fontWeight: '600',
        color: 'grey',
        paddingVertical: 1,
        marginLeft: 150,
        marginTop: 8,
    },
    recentCard: {
        width: 380,
        height: 250,
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#6AAEF8",
        overflow: "hidden",
        marginRight: 16,
        backgroundColor: "#fff",
    },
    recentImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    recentOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 12,
        backgroundColor: "rgba(0,0,0,0.25)",
    },
    recentOverlayText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
    },
    signoutButton: {
        paddingVertical: 18,
        borderRadius: 10,
        marginTop: 40,
        alignItems: "center",
        flexDirection: "row",
    },
    signoutImage: {
        width: 20,
        height: 20,
        marginLeft: "170",  
    },
    signoutText: {
        fontSize: 16,
        fontWeight: "700",
        color: "red",
        marginLeft: 5,
    },
})