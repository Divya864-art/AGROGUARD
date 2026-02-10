import { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alertCount, setAlertCount] = useState(0);

  return (
    <AlertContext.Provider value={{ alertCount, setAlertCount }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertContext);
}
