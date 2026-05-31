import type { Task } from "../types/task";

type TaskItemProps = {
  task: Task;
  onComplete: (id: string) => void;
  onDefer: (id: string) => void;
  onGiveUp: (id: string) => void;
};

export function TaskItem({ task, onComplete, onDefer, onGiveUp }: TaskItemProps) {
  return (
    <li className={`task${task.concluida ? " done" : ""}`}>
      <span className={`checkbox${task.concluida ? " checked" : ""}`}>
        {task.concluida ? "✓" : ""}
      </span>
      <span className="task-name">
        {task.nome}
        {task.vezes_adiada > 0 ? <em className="x"> ×{task.vezes_adiada}</em> : null}
      </span>
      {!task.concluida && (
        <span className="task-actions">
          <button
            type="button"
            className="btn-concluir"
            onClick={() => onComplete(task.id)}
          >
            ✓ concluir
          </button>
          <button
            type="button"
            className="btn-adiar"
            onClick={() => onDefer(task.id)}
          >
            adiar
          </button>
          <button
            type="button"
            className="btn-desistir-task"
            onClick={() => onGiveUp(task.id)}
            aria-label={`desistir da tarefa: ${task.nome}`}
            title="desistir desta tarefa"
          >
            🏳️
          </button>
        </span>
      )}
    </li>
  );
}
