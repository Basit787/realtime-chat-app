import { createRoot } from "react-dom/client";
import App from "./App";
import { Provider } from "@/providers/Provider";
import "./index.css";
// Registers the first-tap listener that unlocks call ringtones on mobile
import "@/lib/call-sounds";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <App />
  </Provider>,
);
