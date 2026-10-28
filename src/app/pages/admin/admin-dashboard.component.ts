import { Component } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
const SL:Record<string,string>={confirmado:'Confirmado',em_preparo:'Em Preparo',finalizado:'Finalizado',saiu_entrega:'Saiu p/ Entrega',entregue:'Entregue'};
const SC:Record<string,string>={confirmado:'bg-blue-900/40 text-blue-300 border-blue-700/50',em_preparo:'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',finalizado:'bg-orange-900/40 text-orange-300 border-orange-700/50',saiu_entrega:'bg-purple-900/40 text-purple-300 border-purple-700/50',entregue:'bg-green-900/40 text-green-300 border-green-700/50'};
@Component({ selector:'app-admin-dashboard', standalone:true, template:`
<div class="p-4 md:p-6 max-w-6xl mx-auto">
  <div class="mb-6 flex items-center justify-between gap-4 flex-wrap">
    <div><h1 class="text-white text-2xl font-semibold">Dashboard</h1><p class="text-neutral-400 text-sm mt-1">Visão geral do restaurante</p></div>
    <button (click)="resetData()" class="text-neutral-500 hover:text-red-400 text-xs border border-neutral-800 hover:border-red-800/50 rounded-lg px-3 py-2 transition-colors">
      ↺ Restaurar dados de demonstração
    </button>
  </div>
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    @for(st of stats(); track st.label){
      <div class="border rounded-xl p-4" [class]="st.bg">
        <div class="flex items-center justify-between mb-2"><p class="text-neutral-400 text-xs">{{st.label}}</p><span class="text-lg">{{st.icon}}</span></div>
        <p class="text-2xl font-bold" [class]="st.color">{{st.value}}</p>
      </div>
    }
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
      <h2 class="text-white font-semibold mb-4">Top Pratos Vendidos</h2>
      @for(d of topDishes(); track d.id){
        <div class="mb-3">
          <div class="flex justify-between text-xs text-neutral-400 mb-1"><span>{{d.name.split(' ').slice(0,2).join(' ')}}</span><span>{{d.sales}}</span></div>
          <div class="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div class="h-full bg-red-800 rounded-full" [style.width]="(d.sales/maxSales()*100)+'%'"></div>
          </div>
        </div>
      }
    </div>
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
      <h2 class="text-white font-semibold mb-4">Pedidos Recentes</h2>
      <div class="space-y-3">
        @for(o of recent(); track o.id){
          <div class="flex items-center justify-between">
            <div><p class="text-white text-sm">#{{o.id}} — {{o.clientName}}</p><p class="text-neutral-500 text-xs">{{fmtTime(o.createdAt)}}</p></div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded-lg border" [class]="sc[o.status]||''">{{sl[o.status]}}</span>
              <span class="text-red-400 text-sm font-medium">R$ {{o.total.toFixed(2)}}</span>
            </div>
          </div>
        }
      </div>
    </div>
  </div>
  <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
    <h2 class="text-white font-semibold mb-4 flex items-center gap-2">🚗 Status dos Entregadores</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      @for(d of approvedDeliverers(); track d.id){
        <div class="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3">
          <div class="w-2 h-2 rounded-full" [class]="d.online?'bg-green-400':'bg-neutral-600'"></div>
          <div><p class="text-white text-sm">{{d.name}}</p><p class="text-neutral-500 text-xs">{{d.vehicleType}} • {{d.online?'Online':'Offline'}}</p></div>
        </div>
      }
    </div>
  </div>
</div>` })
export class AdminDashboardComponent {
  sl=SL; sc=SC;
  constructor(public s:AppStateService){}
  stats=()=>{const os=this.s.orders(),ds=this.s.dishes(),dvs=this.s.deliverers(),cs=this.s.clients(),rev=os.filter(o=>o.status==='entregue').reduce((s,o)=>s+o.total,0),ticket=os.length?os.reduce((s,o)=>s+o.total,0)/os.length:0;
    return [{label:'Faturamento Total',value:'R$ '+rev.toFixed(2),color:'text-green-400',bg:'bg-green-900/20 border-green-800/30',icon:'💰'},{label:'Pedidos Ativos',value:os.filter(o=>o.status!=='entregue').length,color:'text-blue-400',bg:'bg-blue-900/20 border-blue-800/30',icon:'🛍️'},{label:'Ticket Médio',value:'R$ '+ticket.toFixed(2),color:'text-yellow-400',bg:'bg-yellow-900/20 border-yellow-800/30',icon:'⭐'},{label:'Entregadores',value:dvs.filter(d=>d.approved).length,color:'text-amber-400',bg:'bg-amber-900/20 border-amber-800/30',icon:'🚗'},{label:'Clientes',value:cs.length,color:'text-purple-400',bg:'bg-purple-900/20 border-purple-800/30',icon:'👥'},{label:'Total Pedidos',value:os.length,color:'text-red-400',bg:'bg-red-900/20 border-red-800/30',icon:'✅'}];};
  topDishes=()=>[...this.s.dishes()].sort((a,b)=>b.sales-a.sales).slice(0,5);
  maxSales=()=>this.topDishes()[0]?.sales||1;
  recent=()=>[...this.s.orders()].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,5);
  fmtTime=(d:Date)=>new Date(d).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  approvedDeliverers() { return this.s.deliverers().filter(d => d.approved); }
  resetData() {
    if (confirm('Isso vai restaurar os pedidos, pratos e entregadores de demonstração em TODAS as abas abertas. Continuar?')) {
      this.s.resetDemoData();
    }
  }
}
