import { useEffect, useRef } from "react";

// 🎵 PLAYLIST — brega ENGRAÇADO (versões brega de pop / covers zoeira).
// O ID é o pedaço do link: https://open.spotify.com/playlist/<ESSE_PEDAÇO>?si=...
// Trocar a playlist é literalmente esta uma linha (PLAYLIST_ID).
//
// Opções sugeridas (todas públicas) — descomente a que quiser:
//   1. "Versões Brega do Pop ⭐" → 01SGaL04sIe8J2IrHKztEh  (ATIVA — hits pop em versão brega, hilário)
//   2. "Versões de Calcinha Preta" → 7bWnJzZmdQXEVfBnw5GCRS  (covers zoeira da CP)
//   3. "Versões da Banda Calcinha Preta" → 2ShjErF9Cm7pVeCVjOJ1XF  (mais versões engraçadas)
const PLAYLIST_ID = "01SGaL04sIe8J2IrHKztEh";
// const PLAYLIST_ID = "7bWnJzZmdQXEVfBnw5GCRS";
// const PLAYLIST_ID = "2ShjErF9Cm7pVeCVjOJ1XF";

// 🔊 evento que faz a música tocar "do nada". Quem quiser disparar a trilha
// (ex.: ao criar uma tarefa) só precisa fazer:
//   window.dispatchEvent(new CustomEvent("chewie:play-music"))
export const PLAY_MUSIC_EVENT = "chewie:play-music";

const IFRAME_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

// tipagem mínima do controller da Spotify IFrame API (não tem @types oficial)
type SpotifyController = {
  play: () => void;
  pause: () => void;
  destroy: () => void;
};
type SpotifyIFrameAPI = {
  createController: (
    el: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    cb: (controller: SpotifyController) => void,
  ) => void;
};
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
  }
}

// A API do Spotify dispara onSpotifyIframeApiReady só UMA vez (quando o script
// carrega). Em remontagens/HMR o script já está carregado e o callback não roda
// de novo — então guardamos a API aqui pra reusar nas próximas montagens.
let cachedSpotifyApi: SpotifyIFrameAPI | null = null;

type SpotifyCardProps = {
  pulsing?: boolean;
};

export function SpotifyCard({ pulsing = false }: SpotifyCardProps) {
  const embedRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const playTimerRef = useRef<number | null>(null);

  // dá play. IMPORTANTE: se o player já existe, toca AGORA (síncrono, dentro
  // do clique) pra não perder a autorização de áudio do navegador. Só usa o
  // fallback com retry se a API ainda estiver carregando no 1º disparo.
  function playMusic() {
    if (controllerRef.current) {
      controllerRef.current.play();
      return;
    }
    if (playTimerRef.current) window.clearInterval(playTimerRef.current);
    let tries = 0;
    playTimerRef.current = window.setInterval(() => {
      if (controllerRef.current) {
        controllerRef.current.play();
        window.clearInterval(playTimerRef.current!);
        playTimerRef.current = null;
      } else if (++tries > 40) {
        window.clearInterval(playTimerRef.current!);
        playTimerRef.current = null;
      }
    }, 100);
  }

  // carrega a Spotify IFrame API e transforma a <div> num player controlável
  useEffect(() => {
    function createController(IFrameAPI: SpotifyIFrameAPI) {
      cachedSpotifyApi = IFrameAPI;
      if (!embedRef.current || controllerRef.current) return;
      IFrameAPI.createController(
        embedRef.current,
        { uri: `spotify:playlist:${PLAYLIST_ID}`, width: "100%", height: 352 },
        (controller) => {
          controllerRef.current = controller;
        },
      );
    }

    if (cachedSpotifyApi) {
      // API já carregada numa montagem anterior — cria o player na hora
      createController(cachedSpotifyApi);
    } else {
      window.onSpotifyIframeApiReady = createController;
      if (!document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) {
        const script = document.createElement("script");
        script.src = IFRAME_API_SRC;
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      if (playTimerRef.current) window.clearInterval(playTimerRef.current);
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  // 🔊 quando uma tarefa é criada, a música começa a tocar sozinha.
  // (o clique de "adicionar" é o gesto que libera o áudio no navegador)
  useEffect(() => {
    function onPlayRequest() {
      playMusic();
    }
    window.addEventListener(PLAY_MUSIC_EVENT, onPlayRequest);
    return () => window.removeEventListener(PLAY_MUSIC_EVENT, onPlayRequest);
  }, []);

  return (
    <section
      className={`card spotify-card${pulsing ? " pulsing" : ""}`}
      aria-label="Trilha sonora do Chewie"
    >
      <h3>🎵 trilha da procrastinação</h3>
      <p className="spotify-subtitle">música pra fingir que tá trabalhando</p>
      {/* a Spotify IFrame API substitui esta div pelo player de verdade */}
      <div className="spotify-embed">
        <div ref={embedRef} />
      </div>
    </section>
  );
}
