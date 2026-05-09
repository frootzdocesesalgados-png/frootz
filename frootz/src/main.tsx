import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// When deployed on Netlify (or any static host), set VITE_API_BASE_URL
// to the URL of your deployed API server (e.g. https://frootz-api.railway.app).
// Leave it empty or unset when running on Replit (frontend and API share the same domain).
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
