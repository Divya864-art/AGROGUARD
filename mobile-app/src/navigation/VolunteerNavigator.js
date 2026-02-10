import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DeviceStatusScreen from "../screens/volunteer/DeviceStatusScreen";
import MapScreen from "../screens/volunteer/MapScreen";
import RegisterFarmerScreen from "../screens/volunteer/RegisterFarmerScreen";

const Tab = createBottomTabNavigator();

export default function VolunteerNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Devices" component={DeviceStatusScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Register" component={RegisterFarmerScreen} />
    </Tab.Navigator>
  );
}
