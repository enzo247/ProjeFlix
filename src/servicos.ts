import type { Contagem, Prioridade, Status, Tarefa } from "./tipos";
// ---------- filter e find: selecionar ----------
export function filtrarPorStatus(lista: Tarefa[], status: Status): Tarefa[] {
return lista.filter((t) => t.status === status);
}
// Pesquisa sem diferenciar maiúsculas de minúsculas
export function pesquisarPorTitulo(lista: Tarefa[], termo: string): Tarefa[] {
const procurado = termo.trim().toLowerCase();
return lista.filter((t) => t.titulo.toLowerCase().includes(procurado));
}
// ---------- some e every: perguntas de sim ou não ----------
export function existeAltaPendente(lista: Tarefa[]): boolean {
return lista.some((t) => t.prioridade === "alta" && t.status === "pendente");
}
export function todasConcluidas(lista: Tarefa[]): boolean {
return lista.length > 0 && lista.every((t) => t.status === "concluida");
}
// ---------- reduce: o painel calculado no navegador ----------
export function contarPorStatus(lista: Tarefa[]): Contagem {
return lista.reduce<Contagem>(
(acumulador, t) => {
acumulador[t.status]++;
return acumulador; // não esqueça este return!
},
{ pendente: 0, em_andamento: 0, concluida: 0 }
);
}
// ---------- sort: ordenar sem estragar o original ----------
const pesoPrioridade: Record<Prioridade, number> = { alta: 3, media: 2, baixa: 1 };
export function ordenarPorPrioridade(lista: Tarefa[]): Tarefa[] {
return [...lista].sort(
(a, b) => pesoPrioridade[b.prioridade] - pesoPrioridade[a.prioridade]
);
}