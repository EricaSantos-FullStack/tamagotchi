import type { Task } from "../types/task";

type TaskItemProps = {
  task: Task;
  onPostpone: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TaskItem({ task, onPostpone, onRemove }: TaskItemProps) {
  const showDash = !task.count;

  return (
    <li className={`task${task.done ? " done" : ""}`}>
      <span className={`checkbox${task.done ? " checked" : ""}`}>
        {task.done ? "✓" : ""}
      </span>
      <span className="task-name">
        {task.name}
        {task.count ? <em className="x"> ×{task.count}</em> : null}
        {showDash ? <span className="task-dash"> —</span> : null}
      </span>
      {!task.done && (
        <span className="task-actions">
          <button
            type="button"
            className="btn-adiar"
            onClick={() => onPostpone(task.id)}
          >
            adiar
          </button>
          <button
            type="button"
            className="btn-desistir-task"
            onClick={() => onRemove(task.id)}
            aria-label={`desistir da tarefa: ${task.name}`}
            title="desistir desta tarefa"
          >
            🏳️
          </button>
        </span>
      )}
    </li>
  );
}
