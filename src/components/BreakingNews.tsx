import type { Notification } from "../api/backend";

interface BreakingNewsProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export const BreakingNews = ({ notification, onClose }: BreakingNewsProps) => {
  const isDestruction = notification.category === "cat_destruction";
  return (
    <div
      className={`breaking-news${isDestruction ? " breaking-news--danger" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="breaking-news-icon">{isDestruction ? "💀" : "🚨"}</span>
      <span className="breaking-news-label">
        {isDestruction ? "DESTRUIÇÃO:" : "Breaking News:"}
      </span>{" "}
      {notification.message}
      <button
        type="button"
        className="breaking-news-close"
        onClick={() => onClose(notification.id)}
        aria-label="fechar notificação"
      >
        ×
      </button>
    </div>
  );
};
