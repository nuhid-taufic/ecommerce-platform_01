import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux"; // Redux Provider
import { store } from "./store/store";
import "./index.css";
import App from "./App.tsx";
import { SettingsProvider } from "./context/SettingsProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      {}
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </Provider>
  </StrictMode>,
);
