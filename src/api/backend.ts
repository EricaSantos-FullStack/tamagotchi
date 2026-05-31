// ════════════════════════════════════════════════════════════════════════
//  Camada de integração com o backend (Flask + FastAPI)
//
//  Base URL configurável via VITE_API_BASE_URL. Em dev, default localhost:8000.
//  O backend aceita CORS de qualquer origem (allow_origins: ["*"]).
//
//  Rotas:
//    GET    /flask/tasks/            → lista tarefas
//    GET    /flask/tasks/{id}        → busca uma tarefa
//    POST   /flask/tasks/            → cria tarefa (Gemini gera a desculpa)
//    PATCH  /flask/tasks/{id}        → atualiza (concluir / adiar / desistir)
//    GET    /api/cat/                → estado atual do gato
//    GET    /api/notifications/      → lista notificações
//    POST   /api/notifications/mark-read
//    GET    /api/notifications/stream (SSE)
// ════════════════════════════════════════════════════════════════════════

export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000";

/* ─── Tipos do backend ─── */
export interface BackendTask {
  id: string;
  nome: string;
  data_termino: string; // ISO 8601 — ex: "2025-12-01T10:00:00"
  concluida: boolean;
  vezes_adiada: number;
  desistiu: boolean;
  desculpa: string;
  criada_em: string;
}

export interface CreateTaskResponse {
  task: BackendTask;
  excuse: string;
  suggested_postpone_hours: number;
  suggested_new_date: string;
  confidence: number;
}

export type CatMood = "happy" | "neutral" | "grumpy" | "monster";

export interface CatState {
  mood: CatMood;
  happiness: number;
  hunger: number;
  destruction_level: number;
  description: string;
  last_fed_at: string;
}

export interface BackendNotification {
  id: string;
  message: string;
  category: string;
  is_read: boolean;
}

/* ─── Helper de fetch com erro descritivo ─── */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} respondeu ${res.status}`);
  }
  // alguns PATCH podem responder 204 sem corpo
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/* ─── Tarefas ─── */
export function listTasks(): Promise<BackendTask[]> {
  return request<BackendTask[]>("/flask/tasks/");
}

export function getTask(id: string): Promise<BackendTask> {
  return request<BackendTask>(`/flask/tasks/${id}`);
}

export function createTask(
  nome: string,
  data_termino: string,
): Promise<CreateTaskResponse> {
  return request<CreateTaskResponse>("/flask/tasks/", {
    method: "POST",
    body: JSON.stringify({ nome, data_termino }),
  });
}

export function patchTask(
  id: string,
  body: Partial<Pick<BackendTask, "data_termino" | "vezes_adiada" | "concluida" | "desistiu">>,
): Promise<BackendTask> {
  return request<BackendTask>(`/flask/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/* ─── Gato ─── */
export function getCat(): Promise<CatState> {
  return request<CatState>("/api/cat/");
}

/* ─── Notificações ─── */
export function listNotifications(): Promise<BackendNotification[]> {
  return request<BackendNotification[]>("/api/notifications/");
}

export function markNotificationsRead(): Promise<{ message: string }> {
  return request<{ message: string }>("/api/notifications/mark-read", {
    method: "POST",
  });
}

/** Abre o stream SSE de notificações. Lembre de chamar .close() ao desmontar. */
export function openNotificationStream(): EventSource {
  return new EventSource(`${API_BASE}/api/notifications/stream`);
}

/* ─── Helpers de data ─── */

/**
 * Soma `days` dias a uma data_termino ISO ("YYYY-MM-DDTHH:mm:ss") preservando
 * o formato sem timezone esperado pelo backend.
 */
export function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
