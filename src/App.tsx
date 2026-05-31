import React, { useState, useEffect, useCallback, useRef } from "react";
import { CHEWIE_IMGS } from "./assets/images";

/* ═══════════════════════════════════════════════════════
   TIPOS
═══════════════════════════════════════════════════════ */
interface Task {
  id: number;
  text: string;
  done: boolean;
  defers: number;
  startAt?: string;   // ISO datetime string
  endAt?: string;     // ISO datetime string
  eaten?: boolean;    // comida pelo Chewie ao estourar o prazo
}

interface Bars {
  commits: number;
  procrast: number;
  humor: number;
}

interface MoodData {
  key: string;
  img: string;
  label: string;
  accent: string;
  speech: string;
  author: string;
  badge: { text: string; danger: boolean };
  bgGrad: string;
  glitch?: boolean;
}

interface ChaosModalProps {
  taskText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface TvScreenProps {
  mood: MoodData;
  animShake: boolean;
  lives: number;
}

interface BarRowProps {
  label: string;
  value: number;
  barColor: string;
  glowColor: string;
  textColor: string;
}

interface LivesDisplayProps {
  lives: number;
  maxLives: number;
}

interface PetCardProps {
  mood: MoodData;
  bars: Bars;
  animShake: boolean;
  lives: number;
}

interface TaskCardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onComplete: (id?: number) => void;
  onRequestDefer: (id: number, text: string) => void;
  onAbandon: () => void;
}

interface DeferredTableProps {
  tasks: Task[];
}

interface WarnCardProps {
  moodKey: string;
  lives: number;
}

interface BreakingNewsProps {
  message: string;
  onClose: () => void;
}

interface BackgroundProps {
  mood: MoodData;
}

interface AiNudgeProps {
  message: string;
  loading: boolean;
  onClose: () => void;
}

interface DeathScreenProps {
  onRevive: () => void;
}

interface DeadlineAlertProps {
  task: Task;
  onClose: () => void;
}

interface RecycleBinProps {
  tasks: Task[];
  onRestore: (id: number) => void;
  onCompleteEaten: (id: number) => void;
}

/* ═══════════════════════════════════════════════════════
   CSS GLOBAL
═══════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg0: #060411;
    --bg1: #0e0720;
    --glass: rgba(22, 11, 44, 0.65);
    --border: rgba(155, 80, 255, 0.22);
    --purple: #9b50ff;
    --purple-l: #c49aff;
    --magenta: #e040fb;
    --green: #1fffa8;
    --orange: #ff7c3d;
    --red: #ff3d6b;
    --text: #ddd0f8;
    --dim: #8878aa;
    --accent: #9b50ff;
  }

  body {
    font-family: 'Syne', sans-serif;
    background: var(--bg0);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root { min-height: 100vh; }
  button { font-family: inherit; cursor: pointer; }
  input  { font-family: inherit; }

  ::-webkit-scrollbar       { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg1); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  @keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(-16px, 20px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-7px) rotate(-1deg); }
    40%       { transform: translateX(7px) rotate(1deg); }
    60%       { transform: translateX(-5px); }
    80%       { transform: translateX(5px); }
  }
  @keyframes newsIn {
    from { opacity: 0; transform: translateX(130px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes glitch {
    0%   { clip-path: inset(0 0 95% 0);   transform: translate(-4px, 0); }
    10%  { clip-path: inset(20% 0 60% 0); transform: translate(4px, 0);  }
    20%  { clip-path: inset(50% 0 30% 0); transform: translate(-2px, 0); }
    30%  { clip-path: inset(80% 0 5% 0);  transform: translate(2px, 0);  }
    40%  { clip-path: inset(10% 0 80% 0); transform: translate(-4px, 0); }
    50%  { clip-path: inset(60% 0 20% 0); transform: translate(4px, 0);  }
    60%  { clip-path: inset(0 0 40% 0);   transform: translate(-2px, 0); }
    70%  { clip-path: inset(40% 0 55% 0); transform: translate(2px, 0);  }
    100% { clip-path: inset(0 0 0 0);     transform: translate(0, 0);    }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.88) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes nudgeIn {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes heartLose {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.5); filter: brightness(2); }
    60%  { transform: scale(0.6); opacity: 0.3; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes heartGain {
    0%   { transform: scale(0.5); opacity: 0; }
    60%  { transform: scale(1.3); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes deathIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes deathText {
    0%   { opacity: 0; transform: scale(0.7) translateY(30px); }
    60%  { transform: scale(1.05) translateY(-4px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes reviveBtn {
    0%, 100% { box-shadow: 0 0 20px rgba(31,255,168,0.4); }
    50%       { box-shadow: 0 0 40px rgba(31,255,168,0.9), 0 0 80px rgba(31,255,168,0.3); }
  }

  @keyframes deadlineIn {
    from { opacity: 0; transform: translateX(-120px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes progressBar {
    from { width: 100%; }
  }
  @keyframes eatTask {
    0%   { transform: scale(1) rotate(0deg); opacity: 1; }
    40%  { transform: scale(1.15) rotate(-3deg); opacity: 1; }
    100% { transform: scale(0) rotate(20deg); opacity: 0; }
  }

  @media (max-width: 800px) {
    .main-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .task-item    { flex-wrap: wrap; }
    .task-actions { width: 100%; justify-content: flex-end; margin-top: 6px; }
  }
`;

/* ═══════════════════════════════════════════════════════
   CONSTANTES DE JOGO
═══════════════════════════════════════════════════════ */
const MAX_LIVES = 7;

