import { campo, elemento, selecao } from "./dom";
import { buscarTarefa, listarTarefas } from "./api";
import type { Prioridade, Status, Tarefa } from "./tipos";
import { adicionarTarefa } from "./servicos";
elemento("nome-do-sistema").textContent = "ProjeFLix";
elemento("versao").textContent = "v0.3.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");
// Começa vazia: quem preenche é a API (e por isso é let, não const)
let lista: Tarefa[] = [];
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
function desenhar(): void {
    // map: o seu transformar da Aula 2, que já vem pronto
    elemento("lista").replaceChildren(...lista.map(criarItem));
    // filter: só as que passam no teste
    const pendentes = lista.filter((t) => t.status === "pendente");
    elemento("total").textContent = String(lista.length);
    elemento("pendentes").textContent = String(pendentes.length);
}
// O cadastro ainda grava só na tela. Na Aula 4 ele vai para o banco.
12
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
        if (erro instanceof Error) {
            elemento("erro").textContent = erro.message;
        }
    }
});
// O começo do programa: busca no banco, depois desenha
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
elemento("form-entrar").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    try {
        guardarSessao(await entrar(campo("entrar-email").value, campo("entrar-senha").value));
        campo("entrar-senha").value = "";
        await iniciar();
    } catch (erro) {
        mostrarErroEntrada(erro);
    }
});
elemento("form-criar").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const email = campo("criar-email").value;
    const senha = campo("criar-senha").value;
    try {
        await criarConta(campo("criar-nome").value, email, senha);
        guardarSessao(await entrar(email, senha)); // criou? já entra direto
        (elemento("form-criar") as HTMLFormElement).reset(); // não deixa a senha no campo
        await iniciar();
    } catch (erro) {
        mostrarErroEntrada(erro);
        9
    }
});
elemento("botao-sair").addEventListener("click", () => {
    encerrarSessao();
    lista = [];
    (elemento("form-entrar") as HTMLFormElement).reset();
    mostrarFormulario(false); // volta sempre para "Entrar"
    iniciar();
});
// ---------- O começo: com sessão, mostra o sistema; sem, a entrada ----------
async function iniciar(): Promise<void> {
    const sessao = sessaoAtual();
    elemento("tela-entrada").hidden = sessao !== undefined;
    elemento("tela-app").hidden = sessao === undefined;
    elemento("botao-sair").hidden = sessao === undefined;
    elemento("usuario-nome").textContent = sessao?.nome ?? "";
    if (!sessao) {
        return;
    }
    elemento("erro-entrada").textContent = "";
    try {
        lista = await listarTarefas();
        desenhar();
    } catch (erro) {
        mostrarErro(erro);
    }
let statusSelecionado: Status | "todos" = "todos";
let termoDeBusca = "";
// as tags voltaram: cada uma vira um <span>
const tags = tarefa.tags.map((tag) => {
const elementoTag = document.createElement("span");
elementoTag.className = "tag";
elementoTag.textContent = tag;
return elementoTag;
});
meta.append(etiqueta, situacao, ...tags);
}
iniciar();
