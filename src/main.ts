import { campo, elemento, selecao } from "./dom";
import { buscarTarefa, listarTarefas } from "./api";
import type { Prioridade, Tarefa } from "./tipos";
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
async function iniciar(): Promise<void> {
try {
lista = await listarTarefas();
desenhar();
} catch (erro) {
if (erro instanceof Error) {
elemento("erro").textContent = erro.message;
}
}
// find no banco: pode não encontrar
const procurada = await buscarTarefa(3);
if (procurada) {
console.log(`Encontrada: ${procurada.titulo}`);
} else {
console.log("Tarefa #3 não existe.");
}
}
iniciar();  