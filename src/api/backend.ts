const BASE = "http://localhost:8000";

// ── Tasks ──────────────────────────────────────────────────────────────

export interface BackendTask {
  id: string;
  nome: string;
  data_termino: string;
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

export async function fetchTasks(): Promise<BackendTask[]> {
  const res = await fetch(`${BASE}/flask/tasks/`);
  if (!res.ok) throw new Error(`fetchTasks: ${res.status}`);
  return res.json();
}

export async function createTask(nome: string, data_termino: string): Promise<CreateTaskResponse> {
  const res = await fetch(`${BASE}/flask/tasks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, data_termino }),
  });
  if (!res.ok) throw new Error(`createTask: ${res.status}`);
  return res.json();
}

export async function patchTask(id: string, data: Partial<BackendTask>): Promise<BackendTask> {
  const res = await fetch(`${BASE}/flask/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`patchTask: ${res.status}`);
  return res.json();
}

// ── Cat ────────────────────────────────────────────────────────────────

export interface CatState {
  mood: "happy" | "neutral" | "grumpy" | "monster";
  happiness: number;
  hunger: number;
  destruction_level: number;
  description: string;
  last_fed_at: string;
}

export async function fetchCat(): Promise<CatState> {
  const res = await fetch(`${BASE}/api/cat/`);
  if (!res.ok) throw new Error(`fetchCat: ${res.status}`);
  return res.json();
}

// ── Notifications ──────────────────────────────────────────────────────

export interface Notification {
  id: string;
  message: string;
  category: string;
  is_read: boolean;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE}/api/notifications/`);
  if (!res.ok) throw new Error(`fetchNotifications: ${res.status}`);
  return res.json();
}

export async function markNotificationsRead(): Promise<void> {
  await fetch(`${BASE}/api/notifications/mark-read`, { method: "POST" });
}

export function createNotificationStream(
  onMessage: (n: Notification) => void,
): EventSource {
  const source = new EventSource(`${BASE}/api/notifications/stream`);
  source.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data));
    } catch {
      // ignore malformed events
    }
  };
  return source;
}
