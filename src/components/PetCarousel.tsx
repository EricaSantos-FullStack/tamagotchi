import type { Mood } from "../types/mood";
import { MoodBars } from "./MoodBars";
import { SpeechBubble } from "./SpeechBubble";

type PetCarouselProps = {
  mood: Mood;
  moodIdx: number;
  moods: Mood[];
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
};

export function PetCarousel({
  mood,
  moodIdx,
  moods,
  onPrev,
  onNext,
  onSelect,
}: PetCarouselProps) {
  return (
    <>
      <div className="carousel">
        <div className="slide">
          <div className="pet-avatar">
            <button
              type="button"
              className="arrow arrow-left"
              onClick={onPrev}
              aria-label="humor anterior"
            >
              ‹
            </button>
            <img
              src={mood.img}
              alt={mood.label}
              className={`pet-img${mood.key === "flerken" ? " grayscale" : ""}`}
            />
            <button
              type="button"
              className="arrow arrow-right"
              onClick={onNext}
              aria-label="próximo humor"
            >
              ›
            </button>
            <span
              className={`commit-badge${mood.badge.danger ? " danger" : ""}`}
            >
              {mood.badge.text}
            </span>
          </div>
          <p className="mood-title">HUMOR ATUAL</p>
          <p className="mood">{mood.label}</p>
          <MoodBars bars={mood.bars} />
          <SpeechBubble text={mood.speech.text} author={mood.speech.author} />
        </div>
      </div>
      <div className="dots" role="tablist" aria-label="Selecionar humor">
        {moods.map((m, i) => {
          const active = i === moodIdx;
          return (
            <button
              key={m.key}
              type="button"
              role="tab"
              className={`dot${active ? " active" : ""}`}
              onClick={() => onSelect(i)}
              aria-label={`Humor ${i + 1}: ${m.key}`}
              aria-selected={active}
            />
          );
        })}
      </div>
    </>
  );
}
