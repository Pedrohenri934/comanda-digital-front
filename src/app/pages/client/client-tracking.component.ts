import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mensagemDeErro } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { Pedido, StatusPedido } from '../../models/api.models';
import { ETAPAS, STATUS_INFO, dataHora, emAndamento, moeda } from '../../models/status-pedido';

// Acompanhamento (RF-005): linha do tempo que se atualiza sozinha a cada 10 s enquanto o pedido nao termina.
@Component({ selector:'app-client-tracking', standalone:true, template:`
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-neutral-800/50 px-4 py-3">
    <div class="max-w-2xl mx-auto flex items-center gap-4">
      <button (click)="r.navigateByUrl('/cliente/pedidos')" class="text-neutral-400 hover:text-white text-sm" aria-label="Meus pedidos">←</button>
      <span class="text-red-500 text-xl">🔥</span>
      <span class="text-white font-semibold">Acompanhamento do Pedido</span>
    </div>
  </header>
  <div class="max-w-2xl mx-auto px-4 py-8">
    @if(carregando()){
      <p class="text-center py-16 text-neutral-500">Carregando pedido...</p>
    } @else if(!status()){
      <div class="text-center py-16">
        <p class="text-neutral-400 mb-4">{{erro() || 'Pedido não encontrado'}}</p>
        <button (click)="r.navigateByUrl('/cliente/pedidos')" class="text-red-400 hover:text-red-300">Ver meus pedidos</button>
      </div>
    } @else {
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-2">
          <p class="text-white text-lg">Pedido #{{id}}</p>
          <span class="px-3 py-1 rounded-lg text-xs border" [class]="info[status()!].color">{{info[status()!].label}}</span>
        </div>
        @if(pedido(); as p){<p class="text-neutral-400 text-sm">{{data(p.criadoEm)}}</p>}
      </div>

      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 mb-6">
        <h2 class="text-white font-semibold mb-6">Status do Pedido</h2>
        @if(status()==='CANCELADO'){
          <div class="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
            <p class="text-red-300 mb-1">❌ Pedido cancelado</p>
            <p class="text-neutral-400 text-sm">{{motivo() || 'Sem motivo informado.'}}</p>
          </div>
        } @else {
          @for(e of etapas; track e; let idx=$index; let last=$last){
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                  [class]="idx<=etapaAtual()?(idx===etapaAtual()?'bg-red-800 border-red-600 ring-2 ring-red-500/50 scale-110':'bg-red-800 border-red-600'):'bg-neutral-800 border-neutral-700'">
                  <span class="text-sm" [class]="idx<=etapaAtual()?'text-white':'text-neutral-600'">{{info[e].emoji}}</span>
                </div>
                @if(!last){<div class="w-0.5 h-8 mt-1" [class]="idx<etapaAtual()?'bg-red-700':'bg-neutral-700'"></div>}
              </div>
              <div class="pb-6">
                <p class="mb-0.5" [class]="idx<=etapaAtual()?(idx===etapaAtual()?'text-red-300':'text-white'):'text-neutral-600'">{{info[e].label}}</p>
                <p class="text-sm" [class]="idx<=etapaAtual()?'text-neutral-400':'text-neutral-700'">{{info[e].desc}}</p>
              </div>
            </div>
          }
        }
        @if(ativo()){<p class="text-neutral-600 text-xs mt-2">Atualizando automaticamente...</p>}
      </div>

      @if(pedido(); as p){
        <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 mb-6">
          <h2 class="text-white font-semibold mb-4">Itens do Pedido</h2>
          @for(item of p.itens; track item.pratoId){
            <div class="flex items-start gap-3 mb-3">
              <div class="flex-1">
                <p class="text-white text-sm">{{item.pratoNome}} <span class="text-neutral-500">×{{item.quantidade}}</span></p>
                @if(item.observacoes){<p class="text-neutral-500 text-xs">Obs.: {{item.observacoes}}</p>}
              </div>
              <p class="text-red-400 text-sm">{{moeda(item.subtotal)}}</p>
            </div>
          }
          <div class="border-t border-neutral-800 mt-4 pt-4 flex justify-between">
            <span class="text-neutral-400">Total</span><span class="text-red-400 font-bold">{{moeda(p.valorTotal)}}</span>
          </div>
        </div>
        @if(p.enderecoEntrega){
          <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
            <h2 class="text-white font-semibold mb-3">Endereço de Entrega</h2>
            <p class="text-neutral-300">{{p.enderecoEntrega}}</p>
            @if(p.observacoes){<p class="text-neutral-500 text-sm mt-2">Obs.: {{p.observacoes}}</p>}
          </div>
        }
      }
    }
  </div>
</div>` })
export class ClientTrackingComponent implements OnInit, OnDestroy {
  r = inject(Router);
  private api = inject(PedidoService);
  private route = inject(ActivatedRoute);

  info = STATUS_INFO; etapas = ETAPAS; moeda = moeda; data = dataHora;
  id = Number(this.route.snapshot.paramMap.get('id'));
  pedido = signal<Pedido | null>(null);
  status = signal<StatusPedido | null>(null);
  motivo = signal<string | null>(null);
  carregando = signal(true);
  erro = signal('');
  private timer?: ReturnType<typeof setInterval>;

  etapaAtual = computed(() => { const s = this.status(); return s ? ETAPAS.indexOf(s) : 0; });
  ativo = computed(() => { const s = this.status(); return !!s && emAndamento(s); });

  ngOnInit() {
    // Detalhes (itens, endereco) vem da lista do cliente; o status vem do endpoint leve /status.
    this.api.meus(0, 100).subscribe({ next: pg => this.pedido.set(pg.content.find(p => p.id === this.id) ?? null), error: () => {} });
    this.atualizar(true);
    this.timer = setInterval(() => { if (this.ativo()) this.atualizar(false); }, 10000);
  }

  ngOnDestroy() { clearInterval(this.timer); }

  private atualizar(primeira: boolean) {
    this.api.status(this.id).subscribe({
      next: s => { this.status.set(s.status); this.motivo.set(s.motivoCancelamento); this.carregando.set(false); },
      error: e => { if (primeira) { this.erro.set(e?.status === 404 || e?.status === 403 ? 'Pedido não encontrado' : mensagemDeErro(e)); this.carregando.set(false); } },
    });
  }
}
