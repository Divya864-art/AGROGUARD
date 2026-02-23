import { NavigationContainer } from "@react-navigation/native";
import FarmerNavigator from "./navigation/FarmerNavigator";
import { AlertProvider } from "./context/AlertContext";

export default function App() {
  return (
    <AlertProvider>
      <NavigationContainer>
        <FarmerNavigator />
      </NavigationContainer>
    </AlertProvider>
  );
}
