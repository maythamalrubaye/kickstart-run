import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add loading indicator to page immediately
const rootElement = document.getElementById("root")!;
rootElement.innerHTML = `
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: white;">
    <div style="text-align: center;">
      <div style="width: 32px; height: 32px; border: 4px solid #16a34a; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
      <p style="color: #666; margin: 0;">Loading YouthRunningTracker...</p>
    </div>
  </div>
  <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
`;

createRoot(rootElement).render(<App />);
