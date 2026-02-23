import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import FarmerNavigator from "./FarmerNavigator";
import VolunteerNavigator from "./VolunteerNavigator";

const Stack = createNativeStackNavigator();

export default function RoleNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Farmer" component={FarmerNavigator} />
      <Stack.Screen name="Volunteer" component={VolunteerNavigator} />
    </Stack.Navigator>
  );
}