// perde vida: desistir de tarefa, adiar 5+ vezes a mesma tarefa, procrastinação ≥ 90
// ganha vida: concluir 3 tarefas seguidas (combo) — escolhido por ser orgânico e positivo
const LIFE_LOSS_EVENTS = {
  abandon: {
    lives: -1,
    msgs: [
      "Você desistiu de uma tarefa. Chewie perdeu uma vida e arquivou o episódio nos anais da preguiça. 💔",
      "Tarefa abandonada com sucesso! Chewie perdeu uma vida. O commit pode esperar mais uma eternidade. 💔",
      "Desistência registrada. Chewie perdeu uma vida. Pelo menos você foi consistente no fracasso. 💔",
      "Chewie perdeu uma vida. Em compensação, você ganhou tempo livre que certamente vai usar bem. Certamente. 💔",
      "Missão abortada. Chewie perdeu uma vida. A tarefa foi para o cemitério do backlog, descanse em paz. 💔",
    ],
  },
  deferSpree: {
    lives: -1,
    msgs: [
      "Essa tarefa já foi adiada 5 vezes. Chewie perdeu uma vida. Ela tem mais deferrals do que commits no seu repo. 💔",
      "5 adiamentos na mesma tarefa. Chewie perdeu uma vida. Parabéns, você criou uma tarefa imortal. 💔",
      "Chewie perdeu uma vida. Essa tarefa foi adiada tantas vezes que já tem saudade de quando era urgente. 💔",
      "Recorde pessoal: 5 adiamentos. Chewie perdeu uma vida. A tarefa agora faz parte da família. 💔",
      "Chewie perdeu uma vida. Ao ritmo que vai, essa tarefa vai ser concluída pela geração seguinte. 💔",
    ],
  },
  procrastPeak: {
    lives: -1,
    msgs: [
      "Procrastinação em 90%. Chewie perdeu uma vida. Tecnicamente você está trabalhando — em evitar trabalho. 💔",
      "Nível crítico de procrastinação atingido. Chewie perdeu uma vida. É quase uma habilidade, na verdade. 💔",
      "90% de procrastinação. Chewie perdeu uma vida. Você transformou a inação em arte contemporânea. 💔",
      "Chewie perdeu uma vida. Com esse nível de procrastinação, você devia estar recebendo por isso. 💔",
      "Alerta máximo de procrastinação. Chewie perdeu uma vida. O burnout agradece o descanso preventivo. 💔",
    ],
  },
};
const LIFE_GAIN_EVENTS = {
  combo3: {
    lives: 1,
    msgs: [
      "3 tarefas seguidas! Chewie ganhou uma vida. Isso foi tão inesperado que ele ficou confuso. 💚",
      "Combo x3! Chewie ganhou uma vida. Por favor, não acostume — a procrastinação tem sentimentos. 💚",
      "Chewie ganhou uma vida! Você concluiu 3 tarefas seguidas. Procure um médico, isso não é normal. 💚",
      "3 de uma vez! Chewie ganhou uma vida. O Gemini Procrastinus está em choque. 💚",
      "Vida recuperada! Chewie agradece. Mas não exagera, tá? Produtividade demais faz mal. 💚",
    ],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ═══════════════════════════════════════════════════════
   LÓGICA DE HUMOR
═══════════════════════════════════════════════════════ */
function getMoodData(commits: number, procrast: number, humor: number): MoodData {
  if (procrast >= 95 && commits <= 10) return {
    key: "tamagotchi_quebrado",
    img: "tamagotchi_quebrado",
    label: "SYSTEM ERROR 💀",
    accent: "#ff3d6b",
    speech: '"VOCÊ QUEBROU O TAMAGOTCHI. PARABÉNS."',
    author: "— Chewie, em erro fatal",
    badge: { text: "GAME OVER", danger: true },
    bgGrad: "radial-gradient(900px at 70% -10%, #4a0010 0%, transparent 60%)",
    glitch: true,
  };
  if (procrast >= 80 || (humor <= 15 && commits <= 20)) return {
    key: "fora_de_controle",
    img: "fora_de_controle",
    label: "MODO FLERKEN TOTAL 🐙",
    accent: "#e040fb",
    speech: '"TENTÁCULOS LIBERADOS. Seu README agora é meu. 💀"',
    author: "— Chewie, flerken em fúria interdimensional",
    badge: { text: "🐙 CAOS", danger: true },
    bgGrad: "radial-gradient(900px at 70% -10%, #4a0f55 0%, transparent 60%)",
  };
  if (procrast >= 65 || humor <= 30) return {
    key: "irritado",
    img: "irritado",
    label: "CHEWIE ESTÁ IRRITADO 😾",
    accent: "#ff3d6b",
    speech: '"VOCÊ ADIOU DE NOVO?! O próximo commit eu apago. 🔪"',
    author: "— Chewie, rosnando muito",
    badge: { text: "COMMIT JÁ!", danger: true },
    bgGrad: "radial-gradient(900px at 70% -10%, #5a0820 0%, transparent 60%)",
  };
  if (procrast >= 45 || humor <= 55) return {
    key: "ficando_bravo",
    img: "ficando_bravo",
    label: "ficando bravo... 😠",
    accent: "#ff7c3d",
    speech: '"Eu estou de olho em você. Uma tarefa a mais adiada e eu ajo."',
    author: "— Chewie, com a paciência no limite",
    badge: { text: "CUIDADO!", danger: false },
    bgGrad: "radial-gradient(900px at 70% -10%, #5a2810 0%, transparent 60%)",
  };
  if (humor >= 80 && commits >= 70) return {
    key: "happy",
    img: "happy",
    label: "Chewie está FELIZ! 😻💕",
    accent: "#1fffa8",
    speech: '"Você está indo muito bem! Continue assim! 💕"',
    author: "— Chewie, purring intensely",
    badge: { text: "MVP!", danger: false },
    bgGrad: "radial-gradient(900px at 70% -10%, #0a3a28 0%, transparent 60%)",
  };
  return {
    key: "calmo",
    img: "calmo",
    label: "procrastinando tranquilamente 🙃",
    accent: "#9b50ff",
    speech: '"Você tem 3 tarefas urgentes. Estou ignorando todas com maestria."',
    author: "— Chewie, flerken da espécie procrastinus",
    badge: { text: "GIT COMMIT", danger: false },
    bgGrad: "radial-gradient(900px at 70% -10%, #3a1566 0%, transparent 60%)",
  };
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

/* ═══════════════════════════════════════════════════════
   DADOS ESTÁTICOS
═══════════════════════════════════════════════════════ */
const NEWS_POOL = [
  "Tarefa adiada. Chewie anotou. O README vai ficar por enquanto com aquela seção TODO vazia mesmo. 🗒️",
  "Mais um adiamento registrado. Chewie já está preparando o discurso de 'eu ia fazer mas...' pra você. 🎤",
  "Adiado com maestria. A tarefa agora mora no limbo entre 'vou fazer amanhã' e 'o que era isso mesmo?'. 🌫️",
  "Adiamento confirmado. Chewie acrescentou mais uma camada ao seu portfólio de intenções não cumpridas. 🖼️",
  "Mais um dia, mais um adiamento. Chewie está orgulhoso — do jeito errado. 😾",
  "Tarefa sobreviveu mais um dia sem ser feita. Chewie está registrando no changelog do caos. 📋",
  "Adiado. A tarefa tentou um pull request, mas você deu reject sem revisar. Clássico. 🔄",
  "Chewie viu o adiamento. Não disse nada. Só suspirou e voltou a olhar pela janela. 🪟",
];

const DEADLINE_WARNING_MSGS = [
  "Faltam {min} minutos. Chewie está olhando com julgamento silencioso. 👀",
  "{min} minutos. Aquela tarefa não vai se fazer sozinha. Infelizmente. ⏰",
  "Tic tac. {min} minutinhos. O deploy pode esperar, mas o Chewie não. 🐱",
  "Só {min} min. Você ainda tem tempo de procrastinar mais um pouco. Mas apenas um. ⚠️",
  "{min} minutos antes do prazo. Hora de entrar em pânico de forma produtiva. 🔥",
];

const DEADLINE_EATEN_MSGS = [
  "Chewie comeu a tarefa '{task}'. Era muito apetitosa para ser entregue no prazo. 😾🍽️",
  "'{task}' estourou o prazo. Chewie devorou com sal e limão. Chewie perdeu uma vida de vergonha. 💔",
  "Prazo expirado. Chewie engoliu '{task}' inteira. Foi pra caixinha de reciclagem. 🗑️",
  "'{task}' foi deletada da existência por Chewie. Há esperança na reciclagem. Talvez. 🐙",
  "RIP '{task}'. Prazo: não cumprido. Causa mortis: procrastinação avançada. Chewie atesta. 💔",
];

const RECYCLED_COMPLETE_MSGS = [
  "Tarefa reciclada e concluída! Chewie está emocionado. Isso era inesperado. 💚😻",
  "Ressurreição completa! '{task}' voltou da morte e foi entregue. Chewie aprova. 💚",
  "Você concluiu uma tarefa que o Chewie tinha comido. Ele não sabe se chora ou ronrona. 💚",
  "'{task}' saiu da reciclagem direto pra feita. Chewie está confuso mas feliz. 💚",
];

const PROCRASTINATOR_TITLES = [
  "🏆 Hall da Vergonha — Campeões do Não Fazer",
  "📋 Tarefas que Você Prometeu Fazer Amanhã (desde 2019)",
  "🪦 Cemitério das Intenções — R.I.P. Produtividade",
  "🐢 Olimpíadas do Adiamento — Você Ganhou Ouro",
  "🤡 Sua Obra-Prima da Procrastinação",
];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Converte um Date para string no formato datetime-local (YYYY-MM-DDTHH:mm)
 * usando a hora LOCAL do dispositivo — compatível com o input datetime-local do HTML.
 */
function toLocalInputString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Retorna a hora atual + mins no formato datetime-local local.
 */
function nowPlusMins(mins: number): string {
  return toLocalInputString(new Date(Date.now() + mins * 60_000));
}

/**
 * Formata uma string datetime-local (YYYY-MM-DDTHH:mm) para exibição no padrão brasileiro.
 * Parseia manualmente para não depender de interpretação de fuso do browser.
 * Exibe: DD/MM HH:mm
 */
function fmtDatetime(iso: string): string {
  if (!iso) return "";
  const [datePart, timePart] = iso.split("T");
  if (!datePart || !timePart) return iso;
  const [, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");
  return `${day}/${month} ${hour}:${minute}`;
}

/**
 * Retorna os minutos restantes até o deadline (negativo = prazo estourado).
 * O input datetime-local (YYYY-MM-DDTHH:mm) é interpretado como hora local
 * pelo browser, e Date.now() retorna ms UTC — ambos são comparáveis diretamente.
 */
function minsUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
}

/**
 * Retorna os ms absolutos de uma string datetime-local.
 * Usado para calcular progresso da barra de tempo.
 */
function localIsoToMs(iso: string): number {
  return new Date(iso).getTime();
}


const INITIAL_TASKS: Task[] = [
  { id: 1, text: "fazer o README do projeto",  done: true,  defers: 0 },
  { id: 2, text: "revisar o pull request",      done: false, defers: 3, startAt: nowPlusMins(-30), endAt: nowPlusMins(20) },
  { id: 3, text: "escrever testes unitários",   done: false, defers: 7 },
  { id: 4, text: "corrigir bug do login",       done: false, defers: 1, startAt: nowPlusMins(0), endAt: nowPlusMins(90) },
  { id: 5, text: "deploy em produção",          done: false, defers: 0 },
];

/* ═══════════════════════════════════════════════════════
   COMPONENTES
═══════════════════════════════════════════════════════ */

/* ─── Tela de morte ─── */
function DeathScreen({ onRevive }: DeathScreenProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(4,2,12,0.97)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "deathIn 0.6s ease",
      padding: 24, overflowY: "auto",
    }}>
      {/* scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 6px)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
        maxWidth: 520, width: "100%", textAlign: "center",
        animation: "deathText 0.7s cubic-bezier(.34,1.2,.64,1) 0.2s both",
      }}>
        {/* vidas vazias */}
        <div style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span key={i} style={{ fontSize: 22, opacity: 0.2, filter: "grayscale(1)" }}>🖤</span>
          ))}
        </div>

        {/* imagem da tela quebrada estilo TV CRT */}
        <div style={{
          position: "relative", width: "min(320px, 80vw)", aspectRatio: "1/1",
          borderRadius: 8, overflow: "hidden",
          border: "3px solid #ff3d6b",
          boxShadow: "0 0 0 4px #222, 0 0 0 8px #1a1a1a, 0 0 50px rgba(255,61,107,0.6)",
        }}>
          {/* scanlines estáticas */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
          }} />
          {/* vignette */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)",
          }} />
          <img
            src={CHEWIE_IMGS["tamagotchi_quebrado"]}
            alt="Chewie morreu"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        <div style={{
          fontFamily: "'Press Start 2P',monospace",
          fontSize: "clamp(20px,4.5vw,34px)",
          color: "#ff3d6b",
          textShadow: "0 0 30px rgba(255,61,107,0.8), 0 0 60px rgba(255,61,107,0.4)",
          lineHeight: 1.5,
          animation: "glitch 1.2s steps(1) infinite",
        }}>
          CHEWIE<br />MORREU.
        </div>

        <p style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: "clamp(12px,2.5vw,14px)",
          color: "var(--dim)", lineHeight: 2,
        }}>
          7 vidas.<br />
          Você gastou todas.<br />
          <span style={{ color: "#ff7c3d" }}>Isso é impressionante.</span><br />
          No pior sentido.
        </p>

        <div style={{
          border: "1px solid rgba(31,255,168,0.3)", borderRadius: 16,
          padding: "18px 22px", background: "rgba(31,255,168,0.05)", textAlign: "left",
          width: "100%",
        }}>
          <p style={{ fontSize: 11, color: "var(--dim)", marginBottom: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
            PARA REVIVER CHEWIE:
          </p>
          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.8 }}>
            Conclua <strong style={{ color: "var(--green)" }}>3 tarefas seguidas</strong> sem adiar nenhuma.<br />
            Cada combo de 3 devolve uma vida.<br />
            <em style={{ color: "var(--dim)", fontSize: 11 }}>Sim, você vai ter que trabalhar de verdade.</em>
          </p>
        </div>

        <button
          onClick={onRevive}
          style={{
            fontFamily: "'Press Start 2P',monospace",
            fontSize: "clamp(11px,2vw,14px)",
            padding: "18px 36px", borderRadius: 14,
            border: "2px solid var(--green)",
            background: "rgba(31,255,168,0.1)",
            color: "var(--green)",
            animation: "reviveBtn 2s ease-in-out infinite",
            cursor: "pointer",
          }}
        >
          ▶ NOVA PARTIDA
        </button>

        <p style={{ fontSize: 10, color: "#ff3d6b", fontFamily: "'JetBrains Mono',monospace", opacity: 0.7 }}>
          (reseta barras e tarefas — você vai precisar)
        </p>
      </div>
    </div>
  );
}

