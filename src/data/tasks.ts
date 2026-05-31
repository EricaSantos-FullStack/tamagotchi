import type { Task } from "../types/task";

export const initialTasks: Task[] = [
  { id: "readme", name: "fazer o README do projeto", done: true },
  { id: "pr-review", name: "revisar o pull request", count: 3 },
  { id: "tests", name: "escrever testes unitários", count: 7 },
  { id: "login-bug", name: "corrigir bug do login", count: 1 },
  { id: "deploy", name: "deploy em produção" },
];
