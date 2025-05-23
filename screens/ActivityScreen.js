import { useState } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    StatusBar,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import styles from '../styles/ActivityScreenStyles';

export default function ActivityScreen() {
    const navigation = useNavigation();
    const [weather, setWeather] = useState('sunny');

    const activities = {
        sunny: ['Go for a walk', 'Have a picnic', 'Ride a bike', 'Visit a local park', 'Go swimming'],
        rainy: ['Read a book', 'Watch a movie', 'Do indoor yoga', 'Cook a new recipe', 'Play a board games'],
    };

    const icons = {
        sunny: 'sun',
        rainy: 'cloud-rain'
    };

    // Function to log out of application
    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    onPress: () => {
                        // Navigate to the login screen
                        navigation.navigate('Login');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={"dark-content"} />

            {/* Header Section */}
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Daily Activities</Text>
                <Text style={styles.subheader}>Based on Weather</Text>
            </View>

            {/* Weather Selection Section */}
            <View style={styles.weatherContainer}>
                <Text style={styles.sectionTitle}>How's the weather today?</Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[
                            styles.weatherButton,
                            weather === 'sunny' ? { backgroundColor: '#FFB347' } : {},
                        ]}
                        onPress={() => setWeather('sunny')}
                    >
                        <Feather name="sun" size={24} color={weather === 'sunny' ? '#fff' : '#FFB347'} />
                        <Text style={[styles.buttonText, weather === 'sunny' ? { color: '#FFF' } : {}]}>Sunny</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.weatherButton,
                            weather === 'rainy' ? { backgroundColor: '#4A90E2' } : {},
                        ]}
                        onPress={() => setWeather('rainy')}
                    >
                        <Feather name="cloud-rain" size={24} color={weather === 'rainy' ? '#fff' : '#4A90E2'} />
                        <Text style={[styles.buttonText, weather === 'rainy' ? { color: '#FFF' } : {}]}>Rainy</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Activity List Section */}
            <View style={styles.activitiesContainer}>
                <View style={styles.activitiesHeader}>
                    <Feather name={icons[weather]} size={22} color={weather === 'sunny' ? '#FFB347' : '#4A90E2'} />
                    <Text style={styles.listHeader}>Recommended Activities</Text>
                </View>

            <FlatList
                data={activities[weather]}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.flatListContent}
                renderItem={({ item }) => (
                    <View style={styles.activityCard}>
                        <Feather name="check-circle" size={18} color={weather === 'sunny' ? '#FFB347' : '#4A90E2'} />
                        <Text style={styles.listItem}>{item}</Text>
                    </View>
                )}
              />
            </View>

            {/* Fixed footer - always at bottom */}
            <View style={styles.footer}>
                {/* Log out */}
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}    
                >
                    <Feather name="log-out" size={16} color="#666" />
                    <Text style={styles.logoutText}>logout</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

