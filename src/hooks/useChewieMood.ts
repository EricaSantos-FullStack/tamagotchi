import { useCallback, useEffect, useState } from "react";
import { moods } from "../data/moods";
import {
  goodFeedNews,
  pickRandomBadNews,
  pickRandomMusicSuggestion,
} from "../data/breakingNews";

const NEWS_TIMEOUT_MS = 3500;

export type FeedType = "good" | "bad";

type NewsItem = { text: string };

export function useChewieMood() {
  const [moodIdx, setMoodIdx] = useState(0);
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [goodFeedCount, setGoodFeedCount] = useState(0);
  const [badFeedCount, setBadFeedCount] = useState(0);

  useEffect(() => {
    if (!newsItem) return;
    const timer = setTimeout(() => setNewsItem(null), NEWS_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [newsItem]);

  const nextMood = useCallback(() => {
    setMoodIdx((i) => (i + 1) % moods.length);
  }, []);

  const prevMood = useCallback(() => {
    setMoodIdx((i) => (i - 1 + moods.length) % moods.length);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }
      if (e.key === "ArrowLeft") prevMood();
      else if (e.key === "ArrowRight") nextMood();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevMood, nextMood]);

  const selectMood = useCallback((i: number) => {
    setMoodIdx(i);
  }, []);

  const feedChewie = useCallback((type: FeedType) => {
    if (type === "good") {
      setGoodFeedCount((n) => n + 1);
      setMoodIdx(0);
      setNewsItem({ text: goodFeedNews });
      return;
    }
    setBadFeedCount((n) => n + 1);
    setMoodIdx(1 + Math.floor(Math.random() * (moods.length - 1)));
    setNewsItem({ text: pickRandomBadNews() });
  }, []);

  const suggestMusic = useCallback(() => {
    setNewsItem({ text: pickRandomMusicSuggestion() });
  }, []);

  return {
    mood: moods[moodIdx],
    moodIdx,
    moods,
    news: newsItem?.text ?? null,
    goodFeedCount,
    badFeedCount,
    nextMood,
    prevMood,
    selectMood,
    feedChewie,
    suggestMusic,
  };
}
