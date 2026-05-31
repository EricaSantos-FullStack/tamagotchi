# 🐱 Chewie, The Cat

Um pet digital para devs e estudantes que simula um flerken procrastinador!  
Suas tarefas controlam o humor do Chewie em tempo real.

## Como funciona

| Ação | Commits | Procrastinação | Humor |
|---|---|---|---|
| ✅ Concluir tarefa | +12 | −18 | +14 |
| ⏸ Adiar tarefa | — | +14 | −13 |
| 🏳️ Desistir | −22 | +24 | −22 |
| + Nova tarefa | — | — | +4 |

O humor do Chewie tem **6 estágios** com imagens pixel art únicas:

- 😸 **Calmo** — tudo tranquilo, procrastinando com maestria
- 💕 **Happy** — você foi produtivo! Chewie ronrona
- 😠 **Ficando bravo** — zona de atenção
- 😾 **Irritado** — perigo real
- 🐙 **Fora de controle** — modo flerken total, tentáculos liberados
- 💀 **Tamagotchi quebrado** — você destruiu tudo, parabéns

## Features

- **Botão do Caos** ao tentar adiar uma tarefa — modal sarcástico de confirmação
- **Tabela de tarefas adiadas** com títulos criativos e status por gravidade
- **Tela estilo TV CRT** com scanlines, vignette e efeito glitch no estado de erro
- Totalmente **responsivo** (mobile-first)

## Estrutura

```
src/
├── App.tsx              # toda a lógica e UI
├── main.tsx             # entry point
├── index.css            # reset mínimo
└── assets/
    ├── images.ts        # 6 imagens base64 do Chewie
    └── Chewie_-_*.webp  # imagens originais
```

## Rodar localmente

```bash
npm install
```

Crie um arquivo `.env` na raiz (veja `.env.example`):
```
VITE_GEMINI_API_KEY=sua_chave_aqui
```

Obtenha sua chave gratuita em: https://aistudio.google.com/apikey

```bash
npm run dev
```

> Sem a chave, a IA procrastinadora usa frases locais de fallback — o app funciona normalmente.

## Tecnologias

React · Vite · TypeScript · CSS-in-JS  
Fontes: Press Start 2P · JetBrains Mono · Syne  
IA: Gemini 2.0 Flash (Google AI Studio)
