export interface Task {
  id: string;
  nome: string;
  data_termino: string;
  concluida: boolean;
  vezes_adiada: number;
  desistiu: boolean;
  desculpa: string;
  criada_em: string;
}
