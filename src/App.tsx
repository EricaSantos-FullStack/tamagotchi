import { useState } from "react";
import { Chewie } from "./components/Chewie";
import { BreakingNews } from "./components/BreakingNews";
import "./App.css";

const breakingNewsList = [
  "Chewie procrastinou uma tarefa importante!",
  "Chewie quase apagou o último commit (simulação)!",
  "Chewie escreveu groselha no README (simulação)!",
  "Chewie criou um bug visual (simulação)!",
  "Chewie está esperando por mais commits!",
];

const moods = [
  {
    key: "neutral",
    label: "procrastinando tranquilamente 🙃",
    img: "/img/imgchewie-fofo.png",
    bars: { commits: 62, procrast: 48, humor: 75 },
    speech: {
      text: '"Você tem 3 tarefas urgentes. Estou ignorando todas com maestria."',
      author: "— Chewie, flerken da espécie procrastinus",
    },
    badge: { text: "GIT COMMIT", danger: false },
  },
  {
    key: "angry",
    label: "CHEWIE ESTÁ BRAVO 😾🔥",
    img: "/img/imgchewie-bravo.png",
    bars: { commits: 34, procrast: 82, humor: 28 },
    speech: {
      text: '"VOCÊ ADIOU DE NOVO?! O próximo commit eu apago. 🔪"',
      author: "— Chewie, agora rosnando",
    },
    badge: { text: "COMMIT JÁ!", danger: true },
  },
  {
    key: "flerken",
    label: "MODO FLERKEN TOTAL 🐙💀",
    img: "/img/imgchewie-flerken.png",
    bars: { commits: 9, procrast: 99, humor: 6 },
    speech: {
      text: '"TENTÁCULOS LIBERADOS. Seu README agora é meu. 💀"',
      author: "— Chewie, flerken em fúria interdimensional",
    },
    badge: { text: "🐙 CAOS", danger: true },
  },
];

