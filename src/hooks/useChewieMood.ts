import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCat,
  createNotificationStream,
  type CatState,
  type Notification,
} from "../api/backend";

const MOOD_EMOJI: Record<CatState["mood"], string> = {
  happy: "😸",
  neutral: "🐱",
  grumpy: "😾",
  monster: "👹",
};

export function useChewieMood() {
  const [cat, setCat] = useState<CatState | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const sourceRef = useRef<EventSource | null>(null);

  const refreshCat = useCallback(async () => {
    try {
      const data = await fetchCat();
      setCat(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // initial fetch
  useEffect(() => {
    refreshCat();
  }, [refreshCat]);

  // SSE stream
  useEffect(() => {
    const source = createNotificationStream((n) => {
      setNotifications((prev) => [n, ...prev]);
    });
    sourceRef.current = source;
    return () => source.close();
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const moodEmoji = cat ? MOOD_EMOJI[cat.mood] : "🐱";

  return { cat, moodEmoji, notifications, refreshCat, dismissNotification };
}
