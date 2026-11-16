import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { RelatorioService } from '../../services/relatorio.service';
import { mensagemDeErro } from '../../services/auth.service';
import { PratoBcg, QuadranteBcg, RelatorioBcg } from '../../models/api.models';
import { moeda } from '../../models/status-pedido';

Chart.register(...registerables);

const CFG: Record<QuadranteBcg, { label: string; em: string; tc: string; bg: string; color: string; desc: string }> = {
  ESTRELA:       { label: 'Estrela',       em: '⭐', tc: 'text-yellow-300', bg: 'bg-yellow-900/30 border-yellow-700/40', color: '#EAB308',
    desc: 'Vende bem e tem boa margem. Mantenha e destaque no cardápio.' },
  VACA_LEITEIRA: { label: 'Vaca Leiteira', em: '🐄', tc: 'text-green-300',  bg: 'bg-green-900/30 border-green-700/40',  color: '#22C55E',
    desc: 'Vende muito, mas a margem é menor. Revise custo ou preço.' },
  INTERROGACAO:  { label: 'Interrogação',  em: '❓', tc: 'text-blue-300',   bg: 'bg-blue-900/30 border-blue-700/40',    color: '#3B82F6',
    desc: 'Boa margem, poucas vendas. Divulgue ou faça promoção.' },
  ABACAXI:       { label: 'Abacaxi',       em: '🍍', tc: 'text-red-300',    bg: 'bg-red-900/30 border-red-700/40',      color: '#EF4444',
    desc: 'Pouca venda e margem baixa. Candidato a revisão ou remoção.' },
};
const ORDEM: QuadranteBcg[] = ['ESTRELA', 'VACA_LEITEIRA', 'INTERROGACAO', 'ABACAXI'];

