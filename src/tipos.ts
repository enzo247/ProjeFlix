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
// NOVO: quem está logado. A API devolve isto no login.
export interface Sessao {
token: string;
nome: string;
}
// NOVO: os números do painel. Record garante que as três chaves existam.
export type Contagem = Record<Status, number>;
export type NovaTarefa = Omit<Tarefa, "id" | "status" | "criadaEm">;