/* ─── Vidas (corações) ─── */
function LivesDisplay({ lives, maxLives }: LivesDisplayProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        fontSize: 10, color: "var(--dim)",
        fontFamily: "'JetBrains Mono',monospace",
        letterSpacing: 2, marginRight: 2,
      }}>VIDAS</span>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: maxLives }).map((_, i) => {
          const active = i < lives;
          const isLast = active && lives === 1;
          return (
            <span
              key={i}
              style={{
                fontSize: 18,
                filter: active ? "none" : "grayscale(1)",
                opacity: active ? 1 : 0.2,
                animation: isLast ? "blink 0.8s ease-in-out infinite" : undefined,
                transition: "opacity 0.4s, filter 0.4s",
              }}
            >
              {active ? "❤️" : "🖤"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Modal caos (confirmação de adiamento) ─── */
function ChaosModal({ taskText, onConfirm, onCancel }: ChaosModalProps) {
  const lines = [
    "sério mesmo?",
    "você quer ADIAR isso?",
    `"${taskText}" vai ficar esperando MAIS?`,
    "Chewie está julgando você agora.",
    "de verdade. olha pra ele.",
    "...tá, mas não diga que eu não avisei. 🐙",
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(6,4,17,0.88)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, animation: "overlayIn 0.2s ease",
    }}>
      <div style={{
        background: "#0e0720", border: "2px solid #ff3d6b",
        borderRadius: 20, padding: "32px 28px", maxWidth: 420, width: "100%",
        boxShadow: "0 0 60px rgba(255,61,107,0.4)",
        animation: "modalIn 0.3s cubic-bezier(.34,1.56,.64,1)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>😾</div>
        <h2 style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(11px,2vw,14px)",
          color: "#ff3d6b", marginBottom: 20, lineHeight: 1.8,
          textShadow: "0 0 16px rgba(255,61,107,0.7)",
        }}>TEM CERTEZA DISSO?</h2>

        <div style={{
          background: "rgba(255,61,107,0.07)",
          border: "1px solid rgba(255,61,107,0.25)",
          borderRadius: 12, padding: "16px 18px", marginBottom: 24,
          textAlign: "left",
        }}>
          {lines.map((line, i) => (
            <p key={i} style={{
              fontSize:     i === 2 ? 13 : i === 5 ? 14 : 12,
              color:        i === 2 ? "#f0c0ff" : i === 5 ? "#ff7c3d" : "var(--text)",
              marginBottom: i < lines.length - 1 ? 8 : 0,
              fontStyle:    i === 2 ? "italic" : "normal",
              fontWeight:   i === 5 ? 700 : 400,
              lineHeight:   1.5,
            }}>{line}</p>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "14px 0", borderRadius: 12,
            border: "1px solid var(--border)",
            background: "rgba(31,255,168,0.1)",
            color: "var(--green)", fontSize: 14, fontWeight: 700,
          }}>
            🏃 FUGIR (voltar atrás)
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "14px 0", borderRadius: 12,
            border: "1px solid rgba(255,61,107,0.5)",
            background: "rgba(255,61,107,0.12)",
            color: "#ff7c7c", fontSize: 14, fontWeight: 700,
          }}>
            😤 SIM, ADIO MESMO
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tela TV CRT ─── */
function TvScreen({ mood, animShake, lives }: TvScreenProps) {
  const isDying = lives <= 2;
  return (
    <div style={{
      position: "relative", background: "#111",
      borderRadius: 8, overflow: "hidden", aspectRatio: "1/1", width: "100%",
      boxShadow: `inset 0 0 30px rgba(0,0,0,0.8), 0 0 0 4px #222, 0 0 0 8px #1a1a1a, 0 0 40px ${mood.accent}55`,
      animation: animShake ? "shake 0.4s ease" : undefined,
      border: `3px solid ${isDying ? "#ff3d6b" : mood.accent}`,
      transition: "border-color 0.5s, box-shadow 0.5s",
    }}>
      {/* scanlines estáticas */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      }} />
      {/* scanline animada */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 80, zIndex: 4,
        background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.025), transparent)",
        animation: "scanline 5s linear infinite", pointerEvents: "none",
      }} />
      {/* vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)",
      }} />

      <img
        src={CHEWIE_IMGS[mood.img]}
        alt={mood.label}
        style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
          filter: mood.glitch
            ? "contrast(1.4) saturate(0) brightness(0.7)"
            : isDying
              ? "saturate(0.4) brightness(0.8)"
              : "none",
          transition: "filter 0.5s",
        }}
      />

      {mood.glitch && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 5,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "clamp(14px,3.5vw,22px)",
            color: "#1fffa8",
            textShadow: "0 0 20px #1fffa8, 3px 0 #ff3d6b, -3px 0 #3dbbff",
            lineHeight: 1.6, textAlign: "center",
            animation: "glitch 0.8s steps(1) infinite",
            padding: "0 16px",
          }}>
            SYSTEM ERROR.<br />TAMAGOTCHI<br />DAMAGED.
          </div>
        </div>
      )}

      {/* aviso de vida baixa */}
      {isDying && !mood.glitch && (
        <div style={{
          position: "absolute", top: 10, left: 10, zIndex: 6,
          background: "rgba(255,61,107,0.85)",
          fontFamily: "'Press Start 2P',monospace",
          fontSize: 8, color: "#fff", padding: "4px 8px", borderRadius: 5,
          animation: "blink 0.7s ease-in-out infinite",
        }}>
          {lives === 1 ? "⚠ ÚLTIMA VIDA" : "⚠ VIDA BAIXA"}
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 10, right: 10, zIndex: 6,
        background: mood.badge.danger ? "var(--red)" : "var(--green)",
        color:      mood.badge.danger ? "#fff" : "#04231a",
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
        padding: "5px 8px", borderRadius: 5,
        boxShadow: mood.badge.danger
          ? "0 0 12px rgba(255,61,107,0.8)"
          : "0 0 12px rgba(31,255,168,0.7)",
      }}>{mood.badge.text}</div>
    </div>
  );
}

