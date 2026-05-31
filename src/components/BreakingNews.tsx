interface BreakingNewsProps {
  message: string;
}

export const BreakingNews = ({ message }: BreakingNewsProps) => (
  <div className="breaking-news" role="status" aria-live="polite">
    <span className="breaking-news-icon">🚨</span>
    <span className="breaking-news-label">Breaking News:</span> {message}
  </div>
);
