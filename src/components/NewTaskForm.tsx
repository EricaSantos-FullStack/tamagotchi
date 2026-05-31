import { useEffect, useRef, useState } from "react";

type NewTaskFormProps = {
  onAdd: (nome: string, data_termino: string) => void;
};

export function NewTaskForm({ onAdd }: NewTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nome.trim();
    if (!trimmed || !dataTermino) return;
    onAdd(trimmed, dataTermino);
    setNome("");
    setDataTermino("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" className="btn-nova" onClick={() => setOpen(true)}>
        + nova tarefa
      </button>
    );
  }

  return (
    <form className="new-task-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="new-task-input"
        placeholder="o que vai procrastinar hoje?"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setNome(""); setOpen(false); }
        }}
        maxLength={80}
      />
      <input
        type="datetime-local"
        className="new-task-input"
        value={dataTermino}
        onChange={(e) => setDataTermino(e.target.value)}
        required
      />
      <button type="submit" className="btn-nova-confirm">
        adicionar
      </button>
    </form>
  );
}