// Vendas por prato (mais e menos vendidos) + Matriz BCG, tudo calculado pela API com os pedidos reais.
@Component({
  selector: 'app-admin-bcg',
  standalone: true,
  template: `
<div class="p-4 md:p-6 max-w-6xl mx-auto">
  <div class="mb-6 flex items-center justify-between gap-4 flex-wrap">
    <div>
      <h1 class="text-white text-2xl font-semibold">🎯 Vendas e Matriz BCG</h1>
      <p class="text-neutral-400 text-sm mt-1">Popularidade (unidades vendidas) × margem (preço − custo da ficha técnica)</p>
    </div>
    <div class="flex gap-2">
      @for(d of periodos; track d){
        <button (click)="trocar(d)" class="px-4 py-2 rounded-xl text-sm" [class]="dias()===d?'bg-red-800 text-white':'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">{{d}} dias</button>
      }
    </div>
  </div>

  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}

  @if(dados(); as d){
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
        <h2 class="text-white font-semibold mb-3">📈 Mais vendidos</h2>
        @if(d.maisVendidos.length===0){<p class="text-neutral-500 text-sm py-4 text-center">Sem vendas no período</p>}
        @for(p of d.maisVendidos; track p.pratoId){
          <div class="flex items-center justify-between py-2 border-b border-neutral-800/60 last:border-0">
            <div class="min-w-0"><p class="text-white text-sm truncate">{{p.nome}}</p><p class="text-neutral-500 text-xs">Receita: {{moeda(p.receita)}}</p></div>
            <span class="text-green-400 text-sm font-semibold flex-shrink-0">{{p.quantidade}} un.</span>
          </div>
        }
      </div>
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
        <h2 class="text-white font-semibold mb-3">📉 Menos vendidos</h2>
        @for(p of d.menosVendidos; track p.pratoId){
          <div class="flex items-center justify-between py-2 border-b border-neutral-800/60 last:border-0">
            <div class="min-w-0"><p class="text-white text-sm truncate">{{p.nome}}</p><p class="text-neutral-500 text-xs">Receita: {{moeda(p.receita)}}</p></div>
            <span class="text-red-400 text-sm font-semibold flex-shrink-0">{{p.quantidade}} un.</span>
          </div>
        }
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      @for(q of ordem; track q){
        <div class="rounded-xl border p-4" [class]="cfg[q].bg">
          <div class="flex items-center gap-2"><span class="text-xl">{{cfg[q].em}}</span><span class="text-sm font-semibold" [class]="cfg[q].tc">{{cfg[q].label}}</span></div>
          <p class="text-neutral-400 text-xs mt-1">{{grupo(q).length}} prato(s)</p>
        </div>
      }
    </div>
  }

  <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-5 mb-6">
    <h2 class="text-white font-semibold">Quadrante BCG</h2>
    <p class="text-neutral-500 text-xs mb-3">Eixo X: unidades vendidas · Eixo Y: margem (%)
      @if(dados(); as d){ · Linha de corte: {{d.limiarVendas}} un. e {{d.mediaMargemPct}}% de margem }</p>
    <div class="h-72"><canvas #cBcg></canvas></div>
  </div>

  @if(dados(); as d){
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      @for(q of ordem; track q){
        <div class="rounded-2xl border p-5" [class]="cfg[q].bg">
          <div class="flex items-center gap-2 mb-1"><span class="text-2xl">{{cfg[q].em}}</span>
            <h3 class="font-semibold" [class]="cfg[q].tc">{{cfg[q].label}}</h3>
            <span class="ml-auto text-neutral-500 text-sm">{{grupo(q).length}}</span></div>
          <p class="text-neutral-500 text-xs mb-4">{{cfg[q].desc}}</p>
          @if(grupo(q).length===0){<p class="text-neutral-600 text-sm text-center py-3">Nenhum prato neste quadrante</p>}
          <div class="space-y-2">
            @for(p of grupo(q); track p.pratoId){
              <div class="flex items-center gap-3 bg-black/20 rounded-xl p-3">
                @if(p.fotoUrl){<img [src]="p.fotoUrl" [alt]="p.nome" class="w-10 h-10 rounded-lg object-cover"/>} @else {<div class="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">🍽️</div>}
                <div class="flex-1 min-w-0">
                  <p class="text-white text-sm truncate">{{p.nome}}</p>
                  <p class="text-neutral-500 text-xs">{{p.quantidade}} vendas · {{p.margemPct}}% margem</p>
                </div>
                <p class="text-white text-xs flex-shrink-0">{{moeda(p.preco)}}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  }
</div>`
})
export class AdminBcgComponent implements OnInit, OnDestroy {
  private api = inject(RelatorioService);
  @ViewChild('cBcg', { static: true }) cBcg!: ElementRef<HTMLCanvasElement>;
  cfg = CFG;
  ordem = ORDEM;
  moeda = moeda;
  periodos = [7, 30, 90];
  dias = signal(30);
  dados = signal<RelatorioBcg | null>(null);
  erro = signal('');
  private grafico: Chart | null = null;

  ngOnInit() { this.carregar(); }
  ngOnDestroy() { this.grafico?.destroy(); }

  trocar(d: number) { this.dias.set(d); this.carregar(); }

  grupo(q: QuadranteBcg): PratoBcg[] { return (this.dados()?.pratos ?? []).filter(p => p.quadrante === q); }

  carregar() {
    this.erro.set('');
    this.api.bcg(this.dias()).subscribe({
      next: d => { this.dados.set(d); this.desenhar(d); },
      error: e => this.erro.set(mensagemDeErro(e, 'Não foi possível carregar o relatório.')),
    });
  }

  private desenhar(d: RelatorioBcg) {
    this.grafico?.destroy();
    const texto = '#a3a3a3'; const grade = '#262626';
    this.grafico = new Chart(this.cBcg.nativeElement, {
      type: 'scatter',
      data: {
        datasets: ORDEM.map(q => ({
          label: CFG[q].label,
          data: d.pratos.filter(p => p.quadrante === q).map(p => ({ x: p.quantidade, y: p.margemPct, nome: p.nome })),
          backgroundColor: CFG[q].color, pointRadius: 7, pointHoverRadius: 9,
        })) as any,
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: texto } },
          tooltip: { callbacks: { label: (ctx: any) => `${ctx.raw.nome}: ${ctx.raw.x} un. · ${ctx.raw.y}% margem` } },
        },
        scales: {
          x: { title: { display: true, text: 'Unidades vendidas', color: texto }, ticks: { color: texto }, grid: { color: grade }, beginAtZero: true },
          y: { title: { display: true, text: 'Margem (%)', color: texto }, ticks: { color: texto }, grid: { color: grade } },
        },
      },
    });
  }
}
