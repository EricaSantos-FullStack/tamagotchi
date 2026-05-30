import React from "react";
import flerkenImg from "../assets/hero.png";

interface ChewieProps {
  mood: "happy" | "neutral" | "angry";
  action?: string;
}

const moodText: Record<string, string> = {
  happy: "Chewie está feliz! 😺",
  neutral: "Chewie está esperando... 😼",
  angry: "Chewie ficou bravo! 😾",
};

export const Chewie: React.FC<ChewieProps> = ({ mood, action }) => (
  <div style={{ textAlign: "center" }}>
    <img
      src={flerkenImg}
      alt="Chewie, o flerken procrastinador"
      style={{
        width: 180,
        filter: mood === "angry" ? "hue-rotate(320deg) contrast(1.2)" : "none",
        transition: "filter 0.3s",
      }}
    />
    <div style={{ fontWeight: "bold", marginTop: 8 }}>{moodText[mood]}</div>
    {action && (
      <div style={{ color: "#e63946", marginTop: 6, fontSize: 15 }}>
        {action}
      </div>
    )}
  </div>
);
