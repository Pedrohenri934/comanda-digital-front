import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, mensagemDeErro } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { Pedido, StatusPedido } from '../../models/api.models';
import { STATUS_INFO, dataHora, emAndamento, moeda } from '../../models/status-pedido';

@Component({ selector:'app-client-orders', standalone:true, imports:[FormsModule], template:`
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-neutral-800/50 px-4 py-3">
    <div class="max-w-5xl mx-auto flex items-center gap-4">
      <button (click)="r.navigateByUrl('/cliente/cardapio')" class="text-neutral-400 hover:text-white text-sm" aria-label="Voltar ao cardápio">←</button>
      <span class="text-red-500 text-xl">🔥</span>
      <span class="text-white font-semibold">Meus Pedidos</span>
      <span class="ml-auto text-neutral-500 text-sm hidden sm:block">{{auth.usuario()?.nome}}</span>
      <button (click)="auth.logout('/cliente/cardapio')" class="text-xs text-neutral-500 hover:text-red-400">Sair</button>
    </div>
  </header>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-4"><p class="text-neutral-400 text-sm mb-1">Total</p><p class="text-white text-2xl font-bold">{{pedidos().length}}</p></div>
      <div class="bg-[#141414] border border-orange-900/30 rounded-xl p-4"><p class="text-orange-400 text-sm mb-1">Em andamento</p><p class="text-white text-2xl font-bold">{{andamento()}}</p></div>
      <div class="bg-[#141414] border border-green-900/30 rounded-xl p-4"><p class="text-green-400 text-sm mb-1">Entregues</p><p class="text-white text-2xl font-bold">{{contar('FINALIZADO')}}</p></div>
      <div class="bg-[#141414] border border-red-900/30 rounded-xl p-4"><p class="text-red-400 text-sm mb-1">Cancelados</p><p class="text-white text-2xl font-bold">{{contar('CANCELADO')}}</p></div>
    </div>
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <input [(ngModel)]="buscaTexto" (ngModelChange)="busca.set($event)" placeholder="Buscar pelo número do pedido..."
        class="flex-1 bg-[#1a1a1a] border border-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/>
      <div class="flex gap-2 overflow-x-auto pb-1">
        @for(f of filtros; track f.key){
          <button (click)="filtro.set(f.key)" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors border"
            [class]="filtro()===f.key?'bg-red-800 text-white border-red-700':'bg-[#1a1a1a] text-neutral-400 hover:text-white border-neutral-800'">{{f.label}}</button>
        }
      </div>
    </div>

    @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}} <button (click)="carregar()" class="underline ml-2">Tentar de novo</button></div>}

    @if(carregando()){
      <div class="text-center py-16 text-neutral-500">Carregando pedidos...</div>
    } @else if(filtrados().length===0 && !erro()){
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-12 text-center">
        <p class="text-neutral-400 mb-4">Nenhum pedido encontrado</p>
        <button (click)="r.navigateByUrl('/cliente/cardapio')" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-6 py-2.5 text-sm">Ver Cardápio</button>
      </div>
    } @else {
      <div class="space-y-3">
        @for(p of filtrados(); track p.id){
          <button (click)="r.navigateByUrl('/cliente/pedido/'+p.id)" class="block w-full text-left bg-[#141414] border border-neutral-800 hover:border-red-900/50 rounded-2xl p-5 transition-all group">
            <div class="flex items-start justify-between gap-4 mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <p class="text-white font-medium">Pedido #{{p.id}}</p>
                  <span class="px-2.5 py-1 rounded-lg text-xs border" [class]="info[p.status].color">{{info[p.status].label}}</span>
                </div>
                <p class="text-neutral-500 text-sm">{{data(p.criadoEm)}}</p>
              </div>
              <p class="text-red-400 font-bold text-lg">{{moeda(p.valorTotal)}}</p>
            </div>
            <p class="text-neutral-300 text-sm line-clamp-2">{{resumo(p)}}</p>
            @if(p.enderecoEntrega){<p class="text-neutral-500 text-sm line-clamp-1 mt-1">📍 {{p.enderecoEntrega}}</p>}
            <p class="text-red-400 text-sm mt-2 group-hover:text-red-300">Ver detalhes e acompanhar →</p>
          </button>
        }
      </div>
    }
  </div>
</div>` })
export class ClientOrdersComponent implements OnInit {
  auth = inject(AuthService);
  r = inject(Router);
  private api = inject(PedidoService);

  info = STATUS_INFO; moeda = moeda; data = dataHora;
  pedidos = signal<Pedido[]>([]);
  carregando = signal(true);
  erro = signal('');
  filtro = signal<StatusPedido | 'todos' | 'andamento'>('todos');
  busca = signal(''); buscaTexto = '';
  filtros = [
    { key: 'todos' as const, label: 'Todos' },
    { key: 'andamento' as const, label: 'Em andamento' },
    { key: 'FINALIZADO' as const, label: 'Entregues' },
    { key: 'CANCELADO' as const, label: 'Cancelados' },
  ];

  filtrados = computed(() => {
    const f = this.filtro(); const q = this.busca().trim().replace('#', '');
    return this.pedidos()
      .filter(p => f === 'todos' || (f === 'andamento' ? emAndamento(p.status) : p.status === f))
      .filter(p => !q || String(p.id).includes(q));
  });
  andamento = computed(() => this.pedidos().filter(p => emAndamento(p.status)).length);

  ngOnInit() { this.carregar(); }

  carregar() {
    this.carregando.set(true); this.erro.set('');
    this.api.meus(0, 50).subscribe({
      next: pg => { this.pedidos.set(pg.content); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e, 'Não foi possível carregar seus pedidos.')); this.carregando.set(false); },
    });
  }

  contar(s: StatusPedido) { return this.pedidos().filter(p => p.status === s).length; }
  resumo(p: Pedido) { return p.itens.map(i => `${i.quantidade}× ${i.pratoNome}`).join(', '); }
}
