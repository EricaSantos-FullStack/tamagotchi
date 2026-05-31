import React, { useEffect, useCallback } from "react";
import { useTasks } from "./hooks/useTasks";
import { useChewieMood } from "./hooks/useChewieMood";
import { TaskList } from "./components/TaskList";
import { PetCarousel } from "./components/PetCarousel";
import { BreakingNews } from "./components/BreakingNews";
import { Header } from "./components/Header";
import { SpotifyCard, PLAY_MUSIC_EVENT } from "./components/SpotifyCard";
import type { CatState } from "./api/backend";

/* ── CSS global ─────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg0: #060411; --bg1: #0e0720;
    --glass: rgba(22,11,44,0.65); --border: rgba(155,80,255,0.22);
    --purple: #9b50ff; --purple-l: #c49aff; --magenta: #e040fb;
    --green: #1fffa8; --orange: #ff7c3d; --red: #ff3d6b;
    --text: #ddd0f8; --dim: #8878aa; --accent: #9b50ff;
  }

  body { font-family: 'Syne', sans-serif; background: var(--bg0); color: var(--text); min-height: 100vh; overflow-x: hidden; }
  #root { min-height: 100vh; }
  button { font-family: inherit; cursor: pointer; }
  input  { font-family: inherit; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg1); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  @keyframes float { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-16px,20px)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes newsIn { from{opacity:0;transform:translateX(130px)} to{opacity:1;transform:none} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* ── layout ── */
  .topbar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:clamp(16px,3vw,30px); }
  .logo { font-family:'Press Start 2P',monospace; font-size:clamp(14px,3vw,22px); color:#fff; text-shadow:0 0 20px rgba(255,255,255,0.6); }
  .logo-dot { color:var(--magenta); }
  .stats { display:flex; gap:8px; flex-wrap:wrap; }
  .pill { border:1px solid var(--border); border-radius:999px; padding:7px 14px; font-size:12px; background:var(--glass); backdrop-filter:blur(10px); font-family:'JetBrains Mono',monospace; }
  .pill.small { padding:4px 12px; font-size:11px; color:var(--purple-l); }

  .main-grid { display:grid; grid-template-columns:minmax(0,1.5fr) minmax(0,1fr); gap:clamp(12px,2.5vw,22px); align-items:start; }
  @media(max-width:800px){ .main-grid{grid-template-columns:1fr!important} }

  /* ── card ── */
  .card { background:var(--glass); border:1px solid var(--border); border-radius:22px; padding:clamp(16px,3vw,24px); backdrop-filter:blur(18px); box-shadow:0 18px 50px rgba(0,0,0,0.45); }

  /* ── pet carousel ── */
  .carousel { text-align:center; }
  .slide { display:flex; flex-direction:column; align-items:center; gap:12px; }
  .pet-avatar { position:relative; width:min(280px,80vw); }
  .pet-img { width:100%; border-radius:12px; border:2px solid var(--border); }
  .commit-badge { position:absolute; bottom:10px; right:10px; background:var(--green); color:#04231a; font-family:'Press Start 2P',monospace; font-size:9px; padding:5px 8px; border-radius:5px; box-shadow:0 0 12px rgba(31,255,168,0.7); }
  .commit-badge.danger { background:var(--red); color:#fff; box-shadow:0 0 12px rgba(255,61,107,0.8); }
  .mood-title { color:var(--dim); letter-spacing:3px; font-size:10px; font-family:'JetBrains Mono',monospace; }
  .mood { font-size:clamp(13px,2vw,16px); font-weight:800; color:var(--purple-l); line-height:1.4; padding:0 8px; text-align:center; }
  .mood-bars { width:100%; }
  .bar-row { display:grid; grid-template-columns:80px 1fr 42px; align-items:center; gap:8px; margin-bottom:8px; }
  .bar-label { font-size:10px; color:var(--dim); text-align:right; font-family:'JetBrains Mono',monospace; }
  .bar-track { height:9px; border-radius:999px; background:rgba(255,255,255,0.06); overflow:hidden; }
  .bar-fill { height:100%; border-radius:999px; transition:width 0.7s cubic-bezier(.34,1.56,.64,1); }
  .bar-fill.green { background:linear-gradient(90deg,#14d68a,#1fffa8); box-shadow:0 0 10px #1fffa8; }
  .bar-value { font-size:11px; font-weight:700; color:var(--green); font-family:'JetBrains Mono',monospace; }
  .dots { display:flex; gap:8px; justify-content:center; margin-top:8px; }
  .dot { width:8px; height:8px; border-radius:50%; background:var(--border); border:none; cursor:pointer; }
  .dot.active { background:var(--purple); }

  /* ── tasks ── */
  .tasks-card {}
  .tasks-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px; }
  .tasks-head h2 { font-family:'Press Start 2P',monospace; font-size:clamp(10px,2vw,13px); color:#fff; }
  .task-list { list-style:none; margin-bottom:12px; }
  .task { display:flex; align-items:center; gap:10px; padding:10px 8px; margin-inline:-8px; border-bottom:1px solid rgba(155,80,255,0.1); border-radius:10px; }
  .task.done .task-name { text-decoration:line-through; opacity:0.5; }
  .checkbox { flex-shrink:0; width:22px; height:22px; border-radius:6px; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:12px; color:var(--green); }
  .checkbox.checked { background:rgba(31,255,168,0.15); border-color:var(--green); }
  .task-name { flex:1; font-size:13px; line-height:1.4; word-break:break-word; }
  .x { color:var(--magenta); font-style:normal; font-weight:700; font-size:11px; margin-left:5px; }
  .task-actions { display:flex; gap:6px; flex-shrink:0; }
  .btn-concluir { border:1px solid rgba(31,255,168,0.4); background:rgba(31,255,168,0.08); color:var(--green); padding:7px 10px; border-radius:9px; font-size:12px; }
  .btn-adiar { border:1px solid var(--border); background:transparent; color:var(--text); padding:7px 12px; border-radius:9px; font-size:12px; }
  .btn-desistir-task { width:34px; height:34px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,61,107,0.3); border-radius:9px; background:rgba(255,61,107,0.07); color:var(--red); font-size:13px; }
  .task-empty { font-size:12px; color:var(--dim); margin-bottom:12px; font-family:'JetBrains Mono',monospace; }

  /* ── new task form ── */
  .btn-nova { width:100%; padding:11px; border-radius:10px; border:1px dashed var(--border); background:transparent; color:var(--purple-l); font-size:13px; margin-top:4px; }
  .new-task-form { display:flex; flex-direction:column; gap:8px; margin-top:4px; }
  .new-task-input { background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:10px; padding:11px 13px; color:var(--text); font-size:13px; outline:none; }
  .btn-nova-confirm { padding:11px; border-radius:10px; border:1px solid var(--border); background:rgba(155,80,255,0.15); color:var(--purple-l); font-size:14px; font-weight:700; }

  /* ── breaking news ── */
  .breaking-news { position:fixed; top:20px; right:20px; z-index:9998; background:#fffbe6; color:#d7263d; border:2px solid #d7263d; border-radius:12px; padding:12px 16px; max-width:320px; box-shadow:0 4px 20px rgba(0,0,0,0.25); font-weight:700; font-size:13px; animation:newsIn 0.5s ease; display:flex; align-items:flex-start; gap:8px; }
  .breaking-news--danger { background:#1a0008; color:#ff7c7c; border-color:#ff3d6b; animation:blink 0.6s ease-in-out 3; }
  .breaking-news-icon { font-size:16px; }
  .breaking-news-label { font-weight:900; }
  .breaking-news-close { background:none; border:none; color:inherit; font-size:16px; cursor:pointer; line-height:1; flex-shrink:0; margin-left:auto; }

  /* ── warn card ── */
  .warn-card { background:rgba(255,61,107,0.07); border:1px solid rgba(255,61,107,0.45); border-radius:18px; padding:20px 18px; }
  .warn-card h3 { color:var(--red); font-size:clamp(11px,2vw,14px); margin-bottom:10px; font-weight:700; }
  .warn-card p { font-size:13px; line-height:1.7; }

  /* ── background orbs ── */
  .bg-fixed { position:fixed; inset:0; z-index:0; pointer-events:none; background:radial-gradient(900px at 70% -10%,#3a1566 0%,transparent 60%),radial-gradient(700px at -5% 105%,#1e0f3e 0%,transparent 55%),linear-gradient(160deg,var(--bg1),var(--bg0)); transition:background 0.7s ease; }
  .orb1 { position:fixed; width:300px; height:300px; border-radius:50%; background:var(--purple); filter:blur(100px); opacity:0.25; top:-70px; right:5%; z-index:0; pointer-events:none; animation:float 15s ease-in-out infinite; }
  .orb2 { position:fixed; width:240px; height:240px; border-radius:50%; background:#e040fb; filter:blur(100px); opacity:0.18; bottom:-50px; left:3%; z-index:0; pointer-events:none; animation:float 18s ease-in-out infinite reverse; }

  /* ── excuse toast ── */
  .excuse-toast { position:fixed; bottom:24px; left:24px; z-index:9992; max-width:340px; width:calc(100% - 48px); background:#0e0720; border:1px solid rgba(155,80,255,0.5); border-radius:18px; padding:18px 20px; box-shadow:0 0 40px rgba(155,80,255,0.25),0 8px 32px rgba(0,0,0,0.5); animation:newsIn 0.4s ease; }
  .excuse-toast p { font-size:13px; color:var(--text); line-height:1.65; font-style:italic; }
  .excuse-toast small { font-size:10px; color:var(--dim); font-family:'JetBrains Mono',monospace; display:block; margin-top:8px; }
  .excuse-close { position:absolute; top:10px; right:12px; background:none; border:none; color:var(--dim); font-size:16px; cursor:pointer; }
`;

/* ── mood → WarnCard variant ─────────────────────────────────────────── */
function WarnCard({ cat }: { cat: CatState | null }) {
  if (!cat) return null;
  const variants: Record<CatState["mood"], { border: string; bg: string; titleColor: string; title: string }> = {
    happy:   { border: "rgba(31,255,168,0.5)",  bg: "rgba(31,255,168,0.08)",  titleColor: "var(--green)",   title: "CHEWIE ESTÁ FELIZ! 💕" },
    neutral: { border: "rgba(31,255,168,0.3)",  bg: "rgba(31,255,168,0.05)",  titleColor: "var(--green)",   title: "CHEWIE ESTÁ DE BOA 😸" },
    grumpy:  { border: "rgba(255,61,107,0.45)", bg: "rgba(255,61,107,0.07)",  titleColor: "var(--red)",     title: "CHEWIE ESTÁ BRAVO! 🔥" },
    monster: { border: "rgba(224,64,251,0.5)",  bg: "rgba(224,64,251,0.07)",  titleColor: "var(--magenta)", title: "🐙 MODO CAOS ATIVADO" },
  };
  const v = variants[cat.mood];
  return (
    <div style={{ background: v.bg, border: `1px solid ${v.border}`, borderRadius: 18, padding: "20px 18px" }}>
      <h3 style={{ color: v.titleColor, fontSize: "clamp(11px,2vw,14px)", marginBottom: 10, fontWeight: 700 }}>{v.title}</h3>
      <p style={{ fontSize: 13, lineHeight: 1.7 }}>{cat.description}</p>
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────────────────── */
export default function App() {
  const { cat, moodEmoji, notifications, refreshCat, dismissNotification } = useChewieMood();
  const { tasks, loading, pendingCount, addTask, completeTask, deferTask, giveUpTask } = useTasks(refreshCat);

  const [excuse, setExcuse] = React.useState<string | null>(null);

  // inject CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  const handleAdd = useCallback(async (nome: string, data_termino: string) => {
    const exc = await addTask(nome, data_termino);
    if (exc) setExcuse(exc);
    window.dispatchEvent(new CustomEvent(PLAY_MUSIC_EVENT));
  }, [addTask]);

  const latestNotification = notifications[0] ?? null;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="bg-fixed" />
      <div className="orb1" />
      <div className="orb2" />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto", padding: "clamp(16px,4vw,40px) clamp(12px,3vw,24px)" }}>
        <Header streak={tasks.filter(t => t.concluida).length} />

        <div className="main-grid">
          {/* ── pet ── */}
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ color: "var(--dim)", letterSpacing: 5, fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>SEU PET FLERKEN</p>
              <span style={{ border: `1px solid var(--border)`, borderRadius: 999, padding: "7px 14px", fontSize: 12, background: "var(--glass)", fontFamily: "'JetBrains Mono',monospace" }}>
                {moodEmoji} {cat?.mood ?? "…"}
              </span>
            </div>
            <PetCarousel cat={cat} />
          </section>

          {/* ── right column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px,2.5vw,20px)" }}>
            {loading ? (
              <p style={{ color: "var(--dim)", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>carregando tarefas…</p>
            ) : (
              <TaskList
                tasks={tasks}
                pendingCount={pendingCount}
                onAdd={handleAdd}
                onComplete={completeTask}
                onDefer={deferTask}
                onGiveUp={giveUpTask}
              />
            )}
            <WarnCard cat={cat} />
            <SpotifyCard pulsing={pendingCount >= 3} />
          </div>
        </div>
      </div>

      {/* ── SSE notification ── */}
      {latestNotification && (
        <BreakingNews
          notification={latestNotification}
          onClose={dismissNotification}
        />
      )}

      {/* ── excuse toast (ao criar tarefa) ── */}
      {excuse && (
        <div className="excuse-toast">
          <button className="excuse-close" onClick={() => setExcuse(null)}>×</button>
          <p>"{excuse}"</p>
          <small>— Gemini Procrastinus</small>
        </div>
      )}
    </div>
  );
}
