import type { Mood } from "../types/mood";

type BarConfig = {
  label: string;
  key: keyof Mood["bars"];
  color: "green" | "orange" | "purple";
};

const BARS: BarConfig[] = [
  { label: "COMMITS", key: "commits", color: "green" },
  { label: "PROCRASTIN.", key: "procrast", color: "orange" },
  { label: "HUMOR", key: "humor", color: "purple" },
];

type MoodBarsProps = {
  bars: Mood["bars"];
};

export function MoodBars({ bars }: MoodBarsProps) {
  return (
    <div className="bars">
      {BARS.map(({ label, key, color }) => {
        const value = bars[key];
        return (
          <div className="bar-row" key={key}>
            <span className="bar-label">{label}</span>
            <div
              className="bar-track"
              role="progressbar"
              aria-label={label}
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`bar-fill ${color}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className={`bar-val ${color}-text`}>{value}%</span>
          </div>
        );
      })}
    </div>
  );
}