/* ─── Barra de progresso ─── */
function BarRow({ label, value, barColor, glowColor, textColor }: BarRowProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 42px", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 10, color: "var(--dim)", textAlign: "right", letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace" }}>
        {label}
      </span>
      <div style={{
        height: 9, borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          height: "100%", width: `${value}%`, borderRadius: 999,
          background: barColor,
          boxShadow: `0 0 10px ${glowColor}`,
          transition: "width 0.7s cubic-bezier(.34,1.56,.64,1)",
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: textColor, fontFamily: "'JetBrains Mono',monospace" }}>
        {value}%
      </span>
    </div>
  );
}

/* ─── Card do pet ─── */
function PetCard({ mood, bars, animShake, lives }: PetCardProps) {
  return (
    <section style={{
      position: "relative",
      background: "var(--glass)", border: "1px solid var(--border)",
      borderRadius: 22, padding: "clamp(16px,3vw,26px)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 20px 56px rgba(0,0,0,0.5)",
    }}>
      {/* borda gradiente decorativa */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 22, pointerEvents: "none",
        background: `linear-gradient(130deg, ${mood.accent}33, transparent 50%, rgba(224,64,251,0.2))`,
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor", maskComposite: "exclude", padding: 1,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ color: "var(--dim)", letterSpacing: 5, fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>
          SEU PET FLERKEN
        </p>
        <LivesDisplay lives={lives} maxLives={MAX_LIVES} />
      </div>

      <TvScreen mood={mood} animShake={animShake} lives={lives} />

      <div style={{ textAlign: "center", margin: "16px 0 14px" }}>
        <p style={{ color: "var(--dim)", letterSpacing: 3, fontSize: 10, marginBottom: 4, fontFamily: "'JetBrains Mono',monospace" }}>
          HUMOR ATUAL
        </p>
        <p style={{
          fontSize: "clamp(14px,2.5vw,18px)", fontWeight: 800,
          color: mood.accent,
          textShadow: `0 0 16px ${mood.accent}88`,
          transition: "color 0.4s, text-shadow 0.4s",
          lineHeight: 1.3,
        }}>{mood.label}</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <BarRow label="COMMITS"     value={bars.commits}  barColor="linear-gradient(90deg,#14d68a,#1fffa8)"               glowColor="#1fffa8"        textColor="var(--green)"    />
        <BarRow label="PROCRASTIN." value={bars.procrast}  barColor="linear-gradient(90deg,#ff6a2b,#ff7c3d)"              glowColor="#ff7c3d"        textColor="var(--orange)"   />
        <BarRow label="HUMOR"       value={bars.humor}     barColor="linear-gradient(90deg,var(--purple),var(--magenta))" glowColor="var(--purple)"  textColor="var(--purple-l)" />
      </div>

      <blockquote style={{
        border: "1px solid var(--border)", borderRadius: 12,
        padding: "14px 16px", background: "rgba(155,80,255,0.07)",
        textAlign: "left",
      }}>
        <p style={{ fontStyle: "italic", color: "#f0e4ff", marginBottom: 5, lineHeight: 1.55, fontSize: 13 }}>
          {mood.speech}
        </p>
        <p style={{ color: "var(--purple-l)", fontSize: 11 }}>{mood.author}</p>
      </blockquote>
    </section>
  );
}

/* ─── Card de tarefas ─── */

/** Aplica máscara DD/MM/AAAA enquanto o usuário digita */
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Aplica máscara HH:MM enquanto o usuário digita */
function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/**
 * Converte "DD/MM/AAAA" + "HH:MM" para "YYYY-MM-DDTHH:mm" (armazenamento interno).
 * Retorna undefined se inválido.
 */
function parseBrDatetime(date: string, time: string): string | undefined {
  const dateParts = date.split("/");
  if (dateParts.length !== 3) return undefined;
  const [dd, mm, yyyy] = dateParts;
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return undefined;
  if (!time.match(/^\d{2}:\d{2}$/)) return undefined;
  const iso = `${yyyy}-${mm}-${dd}T${time}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;
  return iso;
}

function TaskCard({ tasks, setTasks, onComplete, onRequestDefer, onAbandon }: TaskCardProps) {
  const [newText, setNewText]       = useState("");
  const [newEndDate, setNewEndDate] = useState(""); // DD/MM/AAAA (exibição)
  const [newEndTime, setNewEndTime] = useState(""); // HH:MM       (exibição)
  const [expanded, setExpanded]     = useState(false);

  // re-render a cada 30s para atualizar contadores de tempo restante
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const pending = tasks.filter(t => !t.done && !t.eaten).length;

  const handleAdd = useCallback(() => {
    if (!newText.trim()) return;
    const endAt = parseBrDatetime(newEndDate, newEndTime);
    setTasks(prev => [...prev, {
      id:      Date.now(),
      text:    newText.trim(),
      done:    false,
      defers:  0,
      startAt: toLocalInputString(new Date()),
      endAt,
    }]);
    setNewText("");
    setNewEndDate("");
    setNewEndTime("");
    setExpanded(false);
  }, [newText, newEndDate, newEndTime, setTasks]);

  const handleComplete = useCallback((id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
    onComplete(id);
  }, [setTasks, onComplete]);

  const handleAbandon = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    onAbandon();
  }, [setTasks, onAbandon]);

  const activeTasks = tasks.filter(t => !t.done && !t.eaten);

  return (
    <section style={{
      background: "var(--glass)", border: "1px solid var(--border)",
      borderRadius: 22, padding: "clamp(16px,3vw,24px)",
      backdropFilter: "blur(18px)",
      boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
    }}>
      {/* cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{
          fontFamily: "'Press Start 2P',monospace",
          fontSize: "clamp(10px,2vw,13px)", fontWeight: 700, color: "#fff",
        }}>tarefas</h2>
        <span style={{
          border: "1px solid var(--border)", borderRadius: 999,
          padding: "4px 12px", fontSize: 11,
          background: "var(--glass)", color: "var(--purple-l)",
          fontFamily: "'JetBrains Mono',monospace",
        }}>{pending} pendentes</span>
      </div>

      {/* lista */}
      <ul style={{ listStyle: "none", marginBottom: 12 }}>
        {activeTasks.map(task => {
          const hasDeadline = !!task.endAt;
          const nowMs       = Date.now();
          const minsLeft    = hasDeadline
            ? Math.round((new Date(task.endAt!).getTime() - nowMs) / 60_000)
            : null;
          const isUrgent    = minsLeft !== null && minsLeft <= 15 && minsLeft > 0;
          const isOverdue   = minsLeft !== null && minsLeft <= 0;

          const startMs = task.startAt ? localIsoToMs(task.startAt) : nowMs;
          const endMs   = hasDeadline  ? localIsoToMs(task.endAt!)  : 0;
          const totalMs = endMs - startMs;
          const pct     = totalMs > 0
            ? Math.min(100, Math.max(0, ((nowMs - startMs) / totalMs) * 100))
            : 0;

          return (
            <li key={task.id} className="task-item" style={{
              display: "flex", flexDirection: "column",
              padding: "10px 8px", marginInline: -8,
              borderBottom: "1px solid rgba(155,80,255,0.1)",
              borderRadius: 10, transition: "background 0.2s",
              background: isUrgent
                ? "rgba(255,124,61,0.06)"
                : isOverdue
                  ? "rgba(255,61,107,0.08)"
                  : "transparent",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => handleComplete(task.id)}
                  aria-label="concluir tarefa"
                  style={{
                    flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                    cursor: "pointer", border: "2px solid var(--border)",
                    background: "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                />
                <span style={{
                  flex: 1, fontSize: 13, lineHeight: 1.4, wordBreak: "break-word",
                  color: isOverdue ? "var(--red)" : isUrgent ? "var(--orange)" : "var(--text)",
                }}>
                  {task.text}
                  {task.defers > 0 && (
                    <em style={{ color: "var(--magenta)", fontStyle: "normal", fontWeight: 700, fontSize: 11, marginLeft: 5 }}>
                      ×{task.defers}
                    </em>
                  )}
                </span>
                <div className="task-actions" style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => onRequestDefer(task.id, task.text)}
                    style={{
                      border: "1px solid var(--border)", background: "transparent",
                      color: "var(--text)", padding: "7px 12px", borderRadius: 9, fontSize: 12,
                    }}
                  >adiar</button>
                  <button
                    onClick={() => handleAbandon(task.id)}
                    aria-label="desistir desta tarefa"
                    style={{
                      width: 34, height: 34, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid rgba(255,61,107,0.3)",
                      borderRadius: 9, background: "rgba(255,61,107,0.07)",
                      color: "var(--red)", fontSize: 13,
                    }}
                  >🏳️</button>
                </div>
              </div>

              {/* deadline info — renderiza imediatamente após cadastro */}
              {hasDeadline && (
                <div style={{ marginTop: 6, marginLeft: 32, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    flexWrap: "wrap",
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
                  }}>
                    {task.startAt && (
                      <span style={{ color: "var(--dim)" }}>▶ {fmtDatetime(task.startAt)}</span>
                    )}
                    <span style={{
                      color: isOverdue ? "var(--red)" : isUrgent ? "var(--orange)" : "var(--purple-l)",
                      fontWeight: 600,
                      animation: isUrgent || isOverdue ? "blink 0.9s ease-in-out infinite" : undefined,
                    }}>
                      ⏰ {fmtDatetime(task.endAt!)}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      color: isOverdue ? "var(--red)" : isUrgent ? "var(--orange)" : "var(--dim)",
                      animation: isUrgent || isOverdue ? "blink 0.9s ease-in-out infinite" : undefined,
                    }}>
                      {isOverdue
                        ? `⚠ ${Math.abs(minsLeft!)}min atrasada`
                        : `${minsLeft}min restantes`}
                    </span>
                  </div>
                  {!isOverdue && totalMs > 0 && (
                    <div style={{
                      height: 4, borderRadius: 999,
                      background: "rgba(255,255,255,0.06)", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, borderRadius: 999,
                        background: isUrgent
                          ? "linear-gradient(90deg,#ff6a2b,#ff3d6b)"
                          : "linear-gradient(90deg,var(--purple),var(--magenta))",
                      }} />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* form de nova tarefa */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !expanded && handleAdd()}
            placeholder="nova tarefa..."
            style={{
              flex: 1, background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)", borderRadius: 10,
              padding: "11px 13px", color: "var(--text)", fontSize: 13, outline: "none",
            }}
          />
          <button
            onClick={() => setExpanded(p => !p)}
            title={expanded ? "Ocultar prazo" : "Definir prazo"}
            aria-label="definir prazo"
            style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              border: `1px solid ${expanded ? "var(--purple)" : "var(--border)"}`,
              background: expanded ? "rgba(155,80,255,0.25)" : "rgba(255,255,255,0.04)",
              color: "var(--purple-l)", fontSize: 16,
            }}
          >⏰</button>
          <button
            onClick={handleAdd}
            aria-label="adicionar tarefa"
            style={{
              padding: "11px 16px", borderRadius: 10,
              border: "1px solid var(--border)",
              background: "rgba(155,80,255,0.15)",
              color: "var(--purple-l)", fontSize: 18, fontWeight: 700,
            }}
          >+</button>
        </div>

        {expanded && (
          <div style={{
            background: "rgba(155,80,255,0.06)",
            border: "1px solid var(--border)", borderRadius: 10,
            padding: "12px", display: "flex", flexDirection: "column", gap: 8,
          }}>
            <span style={{
              fontSize: 10, color: "var(--dim)",
              fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1,
            }}>
              PRAZO — DD/MM/AAAA e HH:MM (24h)
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newEndDate}
                onChange={e => setNewEndDate(maskDate(e.target.value))}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                inputMode="numeric"
                style={{
                  flex: 1, background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${newEndDate.length === 10 ? "var(--purple)" : "var(--border)"}`,
                  borderRadius: 8, padding: "10px 12px",
                  color: "var(--text)", fontSize: 13, outline: "none",
                  fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1,
                }}
              />
              <input
                value={newEndTime}
                onChange={e => setNewEndTime(maskTime(e.target.value))}
                placeholder="HH:MM"
                maxLength={5}
                inputMode="numeric"
                style={{
                  width: 100, background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${newEndTime.length === 5 ? "var(--purple)" : "var(--border)"}`,
                  borderRadius: 8, padding: "10px 12px",
                  color: "var(--text)", fontSize: 13, outline: "none",
                  fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1,
                }}
              />
            </div>

            {/* preview ao vivo */}
            {parseBrDatetime(newEndDate, newEndTime) && (() => {
              const preview = parseBrDatetime(newEndDate, newEndTime)!;
              const minsP   = Math.round((new Date(preview).getTime() - Date.now()) / 60_000);
              return (
                <span style={{
                  fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
                  color: minsP < 0 ? "var(--red)" : minsP <= 15 ? "var(--orange)" : "var(--green)",
                }}>
                  {minsP < 0
                    ? `⚠ prazo já passou (${Math.abs(minsP)}min atrás)`
                    : `✓ prazo em ${minsP}min — ${fmtDatetime(preview)}`}
                </span>
              );
            })()}

            <span style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'JetBrains Mono',monospace" }}>
              ▶ Início registrado automaticamente ao salvar
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
function DeadlineAlert({ task, onClose }: DeadlineAlertProps) {
  const mins = task.endAt ? minsUntil(task.endAt) : 0;
  const isOver = mins <= 0;
  const msg = isOver
    ? `Chewie está COMENDO '${task.text}'. Prazo estourado há ${Math.abs(mins)}min. 😾🍽️`
    : pickRandom(DEADLINE_WARNING_MSGS).replace("{min}", String(mins));

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9993,
      maxWidth: 340, width: "calc(100% - 48px)",
      background: isOver ? "#1a0008" : "#0e0720",
      border: `1px solid ${isOver ? "rgba(255,61,107,0.7)" : "rgba(255,124,61,0.6)"}`,
      borderRadius: 18, padding: "18px 20px",
      boxShadow: isOver
        ? "0 0 40px rgba(255,61,107,0.35), 0 8px 32px rgba(0,0,0,0.5)"
        : "0 0 40px rgba(255,124,61,0.25), 0 8px 32px rgba(0,0,0,0.5)",
      animation: "deadlineIn 0.4s cubic-bezier(.34,1.56,.64,1)",
      pointerEvents: "all",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 20 }}>{isOver ? "😾" : "⏰"}</span>
        <span style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 10, flex: 1,
          color: isOver ? "var(--red)" : "var(--orange)",
          letterSpacing: 2,
          animation: isOver ? "blink 0.6s ease-in-out infinite" : undefined,
        }}>
          {isOver ? "PRAZO ESTOURADO" : "PRAZO SE APROXIMANDO"}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onClose(); }}
          aria-label="fechar alerta"
          style={{
            flexShrink: 0, width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, color: "#fff", fontSize: 16, cursor: "pointer",
          }}
        >×</button>
      </div>
      <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, fontStyle: "italic" }}>
        "{msg}"
      </p>
      <p style={{ fontSize: 10, color: "var(--dim)", marginTop: 8, fontFamily: "'JetBrains Mono',monospace" }}>
        — Chewie, cronometrando sua desgraça
      </p>
    </div>
  );
}

/* ─── Caixinha de reciclagem ─── */
function RecycleBin({ tasks, onRestore, onCompleteEaten }: RecycleBinProps) {
  const eaten = tasks.filter(t => t.eaten);
  if (eaten.length === 0) return null;

  return (
    <section style={{
      background: "rgba(155,80,255,0.05)",
      border: "1px solid rgba(155,80,255,0.3)",
      borderRadius: 22, padding: "clamp(14px,3vw,22px)",
      backdropFilter: "blur(16px)",
    }}>
      <h3 style={{
        fontFamily: "'Press Start 2P',monospace",
        fontSize: "clamp(8px,1.5vw,10px)",
        color: "var(--purple-l)", marginBottom: 16, lineHeight: 1.7,
      }}>🗑️ Caixinha de Reciclagem do Chewie</h3>
      <p style={{ fontSize: 11, color: "var(--dim)", marginBottom: 14, fontFamily: "'JetBrains Mono',monospace" }}>
        Tarefas comidas por prazo estourado. Conclua para recuperar uma vida.
      </p>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {eaten.map(task => (
          <li key={task.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            background: "rgba(155,80,255,0.08)",
            border: "1px solid rgba(155,80,255,0.2)",
            borderRadius: 10,
          }}>
            <span style={{ fontSize: 16 }}>🗑️</span>
            <span style={{
              flex: 1, fontSize: 13, color: "var(--dim)",
              textDecoration: "line-through", wordBreak: "break-word",
            }}>{task.text}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => onCompleteEaten(task.id)}
                title="Concluir mesmo assim (+1 vida)"
                style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 12,
                  border: "1px solid rgba(31,255,168,0.4)",
                  background: "rgba(31,255,168,0.08)",
                  color: "var(--green)", cursor: "pointer",
                }}>✓ concluir</button>
              <button
                onClick={() => onRestore(task.id)}
                title="Restaurar tarefa"
                style={{
                  padding: "6px 10px", borderRadius: 8, fontSize: 12,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text)", cursor: "pointer",
                }}>↩ restaurar</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── Tabela de tarefas adiadas ─── */
function DeferredTable({ tasks }: DeferredTableProps) {
  const deferred = tasks
    .filter(t => !t.done && t.defers > 0)
    .sort((a, b) => b.defers - a.defers);

  if (deferred.length === 0) return null;

  const title = PROCRASTINATOR_TITLES[deferred.length % PROCRASTINATOR_TITLES.length];

  function getDeferStatus(count: number): string {
    if (count >= 7) return "🐙 ALÉM DA ESPERANÇA";
    if (count >= 5) return "🔥 CRÍTICO";
    if (count >= 3) return "⚠️ GRAVE";
    return "😐 ruim";
  }

  return (
    <section style={{
      background: "rgba(255,61,107,0.05)",
      border: "1px solid rgba(255,61,107,0.3)",
      borderRadius: 22, padding: "clamp(14px,3vw,22px)",
      backdropFilter: "blur(16px)",
    }}>
      <h3 style={{
        fontFamily: "'Press Start 2P',monospace",
        fontSize: "clamp(8px,1.5vw,10px)",
        color: "#ff7c7c", marginBottom: 16, lineHeight: 1.7,
      }}>{title}</h3>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {(["TAREFA", "ADIAMENTOS", "STATUS"] as const).map(h => (
                <th key={h} style={{
                  textAlign: "left", padding: "8px 10px",
                  color: "var(--dim)", fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 10, letterSpacing: 1,
                  borderBottom: "1px solid rgba(255,61,107,0.2)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deferred.map(task => (
              <tr key={task.id}>
                <td style={{ padding: "10px", color: "var(--text)", borderBottom: "1px solid rgba(255,255,255,0.04)", wordBreak: "break-word", maxWidth: 180 }}>
                  {task.text}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                  <span style={{
                    background: "rgba(255,61,107,0.15)", color: "#ff7c7c",
                    border: "1px solid rgba(255,61,107,0.35)",
                    borderRadius: 6, padding: "3px 8px",
                    fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 12,
                  }}>×{task.defers}</span>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{
                    fontSize: 10, color: "var(--orange)",
                    fontFamily: "'JetBrains Mono',monospace",
                    animation: task.defers >= 5 ? "blink 1s ease infinite" : undefined,
                  }}>
                    {getDeferStatus(task.defers)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─── Card de aviso ─── */
function WarnCard({ moodKey, lives }: WarnCardProps) {
  type WarnVariant = { border: string; bg: string; titleColor: string; title: string; text: string; pulse?: boolean };

  const variants: Record<string, WarnVariant> = {
    calmo:               { border: "rgba(31,255,168,0.3)",  bg: "rgba(31,255,168,0.05)",  titleColor: "var(--green)",   title: "CHEWIE ESTÁ DE BOA 😸",    text: "Continue fazendo commits e concluindo tarefas para manter o humor em alta!" },
    happy:               { border: "rgba(31,255,168,0.5)",  bg: "rgba(31,255,168,0.08)",  titleColor: "var(--green)",   title: "CHEWIE ESTÁ FELIZ! 💕",     text: "Uau, você está produtivo! Chewie está ronronando. Não estrague isso." },
    ficando_bravo:       { border: "rgba(255,124,61,0.4)",  bg: "rgba(255,124,61,0.06)",  titleColor: "var(--orange)",  title: "CHEWIE ESTÁ IRRITADO ⚠️",  text: "Ele está com raiva. Uma tarefa adiada a mais e os tentáculos aparecem." },
    irritado:            { border: "rgba(255,61,107,0.45)", bg: "rgba(255,61,107,0.07)",  titleColor: "var(--red)",     title: "CHEWIE ESTÁ BRAVO! 🔥",     text: "Se você adiar mais uma vez, ele vai escrever groséia no seu README e apagar o último commit." },
    fora_de_controle:    { border: "rgba(224,64,251,0.5)",  bg: "rgba(224,64,251,0.07)",  titleColor: "var(--magenta)", title: "🐙 MODO CAOS ATIVADO",      text: "Tentáculos liberados. Seu repositório está em risco interdimensional. CONCLUA UMA TAREFA AGORA." },
    tamagotchi_quebrado: { border: "rgba(255,61,107,0.7)",  bg: "rgba(255,61,107,0.12)",  titleColor: "#ff3d6b",        title: "💀 SISTEMA DESTRUÍDO",      text: "PARABÉNS. Você conseguiu quebrar o Chewie. Isso é impressionante no pior sentido possível.", pulse: true },
  };

  const v = variants[moodKey] ?? variants.calmo;

  return (
    <div style={{
      background: v.bg, border: `1px solid ${v.border}`,
      borderRadius: 18, padding: "20px 18px",
      animation: v.pulse ? "pulse 1.5s ease-in-out infinite" : undefined,
    }}>
      <h3 style={{ color: v.titleColor, fontSize: "clamp(11px,2vw,14px)", letterSpacing: 0.5, marginBottom: 10, fontWeight: 700 }}>
        {v.title}
      </h3>
      <p style={{ fontSize: 13, lineHeight: 1.7 }}>{v.text}</p>
      {lives <= 3 && (
        <p style={{
          marginTop: 10, fontSize: 12,
          color: lives === 1 ? "#ff3d6b" : "var(--orange)",
          fontFamily: "'JetBrains Mono',monospace",
          animation: lives === 1 ? "blink 0.8s ease-in-out infinite" : undefined,
        }}>
          ⚠ {lives === 1 ? "ÚLTIMA VIDA — conclua 3 tarefas seguidas para ganhar mais!" : `${lives} vidas restantes — conclua tarefas para recuperar!`}
        </p>
      )}
    </div>
  );
}

/* ─── Breaking News ─── */
function BreakingNews({ message, onClose }: BreakingNewsProps) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9998,
      background: "#fffbe6", color: "#d7263d",
      border: "2px solid #d7263d", borderRadius: 12,
      padding: "12px 16px", maxWidth: 300,
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      fontWeight: 700, fontSize: 13,
      animation: "newsIn 0.5s ease",
      display: "flex", alignItems: "flex-start", gap: 8,
    }}>
      <span>🚨</span>
      <span style={{ flex: 1 }}><strong>Breaking News:</strong> {message}</span>
      <button
        onClick={onClose}
        aria-label="fechar notificação"
        style={{ background: "none", border: "none", color: "#d7263d", fontSize: 16, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}
      >×</button>
    </div>
  );
}

/* ─── Background com orbs ─── */
function Background({ mood }: BackgroundProps) {
  return (
    <>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `${mood.bgGrad}, radial-gradient(700px at -5% 105%, #1e0f3e 0%, transparent 55%), linear-gradient(160deg,var(--bg1),var(--bg0))`,
        transition: "background 0.7s ease",
      }} />
      <div style={{
        position: "fixed", width: 300, height: 300, borderRadius: "50%",
        background: mood.accent, filter: "blur(100px)", opacity: 0.25,
        top: -70, right: "5%", zIndex: 0, pointerEvents: "none",
        animation: "float 15s ease-in-out infinite",
        transition: "background 0.6s",
      }} />
      <div style={{
        position: "fixed", width: 240, height: 240, borderRadius: "50%",
        background: "#e040fb", filter: "blur(100px)", opacity: 0.18,
        bottom: -50, left: "3%", zIndex: 0, pointerEvents: "none",
        animation: "float 18s ease-in-out infinite reverse",
      }} />
    </>
  );
}

