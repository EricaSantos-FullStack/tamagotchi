import { useCallback, useState } from "react";
import { initialTasks } from "../data/tasks";
import type { Task } from "../types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed },
    ]);
  }, []);

  const postponeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, count: (t.count ?? 0) + 1 } : t,
      ),
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const giveUpAll = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.done));
  }, []);

  return {
    tasks,
    addTask,
    postponeTask,
    removeTask,
    giveUpAll,
  };
}
