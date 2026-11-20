import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, mensagemDeErro } from '../../services/auth.service';
import { EntregadorService } from '../../services/entregador.service';
import { mensagemDePedido } from '../../services/gestao-pedido.service';
import { Entrega, PerfilEntregador } from '../../models/api.models';
import { moeda } from '../../models/status-pedido';

// Painel do entregador: fica online, aceita pedidos PRONTOS e confirma a entrega. Atualiza a cada 10 s.
@Component({
  selector: 'app-delivery-panel',
  standalone: true,
  template: `
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-10 bg-[#111111] border-b border-neutral-800 px-4 py-3">
    <div class="max-w-2xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-1.5 bg-amber-900/40 rounded-lg border border-amber-800/50 text-xl leading-none">🛵</div>
        <div>
          <h1 class="text-white font-semibold">Painel do Entregador</h1>
          <p class="text-neutral-500 text-xs">{{perfil()?.nome}} @if(perfil()){· {{perfil()!.veiculo}}}</p>
        </div>
      </div>
      <button (click)="sair()" class="text-neutral-400 hover:text-red-400 transition-colors text-sm">Sair</button>
    </div>
  </header>

  <div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
    @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm">{{erro()}}</div>}

    @if(perfil(); as p){
      @if(p.statusCadastro==='PENDENTE'){
        <div class="bg-yellow-900/20 border border-yellow-700/40 rounded-2xl p-6 text-center">
          <p class="text-3xl mb-2">⏰</p>
          <p class="text-yellow-300 font-medium">Cadastro em análise</p>
          <p class="text-neutral-400 text-sm mt-1">O administrador ainda precisa aprovar o seu cadastro. Volte mais tarde.</p>
        </div>
      } @else if(p.statusCadastro==='RECUSADO'){
        <div class="bg-red-900/20 border border-red-800/40 rounded-2xl p-6 text-center">
          <p class="text-3xl mb-2">🚫</p>
          <p class="text-red-300 font-medium">Cadastro não aprovado</p>
          <p class="text-neutral-400 text-sm mt-1">Fale com o administrador do restaurante.</p>
        </div>
      } @else {
        <div class="rounded-2xl p-6 border flex items-center justify-between"
          [class]="p.online ? 'bg-green-900/20 border-green-700/50' : 'bg-neutral-800/30 border-neutral-700/50'">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{p.online ? '📶' : '📵'}}</span>
            <div>
              <p class="font-medium" [class]="p.online ? 'text-green-300' : 'text-neutral-400'">{{p.online ? 'Online — Disponível' : 'Offline'}}</p>
              <p class="text-neutral-500 text-sm">{{p.online ? 'Você está recebendo pedidos' : 'Fique online para receber pedidos'}}</p>
            </div>
          </div>
          <button (click)="alternarOnline()" [disabled]="mudando()" class="relative w-14 h-7 rounded-full transition-colors disabled:opacity-60"
            [class]="p.online ? 'bg-green-600' : 'bg-neutral-700'" aria-label="Ficar online">
            <span class="absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all" [class]="p.online ? 'left-7' : 'left-0.5'"></span>
          </button>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="bg-[#141414] border border-neutral-800 rounded-xl p-3 text-center"><p class="text-amber-400 text-2xl font-bold">{{p.disponiveis}}</p><p class="text-neutral-500 text-xs mt-1">Disponíveis</p></div>
          <div class="bg-[#141414] border border-neutral-800 rounded-xl p-3 text-center"><p class="text-blue-400 text-2xl font-bold">{{p.emEntrega}}</p><p class="text-neutral-500 text-xs mt-1">Em Entrega</p></div>
          <div class="bg-[#141414] border border-neutral-800 rounded-xl p-3 text-center"><p class="text-green-400 text-2xl font-bold">{{p.entreguesHoje}}</p><p class="text-neutral-500 text-xs mt-1">Entregues Hoje</p></div>
        </div>

        <div>
          <h2 class="text-white font-semibold mb-3">🚗 Minhas Entregas Ativas</h2>
          @if(ativas().length===0){
            <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 text-center text-neutral-500 text-sm">Nenhuma entrega em andamento</div>
          }
          <div class="space-y-3">
            @for(e of ativas(); track e.pedidoId){
              <div class="bg-[#141414] border border-blue-900/40 rounded-2xl p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-white font-medium">Pedido #{{e.pedidoId}}</p>
                    <p class="text-neutral-400 text-sm">{{e.cliente}} @if(e.telefone){· {{e.telefone}}}</p>
                  </div>
                  <span class="text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full flex-shrink-0">Em trânsito</span>
                </div>
                <p class="text-neutral-300 text-sm mt-2">📍 {{e.endereco}}</p>
                @if(e.itens){<p class="text-neutral-500 text-xs mt-1">{{e.itens}}</p>}
                @if(e.observacoes){<p class="text-neutral-500 text-xs mt-1">Obs.: {{e.observacoes}}</p>}
                <p class="text-red-400 font-semibold text-sm mt-2">{{moeda(e.valorTotal)}} — {{e.pago ? 'Já pago' : 'Receber na entrega'}}</p>
                <button (click)="entregar(e)" [disabled]="ocupado()===e.pedidoId" class="w-full mt-3 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-medium transition-colors">✅ Confirmar Entrega</button>
              </div>
            }
          </div>
        </div>

        <div>
          <h2 class="text-white font-semibold mb-3">📦 Pedidos Prontos para Entrega</h2>
          @if(!p.online){
            <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 text-center text-neutral-500 text-sm">Fique online para ver os pedidos disponíveis</div>
          } @else if(disponiveis().length===0){
            <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 text-center text-neutral-500 text-sm">Nenhum pedido pronto no momento. Esta tela atualiza sozinha.</div>
          }
          <div class="space-y-3">
            @for(e of disponiveis(); track e.pedidoId){
              <div class="bg-[#141414] border border-amber-900/40 rounded-2xl p-4">
                <p class="text-white font-medium">Pedido #{{e.pedidoId}} <span class="text-neutral-500 text-sm font-normal">· {{e.cliente}}</span></p>
                <p class="text-neutral-300 text-sm mt-2">📍 {{e.endereco}}</p>
                @if(e.itens){<p class="text-neutral-500 text-xs mt-1">{{e.itens}}</p>}
                <p class="text-red-400 font-semibold text-sm mt-2">{{moeda(e.valorTotal)}} — {{e.pago ? 'Já pago' : 'Receber na entrega'}}</p>
                <button (click)="aceitar(e)" [disabled]="ocupado()===e.pedidoId" class="w-full mt-3 bg-amber-700 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-medium transition-colors">Aceitar entrega</button>
              </div>
            }
          </div>
        </div>
      }
    } @else if(!erro()){
      <p class="text-neutral-500 text-center py-12">Carregando...</p>
    }
  </div>
</div>`
})
export class DeliveryPanelComponent implements OnInit, OnDestroy {
  private api = inject(EntregadorService);
  private auth = inject(AuthService);
  private r = inject(Router);
  moeda = moeda;

