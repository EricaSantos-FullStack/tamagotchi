import type { CatState } from "../api/backend";
import { CHEWIE_IMGS } from "../assets/images";

const MOOD_IMG: Record<CatState["mood"], string> = {
  happy: "happy",
  neutral: "calmo",
  grumpy: "irritado",
  monster: "fora_de_controle",
};

const MOOD_BADGE: Record<CatState["mood"], { text: string; danger: boolean }> = {
  happy:   { text: "MVP!",       danger: false },
  neutral: { text: "GIT COMMIT", danger: false },
  grumpy:  { text: "COMMIT JÁ!", danger: true  },
  monster: { text: "🐙 CAOS",    danger: true  },
};

type PetCarouselProps = {
  cat: CatState | null;
};

export function PetCarousel({ cat }: PetCarouselProps) {
  const mood = cat?.mood ?? "neutral";
  const imgKey = MOOD_IMG[mood];
  const badge = MOOD_BADGE[mood];

  return (
    <div className="carousel">
      <div className="slide">
        <div className="pet-avatar">
          <img
            src={CHEWIE_IMGS[imgKey]}
            alt={mood}
            className="pet-img"
          />
          <span className={`commit-badge${badge.danger ? " danger" : ""}`}>
            {badge.text}
          </span>
        </div>
        <p className="mood-title">HUMOR ATUAL</p>
        <p className="mood">{cat?.description ?? "Carregando..."}</p>
        {cat && (
          <div className="mood-bars">
            <div className="bar-row">
              <span className="bar-label">felicidade</span>
              <div className="bar-track">
                <div className="bar-fill green" style={{ width: `${cat.happiness}%` }} />
              </div>
              <span className="bar-value">{Math.round(cat.happiness)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
