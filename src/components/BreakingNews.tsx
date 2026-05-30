import React from "react";

interface BreakingNewsProps {
  message: string;
}

export const BreakingNews: React.FC<BreakingNewsProps> = ({ message }) => (
  <div
    style={{
      position: "fixed",
      top: 24,
      right: 24,
      background: "#fffbe6",
      color: "#d7263d",
      border: "2px solid #d7263d",
      borderRadius: 8,
      padding: "12px 20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      zIndex: 1000,
      fontWeight: "bold",
      minWidth: 220,
      fontSize: 16,
      animation: "breakingNewsFadeIn 0.7s",
    }}
  >
    <span style={{ marginRight: 8 }}>🚨</span>
    <span style={{ fontWeight: 700 }}>Breaking News:</span> {message}
  </div>
);
