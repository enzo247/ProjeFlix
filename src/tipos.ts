export type Prioridade = "baixa" | "media" | "alta";
export type Status = "pendente" | "em_andamento" | "concluida";
export interface Tarefa {
readonly id: number;
titulo: string;
descricao?: string | null;
prioridade: Prioridade;
status: Status;
tags: string[];
criadaEm: Date;
prazo?: string | null;
}
export type NovaTarefa = Omit<Tarefa, "id" | "status" | "criadaEm">;