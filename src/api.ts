import type { Tarefa } from "./tipos";
// Todas as tarefas que estão no banco
export async function listarTarefas(): Promise<Tarefa[]> {
    const resposta = await fetch("/api/tarefas");
    if (!resposta.ok) {
        throw new Error("Não foi possível carregar as tarefas. A API está rodando?");
    }
    const bruto = (await resposta.json()) as Tarefa[];
    // JSON não tem data: criadaEm chega como texto e precisa virar Date
    return bruto.map((t) => ({ ...t, criadaEm: new Date(t.criadaEm) }));
}
// Uma tarefa: devolve undefined se ela não existir (o mesmo padrão do find)
export async function buscarTarefa(id: number): Promise<Tarefa | undefined> {
    const resposta = await fetch(`/api/tarefas/${id}`);
    if (resposta.status === 404) {
        return undefined;
        11
    }
    if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status} ao buscar a tarefa #${id}.`);
    }
    const bruto = (await resposta.json()) as Tarefa;
    return { ...bruto, criadaEm: new Date(bruto.criadaEm) };
}
