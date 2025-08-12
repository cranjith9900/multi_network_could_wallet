import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BackgroundBeamsWithCollision } from "../src/components/ui/background-beams-with-collision";

createRoot(document.getElementById("root")!).render(
  /* <BackgroundBeamsWithCollision> */
  <App />
  /* </BackgroundBeamsWithCollision> */
);
