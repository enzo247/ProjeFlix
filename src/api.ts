import type { Contagem, NovaTarefa, Sessao, Status, Tarefa } from "./tipos";

const CHAVE_SESSAO = "taskflow:sessao";

// ---------- A sessão: o "crachá" guardado no navegador ----------
export function sessaoAtual(): Sessao | undefined {
    const texto = localStorage.getItem(CHAVE_SESSAO);
    return texto ? (JSON.parse(texto) as Sessao) : undefined;
}

export function guardarSessao(sessao: Sessao): void {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

export function encerrarSessao(): void {
    localStorage.removeItem(CHAVE_SESSAO);
}

// A ajudante agora mostra o crachá em todo pedido
async function enviar(metodo: string, url: string, corpo?: unknown): Promise<Response> {
    const sessao = sessaoAtual();
    const resposta = await fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            ...(sessao ? { Authorization: `Bearer ${sessao.token}` } : {}),
        },
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });

    // crachá vencido ou inválido: volta para a tela de entrada
    if (resposta.status === 401 && sessao) {
        encerrarSessao();
        location.reload();
    }

    if (!resposta.ok) {
        // a API manda { erro: "..." }; se não mandar, usamos o código
        const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };
        // 502/504: o Vite não achou a API na porta 3000 — ela não está rodando
        const semApi = resposta.status === 502 || resposta.status === 504;
        throw new Error(dados.erro ?? (semApi
            ? "A API não respondeu. Rode npm run dev na pasta api."
            : `Erro ${resposta.status}`));
    }

    return resposta;
}

// ---------- Usuários ----------
export async function entrar(email: string, senha: string): Promise<Sessao> {
    const resposta = await enviar("POST", "/api/login", { email, senha });
    return (await resposta.json()) as Sessao;
}

export async function criarConta(nome: string, email: string, senha: string): Promise<void> {
    await enviar("POST", "/api/usuarios", { nome, email, senha });
} // <--- Faltava fechar a criarConta aqui

// NOVO: os números do painel, calculados pelo banco com GROUP BY
export async function buscarEstatisticas(): Promise<Contagem> {
    const resposta = await enviar("GET", "/api/estatisticas");
    return (await resposta.json()) as Contagem;
}