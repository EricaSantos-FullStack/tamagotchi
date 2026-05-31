// ════════════════════════════════════════════════════════════════════════
//  Camada de IA (nudge de procrastinação)
//
//  Em PRODUÇÃO: defina VITE_API_BASE_URL apontando pro seu backend. O app
//  passa a chamar o SEU servidor (`POST {base}/ai/nudge`), que guarda a chave
//  da Gemini em segredo e fala com a API do Google. A chave NUNCA vai pro
//  navegador.
//
//  Em DEV (sem VITE_API_BASE_URL): cai no fallback que chama a Gemini direto
//  do navegador usando VITE_GEMINI_API_KEY. ⚠️ INSEGURO — essa chave vai pro
//  bundle público. Use só pra desenvolvimento local.
//
//  Contrato esperado do backend:
//    POST {VITE_API_BASE_URL}/ai/nudge   ->   200 { "message": "<frase>" }
// ════════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

const SYSTEM_INSTRUCTION =
  "Você é um conselheiro de procrastinação. Sua missão é convencer o usuário a adiar tarefas com argumentos criativos, absurdos e engraçados em português. Responda em 1-2 frases curtas, sem aspas externas.";
const USER_PROMPT = "Me dê um motivo criativo para eu adiar minha tarefa agora.";

function cleanup(text: string): string {
  return text.replace(/^"|"$/g, "").trim();
}

/**
 * Busca uma frase de incentivo à procrastinação.
 * Lança erro em qualquer falha — o chamador deve ter um fallback local.
 */
export async function fetchProcrastinationNudge(signal?: AbortSignal): Promise<string> {
  if (API_BASE) {
    // ✅ caminho de produção: backend guarda a chave e fala com a Gemini
    const res = await fetch(`${API_BASE}/ai/nudge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
    });
    if (!res.ok) throw new Error(`backend respondeu ${res.status}`);
    const data = await res.json();
    const text = data?.message ?? data?.text;
    if (!text) throw new Error("resposta vazia do backend");
    return cleanup(text);
  }

  return devGeminiNudge(signal);
}

// ⚠️ DEV-ONLY — chama a Gemini direto do navegador, expondo a chave no bundle.
// É substituído automaticamente assim que VITE_API_BASE_URL é definido.
async function devGeminiNudge(signal?: AbortSignal): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("sem VITE_GEMINI_API_KEY (e sem VITE_API_BASE_URL)");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ parts: [{ text: USER_PROMPT }] }],
        generationConfig: { maxOutputTokens: 100 },
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini respondeu ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("resposta vazia da Gemini");
  return cleanup(text);
}
