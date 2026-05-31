import { useEffect, useRef, useState } from "react";

type NewTaskFormProps = {
  onAdd: (name: string) => void;
};

export function NewTaskForm({ onAdd }: NewTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setOpen(false);
      return;
    }
    onAdd(trimmed);
    setValue("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn-nova"
        onClick={() => setOpen(true)}
      >
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
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setValue("");
            setOpen(false);
          }
        }}
        maxLength={80}
      />
      <button type="submit" className="btn-nova-confirm">
        adicionar
      </button>
    </form>
  );
}
