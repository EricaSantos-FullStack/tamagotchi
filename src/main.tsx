import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Fundo neon e orbs para visual glassmorphism */}
    <>
      <div className="bg-tint" />
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <main className="app">
        <App />
      </main>
    </>
  </StrictMode>,
);
