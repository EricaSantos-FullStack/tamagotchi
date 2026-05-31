export type MoodKey = "neutral" | "angry" | "flerken";

export type Mood = {
  key: MoodKey;
  label: string;
  img: string;
  bars: {
    commits: number;
    procrast: number;
    humor: number;
  };
  speech: {
    text: string;
    author: string;
  };
  badge: {
    text: string;
    danger: boolean;
  };
};