function App() {
  const [moodIdx, setMoodIdx] = useState(0);
  const [news, setNews] = useState<string | null>(null);
  const [feed, setFeed] = useState<number>(0);
  const [badFeed, setBadFeed] = useState<number>(0);

  function nextMood() {
    setMoodIdx((i) => (i + 1) % moods.length);
  }
  function prevMood() {
    setMoodIdx((i) => (i - 1 + moods.length) % moods.length);
  }

  function feedChewie(type: "good" | "bad") {
    if (type === "good") {
      setFeed((f) => f + 1);
      setMoodIdx(0);
      setNews("Chewie ficou mais feliz com seu progresso!");
    } else {
      setBadFeed((b) => b + 1);
      setMoodIdx(1 + Math.floor(Math.random() * 2)); // angry ou flerken
      setNews(
        breakingNewsList[Math.floor(Math.random() * breakingNewsList.length)],
      );
    }
    setTimeout(() => setNews(null), 3500);
  }

  const mood = moods[moodIdx];

  return (
    <>
      <header className="topbar">
        <h1 className="logo">
          CHEWIE<span className="logo-dot">.</span>dev
        </h1>
        <div className="stats">
          <span className="pill">
            🔥 streak: <strong>{feed}</strong> commits
          </span>
          <span className="pill">
            ⚡ xp:{" "}
            <strong className="xp" style={{ display: "inline-block" }}>
              {feed * 42}
            </strong>
          </span>
        </div>
      </header>
      <div className="grid">
        <section className="card pet-card">
          <p className="pet-label">SEU PET FLERKEN</p>
          <div className="carousel">
            <div
              className={`slide slide-${moodIdx + 1}`}
              style={{ display: "block" }}
            >
              <div className="pet-avatar">
                <button
                  className="arrow arrow-left"
                  onClick={prevMood}
                  aria-label="anterior"
                >
                  ‹
                </button>
                <img
                  src={mood.img}
                  alt={mood.label}
                  className="pet-img"
                  style={{
                    filter: moodIdx === 2 ? "grayscale(100%)" : undefined,
                  }}
                />
                <button
                  className="arrow arrow-right"
                  onClick={nextMood}
                  aria-label="próximo"
                >
                  ›
                </button>
                <span
                  className={`commit-badge${
                    mood.badge.danger ? " danger" : ""
                  }`}
                >
                  {mood.badge.text}
                </span>
              </div>
              <p className="mood-title">HUMOR ATUAL</p>
              <p className="mood">{mood.label}</p>
              <div className="bars">
                <div className="bar-row">
                  <span className="bar-label">COMMITS</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill green"
                      style={{ width: `${mood.bars.commits}%` }}
                    ></div>
                  </div>
                  <span className="bar-val green-text">
                    {mood.bars.commits}%
                  </span>
                </div>
                <div className="bar-row">
                  <span className="bar-label">PROCRASTIN.</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill orange"
                      style={{ width: `${mood.bars.procrast}%` }}
                    ></div>
                  </div>
                  <span className="bar-val orange-text">
                    {mood.bars.procrast}%
                  </span>
                </div>
                <div className="bar-row">
                  <span className="bar-label">HUMOR</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill purple"
                      style={{ width: `${mood.bars.humor}%` }}
                    ></div>
                  </div>
                  <span className="bar-val purple-text">
                    {mood.bars.humor}%
                  </span>
                </div>
              </div>
              <blockquote className="speech">
                <p className="speech-text">{mood.speech.text}</p>
                <p className="speech-author">{mood.speech.author}</p>
              </blockquote>
            </div>
          </div>
          <div className="dots">
            {moods.map((_, i) => (
              <button
                key={i}
                className={`dot${i === moodIdx ? " active" : ""}`}
                onClick={() => setMoodIdx(i)}
                aria-label={`Humor ${i + 1}`}
                style={{
                  background: i === moodIdx ? "var(--accent)" : undefined,
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <button
              className="counter"
              onClick={() => feedChewie("good")}
              style={{ flex: 1 }}
            >
              Alimentar com commit/tarefa
            </button>
            <button
              className="counter"
              onClick={() => feedChewie("bad")}
              style={{ flex: 1 }}
            >
              Dar comida ruim (procrastinar)
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 15 }}>
            <span>
              Alimentações boas: {feed} | Comidas ruins: {badFeed}
            </span>
          </div>
        </section>
        <aside className="sidebar">
          <section className="card tasks-card">
            <div className="tasks-head">
              <h2>tarefas</h2>
              <span className="pill small">4 pendentes</span>
            </div>
            <ul className="task-list">
              <li className="task done">
                <span className="checkbox checked">✓</span>
                <span className="task-name">fazer o README do projeto</span>
                <span className="task-dash">—</span>
              </li>
              <li className="task">
                <span className="checkbox"></span>
                <span className="task-name">
                  revisar o pull request <em className="x">×3</em>
                </span>
                <span className="task-actions">
                  <button className="btn-adiar">adiar</button>
                  <button
                    className="btn-desistir-task"
                    title="desistir desta tarefa"
                  >
                    🏳️
                  </button>
                </span>
              </li>
              <li className="task">
                <span className="checkbox"></span>
                <span className="task-name">
                  escrever testes unitários <em className="x">×7</em>
                </span>
                <span className="task-actions">
                  <button className="btn-adiar">adiar</button>
                  <button
                    className="btn-desistir-task"
                    title="desistir desta tarefa"
                  >
                    🏳️
                  </button>
                </span>
              </li>
              <li className="task">
                <span className="checkbox"></span>
                <span className="task-name">
                  corrigir bug do login <em className="x">×1</em>
                </span>
                <span className="task-actions">
                  <button className="btn-adiar">adiar</button>
                  <button
                    className="btn-desistir-task"
                    title="desistir desta tarefa"
                  >
                    🏳️
                  </button>
                </span>
              </li>
              <li className="task">
                <span className="checkbox"></span>
                <span className="task-name">
                  deploy em produção <span className="task-dash">—</span>
                </span>
                <span className="task-actions">
                  <button className="btn-adiar">adiar</button>
                  <button
                    className="btn-desistir-task"
                    title="desistir desta tarefa"
                  >
                    🏳️
                  </button>
                </span>
              </li>
            </ul>
            <button className="btn-nova">+ nova tarefa</button>
            <button className="btn-desistir">🏳️ desistir</button>
          </section>
          <section className="card warn-card">
            <h3>CHEWIE ESTÁ BRAVO! 🔥</h3>
            <p>
              Se você adiar mais uma vez, ele vai escrever groséia no seu README
              e apagar o último commit.
            </p>
          </section>
        </aside>
      </div>
      {news && <BreakingNews message={news} />}
    </>
  );
}

export default App;
