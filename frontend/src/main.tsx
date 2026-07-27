import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
// import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { initializeMobile } from "./utils/mobile";

// Register PWA service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("تحديث جديد متاح. هل تريد تحديث التطبيق الآن؟")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

// Initialize mobile features (Capacitor plugins)
initializeMobile();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

// Hide splash screen after app loads
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    if (splash) splash.classList.add("hidden");
  }, 1500);
});
