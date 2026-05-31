import chewieFofo from "../assets/imgchewie-fofo.jpeg";
import chewieBravo from "../assets/imgchewie-bravo.png";
import chewieFlerken from "../assets/imgchewie-flerken.jpeg";
import type { Mood } from "../types/mood";

export const moods: Mood[] = [
  {
    key: "neutral",
    label: "procrastinando tranquilamente 🙃",
    img: chewieFofo,
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
    img: chewieBravo,
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
    img: chewieFlerken,
    bars: { commits: 9, procrast: 99, humor: 6 },
    speech: {
      text: '"TENTÁCULOS LIBERADOS. Seu README agora é meu. 💀"',
      author: "— Chewie, flerken em fúria interdimensional",
    },
    badge: { text: "🐙 CAOS", danger: true },
  },
];
