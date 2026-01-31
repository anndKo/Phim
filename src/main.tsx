import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeCSP, preventClickjacking, initializeDevToolsProtection } from "./lib/csp";
import { initializeVideoProtection, startFPSMonitoring } from "./lib/videoProtection";

// Initialize security measures
if (!import.meta.env.DEV) {
  // Only in production
  initializeCSP();
  preventClickjacking();
  initializeDevToolsProtection();
}

// Always initialize video protection
initializeVideoProtection();
startFPSMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
