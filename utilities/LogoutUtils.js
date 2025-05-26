// JavaScript for log out utilities
// LogoutUtils.js 

import { Alert } from 'react-native';

// Function to log out of application
export default function handleLogout(navigation) {
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