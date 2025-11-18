import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CurrencyProvider } from "./contexts/CurrencyContext.tsx";
import { UnitPreferenceProvider } from "./contexts/UnitPreferenceContext.tsx";

createRoot(document.getElementById("root")!).render(
  <CurrencyProvider>
    <UnitPreferenceProvider>
      <App />
    </UnitPreferenceProvider>
  </CurrencyProvider>
);
  