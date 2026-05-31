export const breakingNewsList = [
  "Chewie procrastinou uma tarefa importante!",
  "Chewie quase apagou o último commit (simulação)!",
  "Chewie escreveu groselha no README (simulação)!",
  "Chewie criou um bug visual (simulação)!",
  "Chewie está esperando por mais commits!",
];

export const goodFeedNews = "Chewie ficou mais feliz com seu progresso!";

export function pickRandomBadNews(): string {
  return breakingNewsList[Math.floor(Math.random() * breakingNewsList.length)];
}
