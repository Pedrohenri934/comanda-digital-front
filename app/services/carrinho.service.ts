import { Injectable, computed, signal } from '@angular/core';
import { EscolhaCarrinho, ItemCarrinho, Prato } from '../models/api.models';

const CHAVE = 'comanda-digital:carrinho';

function ler(): ItemCarrinho[] {
  try {
    const raw = localStorage.getItem(CHAVE);
    const lista = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(lista)) return [];
    // Carrinho salvo por uma versao antiga nao tem chave nem escolhas.
    return lista.map((i: ItemCarrinho) => ({ ...i, chave: i.chave ?? String(i.pratoId), escolhas: i.escolhas ?? [] }));
  } catch { return []; }
}

function gravar(itens: ItemCarrinho[]): void {
  try { localStorage.setItem(CHAVE, JSON.stringify(itens)); } catch { /* sem storage: segue em memoria */ }
}

// Carrinho do cliente. Fica salvo no navegador para sobreviver ao login (o cliente monta o carrinho
// sem estar logado e so entra na hora de finalizar). O valor mostrado aqui e so uma estimativa:
// o total oficial do pedido e sempre calculado pelo back-end.
// Cada linha e identificada pela "chave": o mesmo combo com escolhas diferentes vira linhas separadas.
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
    return this.itens().filter(i => i.pratoId === pratoId).reduce((s, i) => s + i.quantidade, 0);
  }

  adicionar(prato: Prato, quantidade = 1, observacoes = '', escolhas: EscolhaCarrinho[] = []): void {
    const chave = [prato.id, ...escolhas.map(e => e.opcaoId).sort((a, b) => a - b)].join('-');
    const acrescimo = escolhas.reduce((s, e) => s + e.acrescimo, 0);
    const lista = this.itens();
    const existente = lista.find(i => i.chave === chave);
    if (existente) {
      const nova = Math.min(50, existente.quantidade + quantidade);
      const obs = observacoes.trim() || existente.observacoes;
      this.salvar(lista.map(i => i.chave === chave ? { ...i, quantidade: nova, observacoes: obs } : i));
    } else {
      this.salvar([...lista, {
        chave, escolhas, pratoId: prato.id, nome: prato.nome, precoVenda: prato.precoVenda + acrescimo, fotoUrl: prato.fotoUrl,
        quantidade: Math.min(50, quantidade), observacoes: observacoes.trim(),
      }]);
    }
  }

  alterarQuantidade(chave: string, quantidade: number): void {
    if (quantidade <= 0) { this.remover(chave); return; }
    this.salvar(this.itens().map(i => i.chave === chave ? { ...i, quantidade: Math.min(50, quantidade) } : i));
  }

  alterarObservacoes(chave: string, observacoes: string): void {
    this.salvar(this.itens().map(i => i.chave === chave ? { ...i, observacoes } : i));
  }

  remover(chave: string): void {
    this.salvar(this.itens().filter(i => i.chave !== chave));
  }

  limpar(): void {
    this.salvar([]);
  }
}