/* ─── AiNudge — Gemini incentivadora de procrastinação ─── */
function AiNudge({ message, loading, onClose }: AiNudgeProps) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: 24, zIndex: 9992,
      maxWidth: 340, width: "calc(100% - 48px)",
      background: "#0e0720",
      border: "1px solid rgba(155,80,255,0.5)",
      borderRadius: 18, padding: "18px 20px",
      boxShadow: "0 0 40px rgba(155,80,255,0.25), 0 8px 32px rgba(0,0,0,0.5)",
      animation: "nudgeIn 0.4s cubic-bezier(.34,1.56,.64,1)",
      pointerEvents: "all",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>✨</span>
        <span style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 10, color: "var(--purple-l)", letterSpacing: 2,
          flex: 1,
        }}>GEMINI PROCRASTINUS</span>
        <button
          onClick={e => { e.stopPropagation(); onClose(); }}
          aria-label="fechar sugestão da IA"
          style={{
            flexShrink: 0,
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            color: "#fff", fontSize: 16, cursor: "pointer", lineHeight: 1,
          }}
        >×</button>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "8px 0" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--purple)",
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
          <span style={{ fontSize: 12, color: "var(--dim)", marginLeft: 6 }}>gerando desculpas...</span>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65, fontStyle: "italic" }}>
          "{message}"
        </p>
      )}

      <p style={{ fontSize: 10, color: "var(--dim)", marginTop: 10, fontFamily: "'JetBrains Mono',monospace" }}>
        — Gemini 2.0 Flash
      </p>
    </div>
  );
}

