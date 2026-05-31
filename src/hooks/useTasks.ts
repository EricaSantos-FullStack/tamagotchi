import { useCallback, useEffect, useState } from "react";
import {
  fetchTasks,
  createTask,
  patchTask,
  type BackendTask,
} from "../api/backend";
import type { Task } from "../types/task";

function toTask(t: BackendTask): Task {
  return {
    id: t.id,
    nome: t.nome,
    data_termino: t.data_termino,
    concluida: t.concluida,
    vezes_adiada: t.vezes_adiada,
    desistiu: t.desistiu,
    desculpa: t.desculpa,
    criada_em: t.criada_em,
  };
}

export function useTasks(onCatRefresh: () => void) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchTasks();
      // hide tasks where desistiu=true; keep concluida=true visible (strikethrough)
      setTasks(data.filter((t) => !t.desistiu).map(toTask));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addTask = useCallback(
    async (nome: string, data_termino: string): Promise<string | null> => {
      try {
        const res = await createTask(nome, data_termino);
        await refresh();
        onCatRefresh();
        return res.excuse ?? null;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    [refresh, onCatRefresh],
  );

  const completeTask = useCallback(
    async (id: string) => {
      try {
        await patchTask(id, { concluida: true });
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, concluida: true } : t)),
        );
        onCatRefresh();
      } catch (e) {
        console.error(e);
      }
    },
    [onCatRefresh],
  );

  const deferTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const newDate = new Date(
        new Date(task.data_termino).getTime() + 24 * 60 * 60 * 1000,
      ).toISOString().slice(0, 19);
      const newDefers = task.vezes_adiada + 1;
      try {
        await patchTask(id, { data_termino: newDate, vezes_adiada: newDefers });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, data_termino: newDate, vezes_adiada: newDefers }
              : t,
          ),
        );
        onCatRefresh();
      } catch (e) {
        console.error(e);
      }
    },
    [tasks, onCatRefresh],
  );

  const giveUpTask = useCallback(
    async (id: string) => {
      try {
        await patchTask(id, { desistiu: true });
        setTasks((prev) => prev.filter((t) => t.id !== id));
        onCatRefresh();
      } catch (e) {
        console.error(e);
      }
    },
    [onCatRefresh],
  );

  const pendingCount = tasks.filter((t) => !t.concluida).length;

  return { tasks, loading, pendingCount, addTask, completeTask, deferTask, giveUpTask };
}
