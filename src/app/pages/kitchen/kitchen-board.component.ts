import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { GestaoPedidoService, mensagemDePedido } from '../../services/gestao-pedido.service';
import { PedidoGestao, StatusPedido } from '../../models/api.models';
import { STATUS_INFO } from '../../models/status-pedido';
import { mensagemDeErro } from '../../services/auth.service';

const ATIVOS: StatusPedido[] = ['RECEBIDO', 'CONFIRMADO', 'EM_PREPARO', 'PRONTO'];
const ACAO: Partial<Record<StatusPedido, { proximo: StatusPedido; texto: string; cor: string }>> = {
  RECEBIDO:   { proximo: 'CONFIRMADO',   texto: 'Confirmar pedido',      cor: 'bg-blue-700 hover:bg-blue-600' },
  CONFIRMADO: { proximo: 'EM_PREPARO',   texto: 'Iniciar preparo',       cor: 'bg-yellow-700 hover:bg-yellow-600' },
  EM_PREPARO: { proximo: 'PRONTO',       texto: 'Marcar como pronto',    cor: 'bg-green-700 hover:bg-green-600' },
  PRONTO:     { proximo: 'SAIU_ENTREGA', texto: 'Saiu para entrega',     cor: 'bg-purple-700 hover:bg-purple-600' },
};

// Quadro da cozinha: pedidos ativos, do mais antigo para o mais novo, atualizando a cada 10 s.
// Confirmar o pedido (RECEBIDO > CONFIRMADO) e o que da baixa no estoque; se faltar insumo a API responde 422.
@Component({ selector:'app-kitchen-board', standalone:true, template:`
<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
  @for(st of ativos; track st){
    <div class="bg-[#141414] border border-neutral-800 rounded-xl p-4 text-center">
      <p class="text-white text-3xl font-bold">{{contar(st)}}</p>
      <p class="text-neutral-400 text-sm mt-1">{{info[st].label}}</p>
    </div>
  }
</div>

@if(erroGeral()){
  <div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erroGeral()}}</div>
}

@if(carregando()){
  <p class="text-center py-16 text-neutral-500">Carregando pedidos...</p>
} @else if(pedidos().length===0 && !erroGeral()){
  <div class="text-center py-20"><p class="text-4xl mb-3">✅</p><p class="text-neutral-400 text-lg">Nenhum pedido pendente</p></div>
} @else {
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    @for(p of pedidos(); track p.id){
      <div class="bg-[#141414] rounded-2xl overflow-hidden border" [class]="urgencia(p.criadoEm)">
        <div class="p-4 border-b border-neutral-800">
          <div class="flex items-center justify-between mb-1">
            <span class="text-white font-mono text-sm">#{{p.id}}</span>
            <span class="text-xs px-2 py-1 rounded-lg border" [class]="info[p.status].color">{{info[p.status].label}}</span>
          </div>
          <p class="text-neutral-300 text-sm">{{p.clienteNome}}</p>
          <p class="text-neutral-500 text-xs mt-1">⏱ {{ha(p.criadoEm)}}</p>
        </div>
        <div class="p-4">
          @for(i of p.itens; track i.pratoId){
            <div class="mb-2">
              <div class="flex justify-between text-sm"><span class="text-neutral-300">{{i.pratoNome}}</span><span class="text-neutral-500">×{{i.quantidade}}</span></div>
              @if(i.observacoes){<p class="text-yellow-500/80 text-xs">Obs.: {{i.observacoes}}</p>}
            </div>
          }
          @if(p.observacoes){<p class="text-yellow-500/80 text-xs mb-2">Obs. do pedido: {{p.observacoes}}</p>}
          @if(erros()[p.id]){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg px-3 py-2 text-xs mb-2">{{erros()[p.id]}}</div>}
          @if(acao[p.status]; as a){
            <button (click)="avancar(p, a.proximo)" [disabled]="enviando()===p.id" class="w-full text-white rounded-xl py-2.5 text-sm transition-colors mt-1 disabled:opacity-50" [class]="a.cor">
              {{enviando()===p.id ? 'Enviando...' : a.texto}}
            </button>
          }
        </div>
      </div>
    }
  </div>
}` })
export class KitchenBoardComponent implements OnInit, OnDestroy {
  private api = inject(GestaoPedidoService);
  info = STATUS_INFO; ativos = ATIVOS; acao = ACAO;

  pedidos = signal<PedidoGestao[]>([]);
  carregando = signal(true);
  erroGeral = signal('');
  enviando = signal<number | null>(null);
  erros = signal<Record<number, string>>({});
  total = computed(() => this.pedidos().length);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.carregar();
    this.timer = setInterval(() => { if (this.enviando() === null) this.carregar(); }, 10000);
  }
  ngOnDestroy() { clearInterval(this.timer); }

  carregar() {
    this.api.listar(ATIVOS).subscribe({
      next: pg => { this.pedidos.set(pg.content); this.erroGeral.set(''); this.carregando.set(false); },
      error: e => { this.erroGeral.set(mensagemDeErro(e, 'Não foi possível carregar os pedidos.')); this.carregando.set(false); },
    });
  }

  avancar(p: PedidoGestao, novo: StatusPedido) {
    this.enviando.set(p.id);
    this.erros.update(m => ({ ...m, [p.id]: '' }));
    this.api.alterarStatus(p.id, novo).subscribe({
      next: () => { this.enviando.set(null); this.carregar(); },
      error: e => { this.enviando.set(null); this.erros.update(m => ({ ...m, [p.id]: mensagemDePedido(e) })); },
    });
  }

  contar(st: StatusPedido) { return this.pedidos().filter(p => p.status === st).length; }
  private minutos(iso: string) { return Math.floor((Date.now() - new Date(iso).getTime()) / 60000); }
  ha(iso: string) { const m = this.minutos(iso); return m < 1 ? 'Agora' : m < 60 ? `${m} min atrás` : `${Math.floor(m / 60)}h${m % 60}min atrás`; }
  urgencia(iso: string) { const m = this.minutos(iso); return m > 30 ? 'border-red-700/70' : m > 15 ? 'border-yellow-700/70' : 'border-neutral-800'; }
}
