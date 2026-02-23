import { NavigationContainer } from "@react-navigation/native";
import { LanguageProvider } from "./src/context/LanguageContext";
import RoleNavigator from "./src/navigation/RoleNavigator";
import { AlertProvider } from "./src/context/AlertContext";
export default function App() {
  return (
    <LanguageProvider>
      <AlertProvider>
        <NavigationContainer>
          <RoleNavigator />
        </NavigationContainer>
      </AlertProvider>
    </LanguageProvider>
  );
}
