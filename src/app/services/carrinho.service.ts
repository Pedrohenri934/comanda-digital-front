import { Injectable, computed, signal } from '@angular/core';
import { ItemCarrinho, Prato } from '../models/api.models';

const CHAVE = 'comanda-digital:carrinho';

function ler(): ItemCarrinho[] {
  try {
    const raw = localStorage.getItem(CHAVE);
    const lista = raw ? JSON.parse(raw) : [];
    return Array.isArray(lista) ? lista : [];
  } catch { return []; }
}

function gravar(itens: ItemCarrinho[]): void {
  try { localStorage.setItem(CHAVE, JSON.stringify(itens)); } catch { /* sem storage: segue em memoria */ }
}

// Carrinho do cliente. Fica salvo no navegador para sobreviver ao login (o cliente monta o carrinho
// sem estar logado e so entra na hora de finalizar). O valor mostrado aqui e so uma estimativa:
// o total oficial do pedido e sempre calculado pelo back-end.
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  readonly itens = signal<ItemCarrinho[]>(ler());
  readonly quantidade = computed(() => this.itens().reduce((s, i) => s + i.quantidade, 0));
  readonly total = computed(() => this.itens().reduce((s, i) => s + i.precoVenda * i.quantidade, 0));

  private salvar(itens: ItemCarrinho[]): void {
    this.itens.set(itens);
    gravar(itens);
  }

  qtdDoPrato(pratoId: number): number {
    return this.itens().find(i => i.pratoId === pratoId)?.quantidade ?? 0;
  }

  adicionar(prato: Prato, quantidade = 1, observacoes = ''): void {
    const lista = this.itens();
    const existente = lista.find(i => i.pratoId === prato.id);
    if (existente) {
      const nova = Math.min(50, existente.quantidade + quantidade);
      const obs = observacoes.trim() || existente.observacoes;
      this.salvar(lista.map(i => i.pratoId === prato.id ? { ...i, quantidade: nova, observacoes: obs } : i));
    } else {
      this.salvar([...lista, {
        pratoId: prato.id, nome: prato.nome, precoVenda: prato.precoVenda, fotoUrl: prato.fotoUrl,
        quantidade: Math.min(50, quantidade), observacoes: observacoes.trim(),
      }]);
    }
  }

  alterarQuantidade(pratoId: number, quantidade: number): void {
    if (quantidade <= 0) { this.remover(pratoId); return; }
    this.salvar(this.itens().map(i => i.pratoId === pratoId ? { ...i, quantidade: Math.min(50, quantidade) } : i));
  }

  alterarObservacoes(pratoId: number, observacoes: string): void {
    this.salvar(this.itens().map(i => i.pratoId === pratoId ? { ...i, observacoes } : i));
  }

  remover(pratoId: number): void {
    this.salvar(this.itens().filter(i => i.pratoId !== pratoId));
  }

  limpar(): void {
    this.salvar([]);
  }
}
