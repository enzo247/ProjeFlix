export function elemento(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} não encontrado`);
  return el;
}

export function campo(id: string): HTMLInputElement {
  return elemento(id) as HTMLInputElement;
}

export function selecao(id: string): HTMLSelectElement {
  return elemento(id) as HTMLSelectElement;
}