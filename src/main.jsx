import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { init } from "./store.js";
import "./styles.css";

init();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
