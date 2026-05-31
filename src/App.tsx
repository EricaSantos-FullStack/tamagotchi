import { useState, useEffect, useCallback, useRef } from "react";
import { CHEWIE_IMGS } from "./assets/images";
import { SpotifyCard, PLAY_MUSIC_EVENT } from "./components/SpotifyCard";
import {
  listTasks,
  createTask,
  patchTask,
  getCat,
  listNotifications,
  openNotificationStream,
  addDaysIso,
  type BackendTask,
  type CatState,
  type CatMood,
} from "./api/backend";

/* ═══════════════════════════════════════════════════════
   TIPOS
═══════════════════════════════════════════════════════ */
type Task = BackendTask;

interface MoodData {
  key: CatMood;
  img: string;
  emoji: string;
  label: string;
  accent: string;
  author: string;
  badge: { text: string; danger: boolean };
  bgGrad: string;
  glitch?: boolean;
}

interface TvScreenProps {
  mood: MoodData;
  animShake: boolean;
}

interface BarRowProps {
  label: string;
  value: number;
  barColor: string;
  glowColor: string;
  textColor: string;
}

interface PetCardProps {
  mood: MoodData;
  cat: CatState | null;
  animShake: boolean;
}

interface TaskCardProps {
  tasks: Task[];
  pending: number;
  onCreate: (nome: string, dataTermino: string) => Promise<void>;
  onComplete: (id: string) => void;
  onDefer: (task: Task) => void;
  onAbandon: (id: string) => void;
}

interface DeferredTableProps {
  tasks: Task[];
}

interface WarnCardProps {
  moodKey: CatMood;
}

interface BreakingNewsProps {
  message: string;
  danger: boolean;
  onClose: () => void;
}

interface BackgroundProps {
  mood: MoodData;
}

