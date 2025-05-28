// JavaScript for drawer navigator
// DrawerNavigator.js

import { createDrawerNavigator } from "@react-navigation/drawer";
import WeatherScreen from "../screens/WeatherScreen";
import ActivityScreen from "../screens/ActivityScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {

    return (
        <Drawer.Navigator>
            <Drawer.Screen
                name="Weather"
                component={WeatherScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Activity"
                component={ActivityScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <AntDesign name="profile" size={size} color={color} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
};