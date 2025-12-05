import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

console.log("[main.tsx] Starting application render");

const rootElement = document.getElementById("root");
console.log("[main.tsx] Root element found:", !!rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log("[main.tsx] Render called");
} else {
  console.error("[main.tsx] Root element not found!");
}