interface ExcuseBubbleProps {
  message: string;
  loading: boolean;
  onClose: () => void;
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
  @keyframes nudgeIn {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes deadlineIn {
    from { opacity: 0; transform: translateX(-120px); }
    to   { opacity: 1; transform: none; }
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
   LÓGICA DE HUMOR — derivada 100% do estado do gato (backend)
═══════════════════════════════════════════════════════ */
function getMoodData(mood: CatMood): MoodData {
  switch (mood) {
    case "happy":
      return {
        key: "happy",
        img: "happy",
        emoji: "😸",
        label: "Chewie está RADIANTE! 😸",
        accent: "#1fffa8",
        author: "— Chewie, fazendo biscoitinhos",
        badge: { text: "MVP!", danger: false },
        bgGrad: "radial-gradient(900px at 70% -10%, #0a3a28 0%, transparent 60%)",
      };
    case "neutral":
      return {
        key: "neutral",
        img: "calmo",
        emoji: "🐱",
        label: "Chewie está NEUTRO 🐱",
        accent: "#9b50ff",
        author: "— Chewie, com olhos semicerrados de julgamento",
        badge: { text: "OK", danger: false },
        bgGrad: "radial-gradient(900px at 70% -10%, #3a1566 0%, transparent 60%)",
      };
    case "grumpy":
      return {
        key: "grumpy",
        img: "irritado",
        emoji: "😾",
        label: "Chewie está MAL-HUMORADO 😾",
        accent: "#ff7c3d",
        author: "— Chewie, derrubando sua caneca de café",
        badge: { text: "CUIDADO!", danger: true },
        bgGrad: "radial-gradient(900px at 70% -10%, #5a2810 0%, transparent 60%)",
      };
    case "monster":
      return {
        key: "monster",
        img: "fora_de_controle",
        emoji: "👹",
        label: "CHEWIE VIROU UM MONSTRO 👹",
        accent: "#e040fb",
        author: "— Chewie, destruindo seu workspace",
        badge: { text: "🐙 CAOS", danger: true },
        bgGrad: "radial-gradient(900px at 70% -10%, #4a0f55 0%, transparent 60%)",
        glitch: true,
      };
  }
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

/* ═══════════════════════════════════════════════════════
   HELPERS DE DATA
═══════════════════════════════════════════════════════ */
const pad = (n: number) => String(n).padStart(2, "0");

/** Converte um Date para "YYYY-MM-DDTHH:mm" (datetime-local, hora local). */
function toLocalInputString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Formata um ISO ("YYYY-MM-DDTHH:mm:ss") para "DD/MM HH:mm". */
function fmtDatetime(iso: string): string {
  if (!iso) return "";
  const [datePart, timePart] = iso.split("T");
  if (!datePart || !timePart) return iso;
  const [, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");
  return `${day}/${month} ${hour}:${minute}`;
}

/** Minutos restantes até o deadline (negativo = prazo estourado). */
function minsUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
}

/** Aplica máscara DD/MM/AAAA enquanto o usuário digita. */
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Aplica máscara HH:MM enquanto o usuário digita. */
function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/**
 * Converte "DD/MM/AAAA" + "HH:MM" para "YYYY-MM-DDTHH:mm:ss" (formato do backend).
 * Retorna undefined se inválido.
 */
function parseBrDatetime(date: string, time: string): string | undefined {
  const dateParts = date.split("/");
  if (dateParts.length !== 3) return undefined;
  const [dd, mm, yyyy] = dateParts;
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return undefined;
  if (!time.match(/^\d{2}:\d{2}$/)) return undefined;
  const iso = `${yyyy}-${mm}-${dd}T${time}:00`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;
  return iso;
}

const PROCRASTINATOR_TITLES = [
  "🏆 Hall da Vergonha — Campeões do Não Fazer",
  "📋 Tarefas que Você Prometeu Fazer Amanhã (desde 2019)",
  "🪦 Cemitério das Intenções — R.I.P. Produtividade",
  "🐢 Olimpíadas do Adiamento — Você Ganhou Ouro",
  "🤡 Sua Obra-Prima da Procrastinação",
];

/* ═══════════════════════════════════════════════════════
   COMPONENTES
═══════════════════════════════════════════════════════ */

/* ─── Tela TV CRT ─── */
function TvScreen({ mood, animShake }: TvScreenProps) {
  return (
    <div style={{
      position: "relative", background: "#111",
      borderRadius: 8, overflow: "hidden", aspectRatio: "1/1", width: "100%",
      boxShadow: `inset 0 0 30px rgba(0,0,0,0.8), 0 0 0 4px #222, 0 0 0 8px #1a1a1a, 0 0 40px ${mood.accent}55`,
      animation: animShake ? "shake 0.4s ease" : undefined,
      border: `3px solid ${mood.accent}`,
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
          filter: mood.glitch ? "contrast(1.4) saturate(1.2) brightness(0.85)" : "none",
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
            fontSize: "clamp(12px,3vw,20px)",
            color: "#1fffa8",
            textShadow: "0 0 20px #1fffa8, 3px 0 #ff3d6b, -3px 0 #3dbbff",
            lineHeight: 1.6, textAlign: "center",
            animation: "glitch 0.8s steps(1) infinite",
            padding: "0 16px",
          }}>
            WORKSPACE<br />DESTROYED.
          </div>
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
  const v = clamp(Math.round(value));
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
          height: "100%", width: `${v}%`, borderRadius: 999,
          background: barColor,
          boxShadow: `0 0 10px ${glowColor}`,
          transition: "width 0.7s cubic-bezier(.34,1.56,.64,1)",
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: textColor, fontFamily: "'JetBrains Mono',monospace" }}>
        {v}%
      </span>
    </div>
  );
}

/* ─── Card do pet ─── */
function PetCard({ mood, cat, animShake }: PetCardProps) {
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
        <span style={{ fontSize: 22 }}>{mood.emoji}</span>
      </div>

      <TvScreen mood={mood} animShake={animShake} />

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
        <BarRow label="FELICIDADE"  value={cat?.happiness ?? 0}        barColor="linear-gradient(90deg,#14d68a,#1fffa8)"               glowColor="#1fffa8"        textColor="var(--green)"    />
        <BarRow label="FOME"        value={cat?.hunger ?? 0}           barColor="linear-gradient(90deg,#ff6a2b,#ff7c3d)"              glowColor="#ff7c3d"        textColor="var(--orange)"   />
        <BarRow label="DESTRUIÇÃO"  value={cat?.destruction_level ?? 0} barColor="linear-gradient(90deg,var(--purple),var(--magenta))" glowColor="var(--purple)"  textColor="var(--purple-l)" />
      </div>

      <blockquote style={{
        border: "1px solid var(--border)", borderRadius: 12,
        padding: "14px 16px", background: "rgba(155,80,255,0.07)",
        textAlign: "left",
      }}>
        <p style={{ fontStyle: "italic", color: "#f0e4ff", marginBottom: 5, lineHeight: 1.55, fontSize: 13 }}>
          {cat?.description ?? "Carregando o estado do Chewie..."}
        </p>
        <p style={{ color: "var(--purple-l)", fontSize: 11 }}>{mood.author}</p>
      </blockquote>
    </section>
  );
}

/* ─── Card de tarefas ─── */
function TaskCard({ tasks, pending, onCreate, onComplete, onDefer, onAbandon }: TaskCardProps) {
  const [newText, setNewText]       = useState("");
  const [newEndDate, setNewEndDate] = useState(""); // DD/MM/AAAA
  const [newEndTime, setNewEndTime] = useState(""); // HH:MM
  const [expanded, setExpanded]     = useState(false);
  const [saving, setSaving]         = useState(false);

  // re-render a cada 30s para atualizar contadores de tempo restante
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleAdd = useCallback(async () => {
    if (!newText.trim() || saving) return;
    // se o usuário não definiu prazo, assume +1 dia a partir de agora
    const dataTermino =
      parseBrDatetime(newEndDate, newEndTime) ??
      `${toLocalInputString(new Date(Date.now() + 24 * 60 * 60_000))}:00`;
    setSaving(true);
    try {
      await onCreate(newText.trim(), dataTermino);
      setNewText("");
      setNewEndDate("");
      setNewEndTime("");
      setExpanded(false);
    } finally {
      setSaving(false);
    }
  }, [newText, newEndDate, newEndTime, saving, onCreate]);

  // tarefas visíveis: some quem desistiu E quem concluiu (só pendentes ficam na lista)
  const visible = tasks.filter(t => !t.desistiu && !t.concluida);

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
        {visible.length === 0 && (
          <li style={{ fontSize: 12, color: "var(--dim)", padding: "12px 4px", fontStyle: "italic" }}>
            Nenhuma tarefa por aqui. O Chewie aprova — mas seu backlog não.
          </li>
        )}
        {visible.map(task => {
          const done       = task.concluida;
          const minsLeft   = task.data_termino ? minsUntil(task.data_termino) : null;
          const isUrgent   = !done && minsLeft !== null && minsLeft <= 15 && minsLeft > 0;
          const isOverdue  = !done && minsLeft !== null && minsLeft <= 0;

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
              opacity: done ? 0.6 : 1,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => !done && onComplete(task.id)}
                  aria-label={done ? "tarefa concluída" : "concluir tarefa"}
                  disabled={done}
                  style={{
                    flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                    cursor: done ? "default" : "pointer",
                    border: `2px solid ${done ? "var(--green)" : "var(--border)"}`,
                    background: done ? "var(--green)" : "transparent",
                    color: "#04231a", fontSize: 14, fontWeight: 700, lineHeight: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                >{done ? "✓" : ""}</button>
                <span style={{
                  flex: 1, fontSize: 13, lineHeight: 1.4, wordBreak: "break-word",
                  textDecoration: done ? "line-through" : "none",
                  color: done
                    ? "var(--dim)"
                    : isOverdue ? "var(--red)" : isUrgent ? "var(--orange)" : "var(--text)",
                }}>
                  {task.nome}
                  {task.vezes_adiada > 0 && (
                    <em style={{ color: "var(--magenta)", fontStyle: "normal", fontWeight: 700, fontSize: 11, marginLeft: 5 }}>
                      ×{task.vezes_adiada}
                    </em>
                  )}
                </span>
                {!done && (
                  <div className="task-actions" style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => onComplete(task.id)}
                      style={{
                        border: "1px solid rgba(31,255,168,0.35)", background: "rgba(31,255,168,0.08)",
                        color: "var(--green)", padding: "7px 12px", borderRadius: 9, fontSize: 12,
                      }}
                    >concluir</button>
                    <button
                      onClick={() => onDefer(task)}
                      style={{
                        border: "1px solid var(--border)", background: "transparent",
                        color: "var(--text)", padding: "7px 12px", borderRadius: 9, fontSize: 12,
                      }}
                    >adiar 1 dia</button>
                    <button
                      onClick={() => onAbandon(task.id)}
                      aria-label="desistir desta tarefa"
                      title="desistir"
                      style={{
                        width: 34, height: 34, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(255,61,107,0.3)",
                        borderRadius: 9, background: "rgba(255,61,107,0.07)",
                        color: "var(--red)", fontSize: 13,
                      }}
                    >🏳️</button>
                  </div>
                )}
              </div>

              {/* deadline info */}
              {task.data_termino && (
                <div style={{ marginTop: 6, marginLeft: 32, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
                  }}>
                    <span style={{
                      color: done ? "var(--dim)" : isOverdue ? "var(--red)" : isUrgent ? "var(--orange)" : "var(--purple-l)",
                      fontWeight: 600,
                      animation: !done && (isUrgent || isOverdue) ? "blink 0.9s ease-in-out infinite" : undefined,
                    }}>
                      ⏰ {fmtDatetime(task.data_termino)}
                    </span>
                    {!done && minsLeft !== null && (
                      <span style={{
                        fontWeight: 700,
                        color: isOverdue ? "var(--red)" : isUrgent ? "var(--orange)" : "var(--dim)",
                        animation: isUrgent || isOverdue ? "blink 0.9s ease-in-out infinite" : undefined,
                      }}>
                        {isOverdue
                          ? `⚠ ${Math.abs(minsLeft)}min atrasada`
                          : `${minsLeft}min restantes`}
                      </span>
                    )}
                  </div>
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
            disabled={saving}
            style={{
              flex: 1, background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)", borderRadius: 10,
              padding: "11px 13px", color: "var(--text)", fontSize: 13, outline: "none",
              opacity: saving ? 0.6 : 1,
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
            disabled={saving}
            style={{
              padding: "11px 16px", borderRadius: 10,
              border: "1px solid var(--border)",
              background: "rgba(155,80,255,0.15)",
              color: "var(--purple-l)", fontSize: 18, fontWeight: 700,
              opacity: saving ? 0.6 : 1, cursor: saving ? "wait" : "pointer",
            }}
          >{saving ? "…" : "+"}</button>
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
              PRAZO — DD/MM/AAAA e HH:MM (24h) — opcional (default: +1 dia)
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
              const minsP   = minsUntil(preview);
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
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Tabela de tarefas adiadas (vezes_adiada) ─── */
function DeferredTable({ tasks }: DeferredTableProps) {
  const deferred = tasks
    .filter(t => !t.concluida && !t.desistiu && t.vezes_adiada > 0)
    .sort((a, b) => b.vezes_adiada - a.vezes_adiada);

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
                  {task.nome}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                  <span style={{
                    background: "rgba(255,61,107,0.15)", color: "#ff7c7c",
                    border: "1px solid rgba(255,61,107,0.35)",
                    borderRadius: 6, padding: "3px 8px",
                    fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 12,
                  }}>×{task.vezes_adiada}</span>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{
                    fontSize: 10, color: "var(--orange)",
                    fontFamily: "'JetBrains Mono',monospace",
                    animation: task.vezes_adiada >= 5 ? "blink 1s ease infinite" : undefined,
                  }}>
                    {getDeferStatus(task.vezes_adiada)}
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

/* ─── Card de aviso (por humor do gato) ─── */
function WarnCard({ moodKey }: WarnCardProps) {
  type WarnVariant = { border: string; bg: string; titleColor: string; title: string; text: string; pulse?: boolean };

  const variants: Record<CatMood, WarnVariant> = {
    happy:   { border: "rgba(31,255,168,0.5)",  bg: "rgba(31,255,168,0.08)",  titleColor: "var(--green)",   title: "CHEWIE ESTÁ FELIZ! 💕",   text: "Uau, você está produtivo! Chewie está ronronando. Não estrague isso." },
    neutral: { border: "rgba(155,80,255,0.4)",  bg: "rgba(155,80,255,0.06)",  titleColor: "var(--purple-l)", title: "CHEWIE ESTÁ NEUTRO 🐱",  text: "Ele está te observando com olhos semicerrados de julgamento. Conclua uma tarefa." },
    grumpy:  { border: "rgba(255,124,61,0.45)", bg: "rgba(255,124,61,0.07)",  titleColor: "var(--orange)",  title: "CHEWIE ESTÁ MAL-HUMORADO ⚠️", text: "Ele derrubou sua caneca de café de propósito. Mais um adiamento e os tentáculos aparecem." },
    monster: { border: "rgba(224,64,251,0.5)",  bg: "rgba(224,64,251,0.07)",  titleColor: "var(--magenta)", title: "👹 MODO MONSTRO ATIVADO", text: "SEU GATO VIROU UM MONSTRO. ELE ESTÁ DESTRUINDO SEU WORKSPACE. CONCLUA UMA TAREFA AGORA.", pulse: true },
  };

  const v = variants[moodKey];

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
    </div>
  );
}

/* ─── Breaking News (notificações SSE) ─── */
function BreakingNews({ message, danger, onClose }: BreakingNewsProps) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9998,
      background: danger ? "#1a0008" : "#fffbe6",
      color: danger ? "#ff7c7c" : "#d7263d",
      border: `2px solid ${danger ? "#ff3d6b" : "#d7263d"}`,
      borderRadius: 12,
      padding: "12px 16px", maxWidth: 320,
      boxShadow: danger
        ? "0 0 40px rgba(255,61,107,0.5), 0 4px 20px rgba(0,0,0,0.4)"
        : "0 4px 20px rgba(0,0,0,0.25)",
      fontWeight: 700, fontSize: 13,
      animation: danger ? "newsIn 0.5s ease, pulse 1.2s ease-in-out infinite 0.5s" : "newsIn 0.5s ease",
      display: "flex", alignItems: "flex-start", gap: 8,
    }}>
      <span>{danger ? "🐙" : "🚨"}</span>
      <span style={{ flex: 1 }}>
        <strong>{danger ? "ALERTA — Chewie em fúria:" : "Breaking News:"}</strong> {message}
      </span>
      <button
        onClick={onClose}
        aria-label="fechar notificação"
        style={{ background: "none", border: "none", color: "inherit", fontSize: 16, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}
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

/* ─── Bolha da desculpa (Gemini) exibida ao criar tarefa ─── */
function ExcuseBubble({ message, loading, onClose }: ExcuseBubbleProps) {
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
          fontSize: 10, color: "var(--purple-l)", letterSpacing: 2, flex: 1,
        }}>GEMINI PROCRASTINUS</span>
        <button
          onClick={e => { e.stopPropagation(); onClose(); }}
          aria-label="fechar desculpa"
          style={{
            flexShrink: 0, width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, color: "#fff", fontSize: 16, cursor: "pointer", lineHeight: 1,
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
        — Sua desculpa de procrastinação, cortesia do Gemini
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [cat, setCat]       = useState<CatState | null>(null);
  const [news, setNews]     = useState<{ message: string; danger: boolean } | null>(null);
  const [shake, setShake]   = useState(false);
  const [excuse, setExcuse] = useState<{ message: string; loading: boolean } | null>(null);
  const [backendDown, setBackendDown] = useState(false);

  const mood = getMoodData(cat?.mood ?? "neutral");

  /* ── utilitários ── */
  const showNews = useCallback((message: string, danger = false) => {
    setNews({ message, danger });
    setTimeout(() => setNews(null), danger ? 7000 : 4500);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  /** Recarrega o estado do gato (recalculado pelo backend após cada ação). */
  const refreshCat = useCallback(async () => {
    try {
      const data = await getCat();
      setCat(data);
    } catch {
      /* mantém o último estado conhecido */
    }
  }, []);

  /* ── carga inicial: tarefas + gato ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, c] = await Promise.all([listTasks(), getCat()]);
        if (cancelled) return;
        setTasks(t);
        setCat(c);
        setBackendDown(false);
      } catch {
        if (!cancelled) setBackendDown(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── notificações iniciais + stream SSE ── */
  useEffect(() => {
    let cancelled = false;
    listNotifications()
      .then(list => {
        if (cancelled) return;
        const unread = list.filter(n => !n.is_read);
        if (unread.length > 0) {
          const last = unread[unread.length - 1];
          showNews(last.message, last.category === "cat_destruction");
        }
      })
      .catch(() => { /* silencioso */ });

    const source = openNotificationStream();
    source.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        const danger = notification.category === "cat_destruction";
        showNews(notification.message, danger);
        if (danger) triggerShake();
      } catch {
        /* payload inválido — ignora */
      }
    };
    source.onerror = () => { /* o EventSource tenta reconectar sozinho */ };

    return () => {
      cancelled = true;
      source.close();
    };
  }, [showNews, triggerShake]);

  /* ── criar tarefa ── */
  const handleCreate = useCallback(async (nome: string, dataTermino: string) => {
    setExcuse({ message: "", loading: true });
    try {
      const res = await createTask(nome, dataTermino);
      setTasks(prev => [...prev, res.task]);
      setExcuse({ message: res.excuse, loading: false });
      // 🔊 a trilha do Chewie começa a tocar ao criar a tarefa
      window.dispatchEvent(new CustomEvent(PLAY_MUSIC_EVENT));
      await refreshCat();
    } catch (err) {
      setExcuse(null);
      showNews("Não consegui criar a tarefa — o backend respondeu com erro. 😿", true);
      throw err;
    }
  }, [refreshCat, showNews]);

  /* ── concluir ── */
  const handleComplete = useCallback(async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, concluida: true } : t));
    try {
      await patchTask(id, { concluida: true });
      showNews("Tarefa concluída! Chewie está orgulhoso (e surpreso). 🎉");
      await refreshCat();
    } catch {
      // rollback
      setTasks(prev => prev.map(t => t.id === id ? { ...t, concluida: false } : t));
      showNews("Falha ao concluir a tarefa no servidor. 😿", true);
    }
  }, [refreshCat, showNews]);

  /* ── adiar 1 dia ── */
  const handleDefer = useCallback(async (task: Task) => {
    const newDate = addDaysIso(task.data_termino, 1);
    const newCount = task.vezes_adiada + 1;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, data_termino: newDate, vezes_adiada: newCount } : t));
    triggerShake();
    try {
      await patchTask(task.id, { data_termino: newDate, vezes_adiada: newCount });
      showNews("Tarefa adiada em 1 dia. Chewie anotou no changelog do caos. 🗒️");
      await refreshCat();
    } catch {
      // rollback
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, data_termino: task.data_termino, vezes_adiada: task.vezes_adiada } : t));
      showNews("Falha ao adiar a tarefa no servidor. 😿", true);
    }
  }, [refreshCat, showNews, triggerShake]);

  /* ── desistir ── */
  const handleAbandon = useCallback(async (id: string) => {
    const prevTasks = tasks;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, desistiu: true } : t));
    try {
      await patchTask(id, { desistiu: true });
      showNews("Você desistiu da tarefa. Chewie arquivou nos anais da preguiça. 💔");
      await refreshCat();
    } catch {
      setTasks(prevTasks); // rollback
      showNews("Falha ao desistir da tarefa no servidor. 😿", true);
    }
  }, [tasks, refreshCat, showNews]);

  /* ── CSS global + accent ── */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", mood.accent);
  }, [mood.accent]);

  const pending = tasks.filter(t => !t.concluida && !t.desistiu).length;
  const visibleTotal = tasks.filter(t => !t.desistiu).length;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Background mood={mood} />

      {backendDown && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: "#1a0008", color: "#ff7c7c",
          borderBottom: "1px solid rgba(255,61,107,0.5)",
          fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
          padding: "10px 16px", textAlign: "center",
        }}>
          ⚠ Backend não encontrado em <strong>localhost:8000</strong> — suba o servidor e recarregue a página.
        </div>
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
            <span style={{ color: "var(--magenta)", textShadow: "0 0 14px var(--magenta), 0 0 28px rgba(224,64,251,0.5)" }}>,</span>
            <span style={{ color: "#c49aff", textShadow: "0 0 14px rgba(196,154,255,0.8)" }}> The Cat</span>
          </h1>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              border: "1px solid var(--border)", borderRadius: 999,
              padding: "7px 14px", fontSize: 12,
              background: "var(--glass)", backdropFilter: "blur(10px)",
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              📋 {pending}/{visibleTotal}
            </span>
            <span style={{
              border: `1px solid ${mood.accent}66`, borderRadius: 999,
              padding: "7px 14px", fontSize: 12,
              background: "var(--glass)", backdropFilter: "blur(10px)",
              color: mood.accent, fontFamily: "'JetBrains Mono',monospace",
              transition: "color 0.4s, border-color 0.4s",
            }}>
              {mood.emoji} {mood.key}
            </span>
          </div>
        </header>

        <div className="main-grid" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)",
          gap: "clamp(12px,2.5vw,22px)",
          alignItems: "start",
        }}>
          <PetCard mood={mood} cat={cat} animShake={shake} />

          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px,2.5vw,20px)" }}>
            <TaskCard
              tasks={tasks}
              pending={pending}
              onCreate={handleCreate}
              onComplete={handleComplete}
              onDefer={handleDefer}
              onAbandon={handleAbandon}
            />
            <DeferredTable tasks={tasks} />
            <WarnCard moodKey={mood.key} />
            <SpotifyCard pulsing={pending >= 3} />
          </div>
        </div>
      </div>

      {news && (
        <BreakingNews
          message={news.message}
          danger={news.danger}
          onClose={() => setNews(null)}
        />
      )}
      {excuse && (
        <ExcuseBubble
          message={excuse.message}
          loading={excuse.loading}
          onClose={() => setExcuse(null)}
        />
      )}
    </div>
  );
}
