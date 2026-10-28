import { Component, signal } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { Order } from '../../models/models';

type Period = 'dia' | 'semana' | 'mes' | 'tudo';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  template: `
<div class="p-4 md:p-6 max-w-6xl mx-auto">
  <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
    <div>
      <h1 class="text-white text-2xl font-semibold">Relatórios</h1>
      <p class="text-neutral-400 text-sm mt-1">Análise de desempenho do restaurante</p>
    </div>
    <div class="flex gap-2">
      @for(p of periods; track p.key){
        <button (click)="setPeriod(p.key)"
          class="px-4 py-2 rounded-xl text-sm transition-colors"
          [class]="period()===p.key ? 'bg-red-800 text-white' : 'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">
          {{p.label}}
        </button>
      }
    </div>
  </div>

  <!-- KPIs -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    @for(k of kpis(); track k.label){
      <div class="border rounded-xl p-4" [class]="k.bg">
        <div class="flex items-center justify-between mb-2">
          <p class="text-neutral-400 text-xs">{{k.label}}</p>
          <span class="text-lg">{{k.icon}}</span>
        </div>
        <p class="text-xl font-bold" [class]="k.color">{{k.value}}</p>
      </div>
    }
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
    <!-- Bar chart -->
    <div class="lg:col-span-2 bg-[#141414] border border-neutral-800 rounded-2xl p-6">
      <h2 class="text-white font-semibold mb-4">Vendas por Prato (Top 5)</h2>
      @if(top5().length===0){
        <p class="text-neutral-500 text-sm text-center py-8">Sem dados no período</p>
      } @else {
        @for(e of top5(); track e.name; let idx=$index){
          <div class="mb-3">
            <div class="flex justify-between text-xs text-neutral-400 mb-1">
              <span>{{e.name}}</span><span>{{e.qty}} und.</span>
            </div>
            <div class="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div class="h-full rounded-full" [style.width]="barWidth(e.qty)+'%'" [style.background]="barColor(idx)"></div>
            </div>
          </div>
        }
      }
    </div>
    <!-- Distribution -->
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
      <h2 class="text-white font-semibold mb-4">Distribuição</h2>
      @if(top5().length===0){
        <div class="h-40 flex items-center justify-center text-neutral-500 text-sm">Sem dados</div>
      } @else {
        <div class="space-y-3">
          @for(e of top5(); track e.name; let idx=$index){
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full flex-shrink-0" [style.background]="barColor(idx)"></div>
              <span class="text-neutral-300 text-xs flex-1 truncate">{{e.name}}</span>
              <span class="text-neutral-400 text-xs">{{distPct(e.qty)}}%</span>
            </div>
          }
        </div>
      }
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
      <h2 class="text-white font-semibold mb-4">📈 Mais Vendidos</h2>
      @if(top5().length===0){<p class="text-neutral-500 text-sm">Sem dados no período</p>}
      @for(e of top5(); track e.name){
        <div class="bg-[#1a1a1a] rounded-xl p-3 mb-3">
          <div class="flex justify-between items-start mb-1">
            <p class="text-white text-sm flex-1">{{e.dishName}}</p>
            <span class="text-green-400 text-sm font-medium ml-2">{{e.qty}} unid.</span>
          </div>
          <p class="text-neutral-500 text-xs">Receita: R$ {{e.revenue.toFixed(2)}}</p>
        </div>
      }
    </div>
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
      <h2 class="text-white font-semibold mb-4">📉 Menos Vendidos</h2>
      @if(bottom5().length===0){<p class="text-neutral-500 text-sm">Sem dados no período</p>}
      @for(e of bottom5(); track e.name){
        <div class="bg-[#1a1a1a] rounded-xl p-3 mb-3">
          <div class="flex justify-between items-start mb-1">
            <p class="text-white text-sm flex-1">{{e.dishName}}</p>
            <span class="text-red-400 text-sm font-medium ml-2">{{e.qty}} unid.</span>
          </div>
          <p class="text-neutral-500 text-xs">Receita: R$ {{e.revenue.toFixed(2)}}</p>
        </div>
      }
    </div>
  </div>
</div>`
})
export class AdminReportsComponent {
  period = signal<Period>('mes');
  periods = [
    {key:'dia' as Period, label:'Hoje'},
    {key:'semana' as Period, label:'Semana'},
    {key:'mes' as Period, label:'Mês'},
    {key:'tudo' as Period, label:'Tudo'},
  ];
  colors = ['#B91C1C','#D97706','#16A34A','#1D4ED8','#7C3AED'];

  constructor(private s: AppStateService) {}

  setPeriod(p: Period) { this.period.set(p); }

  filtered(): Order[] {
    const now = new Date(); const p = this.period();
    return this.s.orders().filter(o => {
      const d = new Date(o.createdAt);
      if (p === 'dia') return d.toDateString() === now.toDateString();
      if (p === 'semana') return (now.getTime() - d.getTime()) < 7*24*60*60*1000;
      if (p === 'mes') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return true;
    });
  }

  kpis() {
    const f = this.filtered();
    const delivered = f.filter(o => o.status === 'entregue');
    const rev = delivered.reduce((s, o) => s + o.total, 0);
    const ticket = delivered.length ? rev / delivered.length : 0;
    return [
      {label:'Faturamento', value:'R$ '+rev.toFixed(2), color:'text-green-400', bg:'bg-green-900/20 border-green-800/30', icon:'💰'},
      {label:'Pedidos', value:f.length, color:'text-blue-400', bg:'bg-blue-900/20 border-blue-800/30', icon:'🛍️'},
      {label:'Ticket Médio', value:'R$ '+ticket.toFixed(2), color:'text-yellow-400', bg:'bg-yellow-900/20 border-yellow-800/30', icon:'⭐'},
      {label:'Entregues', value:delivered.length, color:'text-purple-400', bg:'bg-purple-900/20 border-purple-800/30', icon:'✅'},
    ];
  }

  dishSales() {
    const map: Record<string, {qty:number; revenue:number; dishName:string}> = {};
    this.filtered().forEach(o => o.items.forEach(i => {
      if (!map[i.dishId]) map[i.dishId] = {qty:0, revenue:0, dishName:i.dishName};
      map[i.dishId].qty += i.qty;
      map[i.dishId].revenue += i.price * i.qty;
    }));
    return Object.entries(map)
      .map(([id, v]) => ({name: id, dishName: v.dishName, qty: v.qty, revenue: v.revenue}))
      .sort((a, b) => b.qty - a.qty);
  }

  top5() { return this.dishSales().slice(0, 5); }
  bottom5() { return this.dishSales().slice(-5).reverse(); }
  maxQty() { return this.top5()[0]?.qty || 1; }
  totalQty() { return this.top5().reduce((s, e) => s + e.qty, 0); }
  barWidth(qty: number) { return Math.round(qty / this.maxQty() * 100); }
  barColor(idx: number) { return this.colors[idx % this.colors.length]; }
  distPct(qty: number) { const t = this.totalQty(); return t > 0 ? (qty / t * 100).toFixed(0) : '0'; }
}
