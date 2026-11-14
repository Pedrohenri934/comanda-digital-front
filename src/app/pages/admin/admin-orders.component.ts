import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GestaoPedidoService, mensagemDePedido } from '../../services/gestao-pedido.service';
import { PedidoGestao, StatusPedido } from '../../models/api.models';
import { STATUS_INFO, dataHora, moeda } from '../../models/status-pedido';
import { mensagemDeErro } from '../../services/auth.service';

const FLUXO: StatusPedido[] = ['RECEBIDO', 'CONFIRMADO', 'EM_PREPARO', 'PRONTO', 'SAIU_ENTREGA', 'FINALIZADO'];

@Component({ selector:'app-admin-orders', standalone:true, imports:[FormsModule], template:`
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="mb-6"><h1 class="text-white text-2xl font-semibold">Pedidos</h1><p class="text-neutral-400 text-sm mt-1">{{pedidos().length}} pedido(s) {{filtro()==='todos' ? 'no total' : 'neste filtro'}}</p></div>
  <div class="flex gap-2 overflow-x-auto pb-2 mb-6">
    <button (click)="filtrar('todos')" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors" [class]="filtro()==='todos'?'bg-red-800 text-white':'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">Todos</button>
    @for(st of todos; track st){
      <button (click)="filtrar(st)" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors" [class]="filtro()===st?'bg-red-800 text-white':'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">{{info[st].label}}</button>
    }
  </div>
  @if(erroGeral()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erroGeral()}}</div>}
  <div class="space-y-3">
    @if(carregando()){<p class="text-center py-12 text-neutral-500">Carregando...</p>}
    @else if(pedidos().length===0){<div class="text-center py-12 text-neutral-500">Nenhum pedido encontrado</div>}
    @for(p of pedidos(); track p.id){
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden">
        <button class="w-full p-4 flex items-center gap-4 text-left" (click)="aberto.set(aberto()===p.id?null:p.id)">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-white font-mono text-sm">#{{p.id}}</span>
              <span class="text-xs px-2 py-0.5 rounded-lg border" [class]="info[p.status].color">{{info[p.status].label}}</span>
            </div>
            <p class="text-neutral-300 text-sm">{{p.clienteNome}}</p>
            <p class="text-neutral-500 text-xs mt-1">{{data(p.criadoEm)}}</p>
          </div>
          <div class="text-right flex-shrink-0"><p class="text-red-400 font-bold">{{moeda(p.valorTotal)}}</p><p class="text-neutral-500 text-xs">{{p.itens.length}} item(ns)</p></div>
          <span class="text-neutral-500 text-sm">{{aberto()===p.id?'▲':'▼'}}</span>
        </button>
        @if(aberto()===p.id){
          <div class="border-t border-neutral-800 p-4 space-y-4">
            <div><p class="text-neutral-400 text-xs mb-2">ITENS</p>
              @for(i of p.itens; track i.pratoId){
                <div class="flex justify-between text-sm py-1"><span class="text-neutral-300">{{i.pratoNome}} ×{{i.quantidade}}@if(i.observacoes){ <span class="text-yellow-500/80 text-xs">({{i.observacoes}})</span>}</span><span class="text-neutral-400">{{moeda(i.subtotal)}}</span></div>
              }
            </div>
            <div><p class="text-neutral-400 text-xs mb-1">📍 ENTREGA</p>
              <p class="text-neutral-300 text-sm">{{p.enderecoEntrega}}</p>
              @if(p.clienteTelefone){<p class="text-neutral-500 text-xs">Tel.: {{p.clienteTelefone}}</p>}
              @if(p.observacoes){<p class="text-neutral-500 text-xs">Obs.: {{p.observacoes}}</p>}
            </div>
            @if(p.status==='CANCELADO'){<p class="text-red-400 text-sm">Cancelado: {{p.motivoCancelamento}}</p>}
            @if(erros()[p.id]){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg px-3 py-2 text-xs">{{erros()[p.id]}}</div>}
            @if(proximo(p.status); as prox){
              <div class="flex flex-wrap items-end gap-2">
                <button (click)="mudar(p, prox)" class="px-4 py-2 rounded-xl text-sm bg-red-800 hover:bg-red-700 text-white">Avançar para: {{info[prox].label}}</button>
                <div class="flex items-center gap-2 ml-auto">
                  <input [(ngModel)]="motivo" placeholder="Motivo do cancelamento" maxlength="255" class="bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/>
                  @if(p.status!=='SAIU_ENTREGA'){<button (click)="cancelar(p)" class="px-4 py-2 rounded-xl text-sm border border-red-800 text-red-400 hover:bg-red-900/30">Cancelar pedido</button>}
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  </div>
</div>` })
export class AdminOrdersComponent implements OnInit, OnDestroy {
  private api = inject(GestaoPedidoService);
  info = STATUS_INFO; moeda = moeda; data = dataHora;
  todos: StatusPedido[] = [...FLUXO, 'CANCELADO'];
  pedidos = signal<PedidoGestao[]>([]);
  filtro = signal<StatusPedido | 'todos'>('todos');
  aberto = signal<number | null>(null);
  carregando = signal(true);
  erroGeral = signal('');
  erros = signal<Record<number, string>>({});
  motivo = '';
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() { this.carregar(); this.timer = setInterval(() => this.carregar(), 15000); }
  ngOnDestroy() { clearInterval(this.timer); }

  filtrar(f: StatusPedido | 'todos') { this.filtro.set(f); this.carregando.set(true); this.carregar(); }

  carregar() {
    const f = this.filtro();
    this.api.listar(f === 'todos' ? [] : [f], 0, 100, 'createdAt,desc').subscribe({
      next: pg => { this.pedidos.set(pg.content); this.erroGeral.set(''); this.carregando.set(false); },
      error: e => { this.erroGeral.set(mensagemDeErro(e, 'Não foi possível carregar os pedidos.')); this.carregando.set(false); },
    });
  }

  proximo(st: StatusPedido): StatusPedido | null { const i = FLUXO.indexOf(st); return i >= 0 && i < FLUXO.length - 1 ? FLUXO[i + 1] : null; }

  mudar(p: PedidoGestao, novo: StatusPedido, motivo?: string) {
    this.erros.update(m => ({ ...m, [p.id]: '' }));
    this.api.alterarStatus(p.id, novo, motivo).subscribe({
      next: () => { this.motivo = ''; this.carregar(); },
      error: e => this.erros.update(m => ({ ...m, [p.id]: mensagemDePedido(e) })),
    });
  }

  cancelar(p: PedidoGestao) {
    if (!this.motivo.trim()) { this.erros.update(m => ({ ...m, [p.id]: 'Informe o motivo do cancelamento.' })); return; }
    this.mudar(p, 'CANCELADO', this.motivo.trim());
  }
}