  perfil = signal<PerfilEntregador | null>(null);
  disponiveis = signal<Entrega[]>([]);
  ativas = signal<Entrega[]>([]);
  erro = signal('');
  mudando = signal(false);
  ocupado = signal<number | null>(null);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.carregar();
    this.timer = setInterval(() => this.carregar(), 10000);
  }
  ngOnDestroy() { if (this.timer) clearInterval(this.timer); }

  carregar() {
    this.api.me().subscribe({
      next: p => {
        this.perfil.set(p); this.erro.set('');
        if (p.statusCadastro !== 'APROVADO') return;
        this.api.ativas().subscribe({ next: l => this.ativas.set(l), error: () => {} });
        this.api.disponiveis().subscribe({ next: l => this.disponiveis.set(l), error: () => {} });
      },
      error: e => this.erro.set(mensagemDeErro(e, 'Não foi possível carregar o painel.')),
    });
  }

  alternarOnline() {
    const p = this.perfil(); if (!p) return;
    this.mudando.set(true);
    this.api.definirOnline(!p.online).subscribe({
      next: n => { this.perfil.set(n); this.mudando.set(false); this.carregar(); },
      error: e => { this.mudando.set(false); this.erro.set(mensagemDePedido(e)); },
    });
  }

  aceitar(e: Entrega) {
    this.ocupado.set(e.pedidoId); this.erro.set('');
    this.api.aceitar(e.pedidoId).subscribe({
      next: () => { this.ocupado.set(null); this.carregar(); },
      error: err => { this.ocupado.set(null); this.erro.set(mensagemDePedido(err)); this.carregar(); },
    });
  }

  entregar(e: Entrega) {
    this.ocupado.set(e.pedidoId); this.erro.set('');
    this.api.entregar(e.pedidoId).subscribe({
      next: () => { this.ocupado.set(null); this.carregar(); },
      error: err => { this.ocupado.set(null); this.erro.set(mensagemDePedido(err)); },
    });
  }

  sair() { this.auth.logout('/'); }
}
