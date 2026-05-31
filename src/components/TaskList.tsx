import type { Task } from "../types/task";
import { NewTaskForm } from "./NewTaskForm";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  pendingCount: number;
  onAdd: (name: string) => void;
  onPostpone: (id: string) => void;
  onRemove: (id: string) => void;
  onGiveUpAll: () => void;
};

export function TaskList({
  tasks,
  pendingCount,
  onAdd,
  onPostpone,
  onRemove,
  onGiveUpAll,
}: TaskListProps) {
  function handleGiveUp() {
    if (pendingCount === 0) return;
    const ok = window.confirm(
      `Desistir de ${pendingCount} tarefa(s) pendente(s)? Chewie vai julgar você.`,
    );
    if (ok) onGiveUpAll();
  }

  return (
    <section className="card tasks-card">
      <div className="tasks-head">
        <h2>tarefas</h2>
        <span className="pill small">{pendingCount} pendentes</span>
      </div>
      {tasks.length === 0 ? (
        <p className="task-empty">
          Sem tarefas. Nem o Chewie acredita nessa produtividade.
        </p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onPostpone={onPostpone}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
      <NewTaskForm onAdd={onAdd} />
      <button
        type="button"
        className="btn-desistir"
        onClick={handleGiveUp}
        disabled={pendingCount === 0}
      >
        🏳️ desistir
      </button>
    </section>
  );
}
