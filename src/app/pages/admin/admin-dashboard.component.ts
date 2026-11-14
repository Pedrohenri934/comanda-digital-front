import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { mensagemDeErro } from '../../services/auth.service';
import { Dashboard } from '../../models/api.models';
import { STATUS_INFO, moeda } from '../../models/status-pedido';

Chart.register(...registerables);

const COR_STATUS: Record<string, string> = {
  RECEBIDO: '#38bdf8', CONFIRMADO: '#60a5fa', EM_PREPARO: '#fb923c', PRONTO: '#facc15',
  SAIU_ENTREGA: '#c084fc', FINALIZADO: '#4ade80', CANCELADO: '#f87171',
};

// Dashboard (RF-025 a RF-028): indicadores do periodo escolhido, calculados pela API.
@Component({ selector:'app-admin-dashboard', standalone:true, template:`
<div class="p-4 md:p-6 max-w-6xl mx-auto">
  <div class="mb-6 flex items-center justify-between gap-4 flex-wrap">
    <div><h1 class="text-white text-2xl font-semibold">Dashboard</h1><p class="text-neutral-400 text-sm mt-1">Vendas contam pedidos confirmados em diante (sem cancelados)</p></div>
    <div class="flex gap-2">
      @for(d of periodos; track d){
        <button (click)="trocar(d)" class="px-4 py-2 rounded-xl text-sm" [class]="dias()===d?'bg-red-800 text-white':'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">{{d}} dias</button>
      }
    </div>
  </div>
  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}

  @if(dados(); as d){
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      <div class="bg-[#141414] border border-green-900/40 rounded-xl p-4"><p class="text-neutral-400 text-xs mb-1">Faturamento</p><p class="text-green-400 text-xl font-bold">{{moeda(d.totais.faturamento)}}</p></div>
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-4"><p class="text-neutral-400 text-xs mb-1">Vendas</p><p class="text-white text-xl font-bold">{{d.totais.vendas}}</p></div>
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-4"><p class="text-neutral-400 text-xs mb-1">Ticket médio</p><p class="text-white text-xl font-bold">{{moeda(d.totais.ticketMedio)}}</p></div>
      <div class="bg-[#141414] border border-orange-900/40 rounded-xl p-4"><p class="text-neutral-400 text-xs mb-1">Em andamento agora</p><p class="text-orange-400 text-xl font-bold">{{d.totais.pedidosAbertos}}</p></div>
      <div class="bg-[#141414] border border-red-900/40 rounded-xl p-4"><p class="text-neutral-400 text-xs mb-1">Cancelados</p><p class="text-red-400 text-xl font-bold">{{d.totais.cancelados}}</p></div>
    </div>
  }

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
    <div class="lg:col-span-2 bg-[#141414] border border-neutral-800 rounded-2xl p-5">
      <h2 class="text-white font-semibold mb-3">Faturamento por dia</h2>
      <div class="h-64"><canvas #cDia></canvas></div>
    </div>
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
      <h2 class="text-white font-semibold mb-3">Pedidos por status</h2>
      <div class="h-64"><canvas #cStatus></canvas></div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
      <h2 class="text-white font-semibold mb-3">Pratos mais vendidos</h2>
      @if(dados()?.maisVendidos?.length===0){<p class="text-neutral-500 text-sm py-8 text-center">Sem vendas no período</p>}
      <div class="h-64" [class.hidden]="dados()?.maisVendidos?.length===0"><canvas #cTop></canvas></div>
    </div>
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
      <h2 class="text-white font-semibold mb-3">Estoque abaixo do mínimo</h2>
      @if(dados(); as d){
        @if(d.estoqueBaixo.length===0){<p class="text-green-400 text-sm py-8 text-center">✅ Nenhum ingrediente abaixo do mínimo</p>}
        @for(i of d.estoqueBaixo; track i.id){
          <div class="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
            <span class="text-neutral-200 text-sm">{{i.nome}}</span>
            <span class="text-sm"><b class="text-red-400">{{i.saldo}}</b>&nbsp;<span class="text-neutral-500">/ mín. {{i.estoqueMinimo}} {{i.unidadePadrao}}</span></span>
          </div>
        }
      }
    </div>
  </div>
</div>` })
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private api = inject(DashboardService);
  @ViewChild('cDia', { static: true }) cDia!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cStatus', { static: true }) cStatus!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cTop', { static: true }) cTop!: ElementRef<HTMLCanvasElement>;

  moeda = moeda;
  periodos = [7, 30, 90];
  dias = signal(7);
  dados = signal<Dashboard | null>(null);
  erro = signal('');
  private graficos: Chart[] = [];

  ngOnInit() { this.carregar(); }
  ngOnDestroy() { this.limpar(); }

  trocar(d: number) { this.dias.set(d); this.carregar(); }

  carregar() {
    this.erro.set('');
    this.api.obter(this.dias()).subscribe({
      next: d => { this.dados.set(d); this.desenhar(d); },
      error: e => this.erro.set(mensagemDeErro(e, 'Não foi possível carregar o dashboard.')),
    });
  }

  private limpar() { this.graficos.forEach(g => g.destroy()); this.graficos = []; }

  private desenhar(d: Dashboard) {
    this.limpar();
    const texto = '#a3a3a3'; const grade = '#262626';
    const eixos = { ticks: { color: texto }, grid: { color: grade } };

    this.graficos.push(new Chart(this.cDia.nativeElement, {
      type: 'bar',
      data: {
        labels: d.vendasPorDia.map(v => v.data.slice(8, 10) + '/' + v.data.slice(5, 7)),
        datasets: [{ label: 'Faturamento (R$)', data: d.vendasPorDia.map(v => v.faturamento), backgroundColor: '#b91c1c', borderRadius: 4 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: eixos, y: { ...eixos, beginAtZero: true } } },
    }));

    this.graficos.push(new Chart(this.cStatus.nativeElement, {
      type: 'doughnut',
      data: {
        labels: d.pedidosPorStatus.map(s => STATUS_INFO[s.status]?.label ?? s.status),
        datasets: [{ data: d.pedidosPorStatus.map(s => s.quantidade), backgroundColor: d.pedidosPorStatus.map(s => COR_STATUS[s.status] ?? '#737373'), borderWidth: 0 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: texto } } } },
    }));

    this.graficos.push(new Chart(this.cTop.nativeElement, {
      type: 'bar',
      data: {
        labels: d.maisVendidos.map(p => p.prato),
        datasets: [{ label: 'Unidades vendidas', data: d.maisVendidos.map(p => p.quantidade), backgroundColor: '#ea580c', borderRadius: 4 }],
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ...eixos, beginAtZero: true, ticks: { color: texto, precision: 0 } }, y: eixos } },
    }));
  }
}
