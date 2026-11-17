import { campo, elemento, selecao } from "./dom";
import {
    buscarEstatisticas,
    criarConta,
    encerrarSessao,
    entrar,
    guardarSessao,
    listarTarefas,
    sessaoAtual,
} from "./api";
import type { Prioridade, Status, Tarefa } from "./tipos";
import {
    existeAltaPendente,
    filtrarPorStatus,
    ordenarPorPrioridade,
    pesquisarPorTitulo,
    todasConcluidas,
} from "./servicos";

elemento("nome-do-sistema").textContent = "ProjeFLix";
elemento("versao").textContent = "v0.3.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");

// Começa vazia: quem preenche é a API (e por isso é let, não const)
let lista: Tarefa[] = [];
let statusSelecionado: Status | "todos" = "todos";
let termoDeBusca = "";

function mostrarErro(erro: unknown): void {
    const mensagem = erro instanceof Error ? erro.message : "Erro inesperado.";
    elemento("erro").textContent = mensagem;
}

function criarItem(tarefa: Tarefa): HTMLLIElement {
    const item = document.createElement("li");
    item.className = `tarefa tarefa--${tarefa.prioridade}`;

    const titulo = document.createElement("h3");
    titulo.className = "tarefa__titulo";
    titulo.textContent = `#${tarefa.id} ${tarefa.titulo}`;

    const meta = document.createElement("div");
    meta.className = "tarefa__meta";

    const etiqueta = document.createElement("span");
    etiqueta.className = `etiqueta etiqueta--${tarefa.prioridade}`;
    etiqueta.textContent = tarefa.prioridade;

    const situacao = document.createElement("span");
    situacao.className = "etiqueta etiqueta--status";
    situacao.textContent = tarefa.status;

    // map de novo: cada tag vira um <span>
    const tags = tarefa.tags.map((tag) => {
        const elementoTag = document.createElement("span");
        elementoTag.className = "tag";
        elementoTag.textContent = tag;
        return elementoTag;
    });

    meta.append(etiqueta, situacao, ...tags);
    item.append(titulo, meta);
    return item;
}

// Quais tarefas mostrar: filtrar, pesquisar, ordenar.
// O filtro muda o que é MOSTRADO, nunca a lista que existe.
function tarefasVisiveis(): Tarefa[] {
    let resultado = lista;
    if (statusSelecionado !== "todos") {
        resultado = filtrarPorStatus(resultado, statusSelecionado);
    }
    if (termoDeBusca.trim() !== "") {
        resultado = pesquisarPorTitulo(resultado, termoDeBusca);
    }
    return ordenarPorPrioridade(resultado);
}

// O painel vem pronto do banco (GROUP BY)
async function atualizarPainel(): Promise<void> {
    const contagem = await buscarEstatisticas();
    const total = contagem.pendente + contagem.em_andamento + contagem.concluida;
    elemento("total").textContent = String(total);
    elemento("pendentes").textContent = String(contagem.pendente);
    elemento("em-andamento").textContent = String(contagem.em_andamento);
    elemento("concluidas").textContent = String(contagem.concluida);
}

function desenhar(): void {
    const visiveis = tarefasVisiveis();
    elemento("lista").replaceChildren(...visiveis.map(criarItem));
    elemento("vazio").hidden = visiveis.length > 0;

    // some: existe pelo menos uma urgente pendente?
    elemento("aviso-urgente").classList.toggle("aviso--oculto", !existeAltaPendente(lista));

    // every: todas concluídas?
    if (todasConcluidas(lista)) {
        console.log("Parabéns: nenhuma tarefa em aberto!");
    }

    atualizarPainel().catch(mostrarErro);
}

// O cadastro ainda grava só na tela. Na Aula 4 ele vai para o banco.
elemento("formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();
    elemento("erro").textContent = "";
    try {
        adicionarTarefa(lista, {
            titulo: campo("titulo").value.trim(),
            prioridade: selecao("prioridade").value as Prioridade,
            tags: [],
        });
        campo("titulo").value = "";
        desenhar();
    } catch (erro) {
        mostrarErro(erro);
    }
});

// Os botões de filtro: um só "ouvinte" para o grupo inteiro
elemento("filtros-status").addEventListener("click", (evento) => {
    const alvo = evento.target;
    if (!(alvo instanceof HTMLButtonElement)) return;
    const escolhido = alvo.dataset.status;
    if (!escolhido) return;

    statusSelecionado = escolhido as Status | "todos";
    for (const b of elemento("filtros-status").querySelectorAll("button")) {
        b.classList.toggle("filtro--ativo", b === alvo);
    }
    desenhar();
});

// A busca filtra enquanto o usuário digita
campo("busca").addEventListener("input", () => {
    termoDeBusca = campo("busca").value;
    desenhar();
});

// ---------- A tela de entrada (Aula 5) ----------
function mostrarErroEntrada(erro: unknown): void {
    const mensagem = erro instanceof Error ? erro.message : "Erro inesperado.";
    elemento("erro-entrada").textContent = mensagem;
}

// Troca entre "Entrar" e "Criar conta"
function mostrarFormulario(criando: boolean): void {
    elemento("form-criar").hidden = !criando;
    elemento("form-entrar").hidden = criando;
    elemento("alternar-entrada").textContent = criando
        ? "Já tenho conta"
        : "Ainda não tenho conta";
    elemento("erro-entrada").textContent = "";
}

elemento("alternar-entrada").addEventListener("click", () => {
    mostrarFormulario(elemento("form-criar").hidden === true); // escondido? então mostra
});

elemento("form-entrar").addEventListener("submit", async (evento) => { });

function adicionarTarefa(
    tarefas: Tarefa[],
    dados: Pick<Tarefa, "titulo" | "prioridade" | "tags">,
): void {
    const novoId = tarefas.reduce((maiorId, tarefa) => Math.max(maiorId, tarefa.id), 0) + 1;
    tarefas.push({
    id: novoId,
    titulo: dados.titulo,
    prioridade: dados.prioridade,
    status: "pendente",
    tags: dados.tags,
    });
}
 