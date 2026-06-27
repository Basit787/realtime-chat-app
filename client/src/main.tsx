import { createRoot } from "react-dom/client";
import App from "./App";
import { Provider } from "@/providers/Provider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <App />
  </Provider>,
);
