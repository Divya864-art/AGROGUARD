import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

/* Farmer Screens */
import AlertsScreen from "../screens/farmer/AlertScreen";
import DashboardScreen from "../screens/farmer/DashboardScreen";
import HelpScreen from "../screens/farmer/HelpScreen";
import LanguageScreen from "../screens/farmer/LanguageScreen";
import MapScreen from "../screens/farmer/MapScreen";
import RecommendationScreen from "../screens/farmer/RecommendationScreen";
import SensorHealthScreen from "../screens/farmer/SensorHealthScreen";

import { useAlerts } from "../context/AlertContext";

const Tab = createBottomTabNavigator();

export default function FarmerNavigator() {
  // ✅ CORRECT: hook inside component
  const { alertCount } = useAlerts();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2e7d32",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
        },
      }}
    >
      <Tab.Screen
        name="Status"
        component={DashboardScreen}
        options={{
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />

      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: () => <Text>🗺</Text>,
        }}
      />

      <Tab.Screen
        name="sol"
        component={RecommendationScreen}
        options={{
          tabBarIcon: () => <Text>🌱</Text>,
        }}
      />

      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: () => <Text>🚨</Text>,
          // 🔔 WhatsApp-style badge
          tabBarBadge: alertCount > 0 ? alertCount : undefined,
        }}
      />

      <Tab.Screen
        name="Sensors"
        component={SensorHealthScreen}
        options={{
          tabBarIcon: () => <Text>🔧</Text>,
        }}
      />

      <Tab.Screen
        name="Language"
        component={LanguageScreen}
        options={{
          tabBarIcon: () => <Text>🌐</Text>,
        }}
      />

      <Tab.Screen
        name="Help"
        component={HelpScreen}
        options={{
          tabBarIcon: () => <Text>☎</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
