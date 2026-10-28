import { Component } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { Dish } from '../../models/models';

interface BCGEntry { dish: Dish; quadrant: 'estrela'|'vaca'|'interrogacao'|'abacaxi'; margin: number; }

const CFG = {
  estrela:     { label:'Estrela',        em:'⭐', tc:'text-yellow-300', bg:'bg-yellow-900/30 border-yellow-700/40', color:'#EAB308',
    desc:'Alto volume de vendas e custo elevado — produto premium em alta.' },
  vaca:        { label:'Vaca Leiteira',  em:'🐄', tc:'text-green-300',  bg:'bg-green-900/30 border-green-700/40',  color:'#22C55E',
    desc:'Alto volume, custo baixo — maior margem de lucro do cardápio.' },
  interrogacao:{ label:'Interrogação',   em:'❓', tc:'text-blue-300',   bg:'bg-blue-900/30 border-blue-700/40',    color:'#3B82F6',
    desc:'Poucas vendas ainda — novidade ou precisa de promoção.' },
  abacaxi:     { label:'Abacaxi',        em:'🍍', tc:'text-red-300',    bg:'bg-red-900/30 border-red-700/40',      color:'#EF4444',
    desc:'Baixo volume e margem pequena — candidato a revisão ou remoção.' },
} as const;

@Component({
  selector: 'app-admin-bcg',
  standalone: true,
  template: `
<div class="p-4 md:p-6 max-w-6xl mx-auto">
  <div class="mb-6">
    <h1 class="text-white text-2xl font-semibold">🎯 Matriz BCG</h1>
    <p class="text-neutral-400 text-sm mt-1">Classificação estratégica dos pratos do cardápio</p>
  </div>

  <!-- Summary badges -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    @for(q of quadrantKeys; track q){
      <div class="border rounded-xl p-3 flex items-center gap-3" [class]="cfg[q].bg">
        <span class="text-xl">{{cfg[q].em}}</span>
        <div>
          <p class="text-sm font-medium" [class]="cfg[q].tc">{{cfg[q].label}}</p>
          <p class="text-neutral-500 text-xs">{{grouped(q).length}} prato(s)</p>
        </div>
      </div>
    }
  </div>

  <!-- Scatter plot -->
  <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 mb-6">
    <h2 class="text-white font-semibold mb-1">Quadrante BCG</h2>
    <p class="text-neutral-500 text-xs mb-4">Eixo X: Vendas · Eixo Y: Margem (%) · Tamanho: Receita</p>
    <div class="relative h-64 bg-[#1a1a1a] rounded-xl overflow-hidden border border-neutral-800">
      <!-- Grid lines -->
      <div class="absolute inset-x-0 top-1/2 border-t border-dashed border-neutral-700 opacity-50"></div>
      <div class="absolute inset-y-0 left-1/2 border-l border-dashed border-neutral-700 opacity-50"></div>
      <!-- Labels -->
      <span class="absolute top-2 left-2 text-neutral-600 text-xs">Alta Margem</span>
      <span class="absolute top-2 right-2 text-neutral-600 text-xs">⭐ Estrela</span>
      <span class="absolute bottom-2 left-2 text-neutral-600 text-xs">🍍 Abacaxi</span>
      <span class="absolute bottom-2 right-2 text-neutral-600 text-xs">🐄 Vaca</span>
      <!-- Dots -->
      @for(e of bcgList(); track e.dish.id){
        <div class="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-xs font-bold cursor-pointer transition-transform hover:scale-125"
          [title]="e.dish.name + ' — ' + e.margin.toFixed(1) + '% margem / ' + e.dish.sales + ' vendas'"
          [style.left]="dotX(e.dish.sales) + '%'"
          [style.top]="dotY(e.margin) + '%'"
          [style.width]="dotSize(e.dish.price) + 'px'"
          [style.height]="dotSize(e.dish.price) + 'px'"
          [style.background]="cfg[e.quadrant].color">
          {{cfg[e.quadrant].em}}
        </div>
      }
    </div>
  </div>

  <!-- Quadrant lists -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    @for(q of quadrantKeys; track q){
      <div class="border rounded-2xl p-5" [class]="cfg[q].bg">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl">{{cfg[q].em}}</span>
          <h3 class="font-semibold" [class]="cfg[q].tc">{{cfg[q].label}}</h3>
          <span class="ml-auto text-neutral-500 text-sm">{{grouped(q).length}}</span>
        </div>
        <p class="text-neutral-500 text-xs mb-4">{{cfg[q].desc}}</p>
        @if(grouped(q).length===0){
          <p class="text-neutral-700 text-sm text-center py-3">Nenhum prato nesta categoria</p>
        } @else {
          <div class="space-y-2">
            @for(e of grouped(q); track e.dish.id){
              <div class="flex items-center gap-3 bg-black/20 rounded-xl p-3">
                <img [src]="e.dish.image" [alt]="e.dish.name" class="w-10 h-10 rounded-lg object-cover"/>
                <div class="flex-1 min-w-0">
                  <p class="text-white text-sm truncate">{{e.dish.name}}</p>
                  <p class="text-neutral-500 text-xs">{{e.dish.sales}} vendas · {{e.margin.toFixed(1)}}% margem</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-white text-xs">R$ {{e.dish.price.toFixed(0)}}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  </div>
</div>`
})
export class AdminBcgComponent {
  cfg = CFG;
  quadrantKeys = Object.keys(CFG) as (keyof typeof CFG)[];

  constructor(private s: AppStateService) {}

  bcgList(): BCGEntry[] {
    return this.s.dishes().filter(d => d.active).map(d => {
      const margin = (d.price - d.cost) / d.price * 100;
      let quadrant: BCGEntry['quadrant'];
      if (d.sales < 50) quadrant = 'interrogacao';
      else if (d.sales >= 200 && d.cost >= 25) quadrant = 'estrela';
      else if (d.sales >= 200 && d.cost < 25) quadrant = 'vaca';
      else quadrant = 'abacaxi';
      return { dish: d, quadrant, margin };
    });
  }

  grouped(q: keyof typeof CFG): BCGEntry[] {
    return this.bcgList().filter(e => e.quadrant === q);
  }

  maxSales() { return Math.max(...this.s.dishes().map(d => d.sales), 1); }
  maxPrice() { return Math.max(...this.s.dishes().map(d => d.price), 1); }

  dotX(sales: number) { return Math.round(sales / this.maxSales() * 88) + 6; }
  dotY(margin: number) { return Math.round((1 - margin / 100) * 84) + 8; }
  dotSize(price: number) { return Math.round(20 + (price / this.maxPrice()) * 20); }
}
