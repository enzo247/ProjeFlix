import type { Tarefa } from "./tipos";
export const tarefas: Tarefa[] = [
{ id: 1, titulo: "Coraline", prioridade: "alta", status: "pendente",
tags: ["estudo", "ts"], criadaEm: new Date() },
{ id: 2, titulo: "Crepusculo", prioridade: "baixa", status: "concluida",
tags: ["casa"], criadaEm: new Date() },
{ id: 3, titulo: "Teste", descricao: "PR #42", prioridade: "alta",
status: "em_andamento", tags: ["trabalho"], criadaEm: new Date() },
{ id: 4, titulo: "Carros", prioridade: "media", status: "pendente",
tags: ["estudo", "ts"], criadaEm: new Date() },
{ id: 5, titulo: "Velozes e Furiosos", prioridade: "media", status: "pendente",
tags: ["saude"], criadaEm: new Date() },
{ id: 6, titulo: "Mexico", prioridade: "baixa", status: "pendente",
tags: ["casa"], criadaEm: new Date() },
];