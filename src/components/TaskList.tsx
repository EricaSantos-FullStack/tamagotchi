import type { Task } from "../types/task";
import { NewTaskForm } from "./NewTaskForm";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  pendingCount: number;
  onAdd: (nome: string, data_termino: string) => void;
  onComplete: (id: string) => void;
  onDefer: (id: string) => void;
  onGiveUp: (id: string) => void;
};

export function TaskList({
  tasks,
  pendingCount,
  onAdd,
  onComplete,
  onDefer,
  onGiveUp,
}: TaskListProps) {
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
              onComplete={onComplete}
              onDefer={onDefer}
              onGiveUp={onGiveUp}
            />
          ))}
        </ul>
      )}
      <NewTaskForm onAdd={onAdd} />
    </section>
  );
}