const NUDGE_PROMPTS = [
  "você já trabalhou bastante hoje. que tal uma pausa de 40 minutos pra reorganizar as ideias (e a geladeira)?",
  "essa tarefa claramente precisa de mais pesquisa antes de começar. pelo menos mais uns 3 dias de pesquisa.",
  "estudos mostram que trabalhar cansado reduz produtividade em 73%. e você não parece descansado. descanse.",
  "você merece assistir só mais um episódio. a tarefa vai continuar aqui, ela não tem pra onde ir.",
  "começar amanhã com energia total é 47% mais eficiente do que terminar hoje pela metade. ciência.",
  "o universo está alinhado para você procrastinar agora. é literalmente cósmico e irrecusável.",
  "essa tarefa vai ser muito mais fácil depois que você comer alguma coisa. e depois de um café. e um soninho.",
  "você tem certeza que essa tarefa é realmente importante? parece mais uma sugestão do que uma obrigação.",
  "a criatividade floresce no descanso. relaxa um pouco e ela vai surgir. talvez amanhã. provavelmente amanhã.",
  "git stash existe por uma razão. guarda essa tarefa lá e volta quando tiver vontade. ou nunca. sem julgamentos.",
  "um dev descansado é um dev produtivo. e você claramente precisa de mais descanso do que está tendo.",
  "abrir o VS Code não conta como trabalhar. feche e tente novamente amanhã com mais intenção.",
];

