import type { FeedType } from "../hooks/useChewieMood";

type FeedActionsProps = {
  onFeed: (type: FeedType) => void;
  goodFeedCount: number;
  badFeedCount: number;
};

export function FeedActions({
  onFeed,
  goodFeedCount,
  badFeedCount,
}: FeedActionsProps) {
  return (
    <>
      <div className="feed-actions">
        <button
          type="button"
          className="counter"
          onClick={() => onFeed("good")}
        >
          Alimentar com commit/tarefa
        </button>
        <button
          type="button"
          className="counter"
          onClick={() => onFeed("bad")}
        >
          Dar comida ruim (procrastinar)
        </button>
      </div>
      <p className="feed-summary">
        Alimentações boas: {goodFeedCount} | Comidas ruins: {badFeedCount}
      </p>
    </>
  );
}
