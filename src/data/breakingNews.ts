export const breakingNewsList = [
  "Chewie procrastinou uma tarefa importante!",
  "Chewie quase apagou o último commit (simulação)!",
  "Chewie escreveu groselha no README (simulação)!",
  "Chewie criou um bug visual (simulação)!",
  "Chewie está esperando por mais commits!",
];

export const musicSuggestions = [
  "🎵 Chewie sugere: dá um play que o trabalho espera.",
  "🎶 Hora de procrastinar com brega — Chewie aprovou.",
  "🎸 Que tal um intervalo musical? O deadline não percebe.",
  "🎤 Chewie liberou: pode botar pra tocar.",
  "💿 Trabalhar com música rende menos, mas é mais divertido.",
];

export const goodFeedNews = "Chewie ficou mais feliz com seu progresso!";

export function pickRandomBadNews(): string {
  return breakingNewsList[Math.floor(Math.random() * breakingNewsList.length)];
}

export function pickRandomMusicSuggestion(): string {
  return musicSuggestions[
    Math.floor(Math.random() * musicSuggestions.length)
  ];
}