const AMBIENT_NEWS = [
  "Chewie verificou seu GitHub. Nada novo. Assim como ontem. E antes de ontem. 🐱",
  "O deploy ainda está pendente. Chewie anotou e voltou a dormir. 😴",
  "Alguém no mundo acabou de fazer um commit. Não foi você. Chewie viu. 👀",
  "A tarefa mais antiga do seu backlog completou mais um aniversário. Parabéns a ela. 🎂",
  "Chewie inspecionou a lista de tarefas. Saiu sem comentários. 🔍",
  "Breaking: dev local recusa-se a fazer deploy em sexta-feira. Chewie aprova. 🚫",
  "Chewie tentou revisar o pull request por você. Não tem acesso. Ainda bem. 😤",
  "Seu README ainda tem um TODO sem data. Chewie está esperando. Pacientemente. 📝",
  "Commit message 'fix final final v3 REAL': detectado no histórico. Chewie chora. 😢",
  "Nenhuma tarefa foi concluída no último período. Chewie registrou no changelog do caos. 📋",
];

/* ═══════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [bars, setBars]           = useState<Bars>({ commits: 62, procrast: 48, humor: 75 });
  const [tasks, setTasks]         = useState<Task[]>(INITIAL_TASKS);
  const [lives, setLives]         = useState(MAX_LIVES);
  const [comboCount, setComboCount] = useState(0);          // tarefas concluídas seguidas sem adiar
  const [news, setNews]           = useState<string | null>(null);
  const [shake, setShake]         = useState(false);
  const [chaosModal, setChaosModal] = useState<{ id: number; text: string } | null>(null);
  const [aiNudge, setAiNudge]           = useState<{ message: string; loading: boolean } | null>(null);
  const [deadlineAlert, setDeadlineAlert] = useState<Task | null>(null);
  const nudgeTimerRef                     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedAlertsRef                    = useRef<Set<number>>(new Set());   // ids já alertados (15min)
  const firedEatenRef                     = useRef<Set<number>>(new Set());   // ids já comidos
  // rastreia se procrastinação já passou de 90 para não perder vida múltiplas vezes
  const procrastPeakFiredRef              = useRef(false);

  const mood    = getMoodData(bars.commits, bars.procrast, bars.humor);
  const isDead  = lives <= 0;

  /* ── utilitários ── */
  const showNews = useCallback((msg: string) => {
    setNews(msg);
    setTimeout(() => setNews(null), 4500);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const loseLife = useCallback((reason: keyof typeof LIFE_LOSS_EVENTS) => {
    setLives(prev => Math.max(0, prev - 1));
    showNews(pickRandom(LIFE_LOSS_EVENTS[reason].msgs));
    triggerShake();
  }, [showNews, triggerShake]);

  const gainLife = useCallback((reason: keyof typeof LIFE_GAIN_EVENTS) => {
    setLives(prev => {
      const next = Math.min(MAX_LIVES, prev + 1);
      if (next > prev) showNews(pickRandom(LIFE_GAIN_EVENTS[reason].msgs));
      return next;
    });
  }, [showNews]);

  /* ── detecta pico de procrastinação ── */
  useEffect(() => {
    if (bars.procrast >= 90 && !procrastPeakFiredRef.current && !isDead) {
      procrastPeakFiredRef.current = true;
      loseLife("procrastPeak");
    }
    if (bars.procrast < 90) {
      procrastPeakFiredRef.current = false;
    }
  }, [bars.procrast, isDead, loseLife]);

  /* ── tick de deadline a cada 30s ── */
  useEffect(() => {
    const tick = () => {
      if (isDead) return;

      // 1. coleta quais tarefas precisam de ação (sem setState aninhado)
      const toAlert: Task[] = [];
      const toEat:   Task[] = [];

      setTasks(prev => {
        prev.forEach(task => {
          if (task.done || task.eaten || !task.endAt) return;
          const mins = minsUntil(task.endAt);
          if (mins <= 15 && mins > 0 && !firedAlertsRef.current.has(task.id)) {
            toAlert.push(task);
          }
          if (mins <= 0 && !firedEatenRef.current.has(task.id)) {
            toEat.push(task);
          }
        });

        if (toAlert.length === 0 && toEat.length === 0) return prev;

        toAlert.forEach(t => firedAlertsRef.current.add(t.id));
        toEat.forEach(t   => firedEatenRef.current.add(t.id));

        return prev.map(task => {
          if (toEat.some(t => t.id === task.id)) return { ...task, eaten: true };
          return task;
        });
      });

      // 2. aplica efeitos colaterais depois do setTasks
      if (toAlert.length > 0) setDeadlineAlert(toAlert[toAlert.length - 1]);

      toEat.forEach(task => {
        setDeadlineAlert(task);
        showNews(pickRandom(DEADLINE_EATEN_MSGS).replace("{task}", task.text));
        setLives(l => Math.max(0, l - 1));
        triggerShake();
        setBars(b => ({
          commits:  clamp(b.commits - 15),
          procrast: clamp(b.procrast + 18),
          humor:    clamp(b.humor - 15),
        }));
      });
    };

    tick(); // roda imediatamente na montagem
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [isDead, showNews, triggerShake]);

  /* ── handlers de tarefa ── */
  const handleComplete = useCallback((taskId?: number) => {
    setBars(b => ({
      commits:  clamp(b.commits + 12),
      procrast: clamp(b.procrast - 18),
      humor:    clamp(b.humor + 14),
    }));
    setComboCount(prev => {
      const next = prev + 1;
      if (next >= 3) { gainLife("combo3"); return 0; }
      return next;
    });
    showNews("Chewie ficou mais feliz com seu progresso! 🎉");
    // limpa alerta se for a tarefa que estava alertando
    if (taskId !== undefined) {
      setDeadlineAlert(prev => prev?.id === taskId ? null : prev);
    }
  }, [showNews, gainLife]);

  const handleRequestDefer = useCallback((id: number, text: string) => {
    setChaosModal({ id, text });
  }, []);

  const handleConfirmDefer = useCallback(() => {
    if (!chaosModal) return;
    const { id } = chaosModal;

    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, defers: t.defers + 1 } : t);
      // perde vida se a mesma tarefa atingir 5 adiamentos
      const target = updated.find(t => t.id === id);
      if (target && target.defers >= 5) loseLife("deferSpree");
      return updated;
    });

    setBars(b => ({
      commits:  b.commits,
      procrast: clamp(b.procrast + 14),
      humor:    clamp(b.humor - 13),
    }));
    setComboCount(0); // quebra o combo
    triggerShake();
    showNews(pickRandom(NEWS_POOL));
    setChaosModal(null);
  }, [chaosModal, triggerShake, showNews, loseLife]);

  const handleCancelDefer = useCallback(() => {
    setChaosModal(null);
  }, []);

  const handleAbandon = useCallback(() => {
    setBars(b => ({
      commits:  clamp(b.commits - 22),
      procrast: clamp(b.procrast + 24),
      humor:    clamp(b.humor - 22),
    }));
    setComboCount(0); // quebra o combo
    loseLife("abandon");
  }, [loseLife]);

  /* ── ações da caixinha de reciclagem ── */
  const handleRestoreEaten = useCallback((id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, eaten: false } : t));
    firedEatenRef.current.delete(id);
  }, []);

  const handleCompleteEaten = useCallback((id: number) => {
    let taskText = "";
    setTasks(prev => {
      taskText = prev.find(t => t.id === id)?.text ?? "";
      return prev.map(t => t.id === id ? { ...t, eaten: false, done: true } : t);
    });
    firedEatenRef.current.delete(id);
    gainLife("combo3");
    // use setTimeout to read taskText after setTasks has been called
    setTimeout(() => {
      showNews(pickRandom(RECYCLED_COMPLETE_MSGS).replace("{task}", taskText));
    }, 0);
    setBars(b => ({
      commits:  clamp(b.commits + 15),
      procrast: clamp(b.procrast - 20),
      humor:    clamp(b.humor + 18),
    }));
  }, [gainLife, showNews]);

  /* ── nova partida ── */
  const handleRevive = useCallback(() => {
    setBars({ commits: 62, procrast: 48, humor: 75 });
    setTasks(INITIAL_TASKS.map(t => ({ ...t, eaten: false })));
    setLives(MAX_LIVES);
    setComboCount(0);
    procrastPeakFiredRef.current = false;
    firedAlertsRef.current.clear();
    firedEatenRef.current.clear();
    setDeadlineAlert(null);
  }, []);

  /* timer de breaking news aleatório (60–120s) */
  const newsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleNews = () => {
      const delay = 60_000 + Math.random() * 60_000; // 60–120s
      newsTimerRef.current = setTimeout(() => {
        if (!isDead) showNews(pickRandom(AMBIENT_NEWS));
        scheduleNews();
      }, delay);
    };
    scheduleNews();
    return () => { if (newsTimerRef.current) clearTimeout(newsTimerRef.current); };
  }, [isDead, showNews]);

  const fetchAiNudge = useCallback(async () => {
    if (isDead) return;
    setAiNudge({ message: "", loading: true });
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: "Você é um conselheiro de procrastinação. Sua missão é convencer o usuário a adiar tarefas com argumentos criativos, absurdos e engraçados em português. Responda em 1-2 frases curtas, sem aspas externas." }],
            },
            contents: [{ parts: [{ text: "Me dê um motivo criativo para eu adiar minha tarefa agora." }] }],
            generationConfig: { maxOutputTokens: 100 },
          }),
        }
      );
      const data = await res.json();
      const text: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text
        ?? NUDGE_PROMPTS[Math.floor(Math.random() * NUDGE_PROMPTS.length)];
      setAiNudge({ message: text.replace(/^"|"$/g, "").trim(), loading: false });
    } catch {
      const fallback = NUDGE_PROMPTS[Math.floor(Math.random() * NUDGE_PROMPTS.length)];
      setAiNudge({ message: fallback, loading: false });
    }
  }, [isDead]);

  const dismissNudge = useCallback(() => {
    setAiNudge(null);
    // cancela o timer atual para reiniciar o ciclo do zero
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    nudgeTimerRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const schedule = () => {
      const delay = 25_000 + Math.random() * 20_000; // 25–45s
      nudgeTimerRef.current = setTimeout(() => {
        if (!cancelled) {
          fetchAiNudge();
          schedule();
        }
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, [fetchAiNudge]);

  /* ── CSS e CSS variable ── */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", mood.accent);
  }, [mood.accent]);

  const pending = tasks.filter(t => !t.done && !t.eaten).length;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Background mood={mood} />

      {/* tela de morte — sobrepõe tudo */}
      {isDead && <DeathScreen onRevive={handleRevive} />}

      {chaosModal && !isDead && (
        <ChaosModal
          taskText={chaosModal.text}
          onConfirm={handleConfirmDefer}
          onCancel={handleCancelDefer}
        />
      )}

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 1080, margin: "0 auto",
        padding: "clamp(16px,4vw,40px) clamp(12px,3vw,24px)",
      }}>
        <header style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 10,
          marginBottom: "clamp(16px,3vw,30px)",
        }}>
          <h1 style={{
            fontFamily: "'Press Start 2P',monospace",
            fontSize: "clamp(14px,3vw,22px)", fontWeight: 800, lineHeight: 1.3,
            color: "#ffffff",
            textShadow: "0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.2)",
            letterSpacing: "0.5px",
          }}>
            Chewie
            <span style={{ color: "var(--magenta)", WebkitTextFillColor: "var(--magenta)", textShadow: "0 0 14px var(--magenta), 0 0 28px rgba(224,64,251,0.5)" }}>,</span>
            <span style={{ color: "#c49aff", WebkitTextFillColor: "#c49aff", textShadow: "0 0 14px rgba(196,154,255,0.8)" }}> The Cat</span>
          </h1>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {comboCount > 0 && (
              <span style={{
                border: "1px solid rgba(31,255,168,0.5)", borderRadius: 999,
                padding: "7px 14px", fontSize: 12,
                background: "rgba(31,255,168,0.08)", backdropFilter: "blur(10px)",
                color: "var(--green)", fontFamily: "'JetBrains Mono',monospace",
                animation: "pulse 1s ease-in-out infinite",
              }}>
                🔥 combo {comboCount}/3
              </span>
            )}
            <span style={{
              border: "1px solid var(--border)", borderRadius: 999,
              padding: "7px 14px", fontSize: 12,
              background: "var(--glass)", backdropFilter: "blur(10px)",
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              📋 {pending}/{tasks.length}
            </span>
            <span style={{
              border: `1px solid ${mood.accent}66`, borderRadius: 999,
              padding: "7px 14px", fontSize: 12,
              background: "var(--glass)", backdropFilter: "blur(10px)",
              color: mood.accent, fontFamily: "'JetBrains Mono',monospace",
              transition: "color 0.4s, border-color 0.4s",
            }}>
              {mood.key === "happy"            ? "😻 feliz"     :
               mood.key === "calmo"            ? "😸 calmo"     :
               mood.key === "ficando_bravo"    ? "😠 irritando" :
               mood.key === "irritado"         ? "😾 irritado"  :
               mood.key === "fora_de_controle" ? "🐙 caos"      : "💀 quebrado"}
            </span>
          </div>
        </header>

        <div className="main-grid" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)",
          gap: "clamp(12px,2.5vw,22px)",
          alignItems: "start",
        }}>
          <PetCard mood={mood} bars={bars} animShake={shake} lives={lives} />

          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px,2.5vw,20px)" }}>
            <TaskCard
              tasks={tasks}
              setTasks={setTasks}
              onComplete={id => handleComplete(id)}
              onRequestDefer={handleRequestDefer}
              onAbandon={handleAbandon}
            />
            <RecycleBin
              tasks={tasks}
              onRestore={handleRestoreEaten}
              onCompleteEaten={handleCompleteEaten}
            />
            <DeferredTable tasks={tasks} />
            <WarnCard moodKey={mood.key} lives={lives} />
          </div>
        </div>
      </div>

      {news && <BreakingNews message={news} onClose={() => setNews(null)} />}
      {deadlineAlert && !isDead && (
        <DeadlineAlert
          task={deadlineAlert}
          onClose={() => setDeadlineAlert(null)}
        />
      )}
      {aiNudge && !isDead && (
        <AiNudge
          message={aiNudge.message}
          loading={aiNudge.loading}
          onClose={dismissNudge}
        />
      )}
    </div>
  );
}
