import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { OrderStatus } from '../../models/models';
const SC:Record<OrderStatus,{label:string;color:string}> = {
  confirmado:{label:'Confirmado',color:'text-blue-400 bg-blue-900/20 border-blue-800'},
  em_preparo:{label:'Em Preparo',color:'text-orange-400 bg-orange-900/20 border-orange-800'},
  finalizado:{label:'Pronto',color:'text-yellow-400 bg-yellow-900/20 border-yellow-800'},
  saiu_entrega:{label:'Saiu para Entrega',color:'text-purple-400 bg-purple-900/20 border-purple-800'},
  entregue:{label:'Entregue',color:'text-green-400 bg-green-900/20 border-green-800'},
};
@Component({ selector:'app-client-orders', standalone:true, imports:[FormsModule], template:`
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-neutral-800/50 px-4 py-3">
    <div class="max-w-5xl mx-auto flex items-center gap-4">
      <button (click)="r.navigateByUrl('/cliente/cardapio')" class="text-neutral-400 hover:text-white text-sm">← </button>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
      <span class="text-white font-semibold">Meus Pedidos</span>
    </div>
  </header>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-4"><p class="text-neutral-400 text-sm mb-1">Total</p><p class="text-white text-2xl font-bold">{{myOrders().length}}</p></div>
      <div class="bg-[#141414] border border-blue-900/30 rounded-xl p-4"><p class="text-blue-400 text-sm mb-1">Confirmados</p><p class="text-white text-2xl font-bold">{{cnt('confirmado')}}</p></div>
      <div class="bg-[#141414] border border-orange-900/30 rounded-xl p-4"><p class="text-orange-400 text-sm mb-1">Em Preparo</p><p class="text-white text-2xl font-bold">{{cnt('em_preparo')}}</p></div>
      <div class="bg-[#141414] border border-purple-900/30 rounded-xl p-4"><p class="text-purple-400 text-sm mb-1">Em Entrega</p><p class="text-white text-2xl font-bold">{{cnt('saiu_entrega')}}</p></div>
    </div>
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="flex-1 relative">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input [(ngModel)]="searchId" placeholder="Buscar por ID do pedido..." class="w-full bg-[#1a1a1a] border border-neutral-800 text-white rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        @for(st of statuses; track st.key){
          <button (click)="setStatusFilter(st.key)" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors border"
            [class]="statusFilter===st.key?'bg-red-800 text-white border-red-700':'bg-[#1a1a1a] text-neutral-400 hover:text-white border-neutral-800'">{{st.label}}</button>
        }
      </div>
    </div>
    @if(filtered().length===0){
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-12 text-center">
        <p class="text-neutral-400 mb-4">Nenhum pedido encontrado</p>
        <button (click)="r.navigateByUrl('/cliente/cardapio')" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-6 py-2.5 text-sm">Ver Cardápio</button>
      </div>
    } @else {
      <div class="space-y-3">
        @for(order of filtered(); track order.id){
          @let st = sc[order.status];
          <div (click)="r.navigateByUrl('/cliente/pedido/'+order.id)" class="bg-[#141414] border border-neutral-800 hover:border-red-900/50 rounded-2xl p-5 transition-all cursor-pointer group">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-white font-medium">Pedido #{{order.id}}</p>
                  <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border" [class]="st.color">{{st.label}}</span>
                </div>
                <p class="text-neutral-500 text-sm">{{fmtDate(order.createdAt)}}</p>
              </div>
              <div class="text-right"><p class="text-red-400 font-bold text-lg">R$ {{order.total.toFixed(2)}}</p><p class="text-neutral-500 text-xs">{{order.paymentMethod}}</p></div>
            </div>
            <div class="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
              @for(item of order.items.slice(0,4); track item.dishId){
                @let dish = getDish(item.dishId);
                @if(dish){
                  <div class="flex-shrink-0 relative">
                    <img [src]="dish.image" [alt]="item.dishName" class="w-16 h-16 rounded-lg object-cover border border-neutral-800"/>
                    @if(item.qty>1){<span class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">{{item.qty}}</span>}
                  </div>
                }
              }
              @if(order.items.length>4){<div class="flex-shrink-0 w-16 h-16 rounded-lg border border-neutral-800 bg-[#1a1a1a] flex items-center justify-center"><p class="text-neutral-400 text-xs">+{{order.items.length-4}}</p></div>}
            </div>
            <p class="text-neutral-400 text-sm line-clamp-1">📍 {{order.address.street}}, {{order.address.number}}</p>
            <p class="text-red-400 text-sm mt-2 group-hover:text-red-300">Ver detalhes e acompanhar →</p>
          </div>
        }
      </div>
    }
  </div>
</div>` })
export class ClientOrdersComponent {
  sc=SC; statusFilter:OrderStatus|'todos'='todos'; searchId='';
  statuses=[{key:'todos' as const,label:'Todos'},{key:'confirmado' as OrderStatus,label:'Confirmado'},{key:'em_preparo' as OrderStatus,label:'Em Preparo'},{key:'finalizado' as OrderStatus,label:'Pronto'},{key:'saiu_entrega' as OrderStatus,label:'Em Entrega'},{key:'entregue' as OrderStatus,label:'Entregue'}];
  constructor(public s:AppStateService, public r:Router){}
  myOrders=()=>this.s.orders().filter(o=>o.clientId===this.s.currentClient()?.id).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  filtered=()=>this.myOrders().filter(o=>this.statusFilter==='todos'||o.status===this.statusFilter).filter(o=>!this.searchId||o.id.toLowerCase().includes(this.searchId.toLowerCase()));
  cnt=(st:OrderStatus)=>this.myOrders().filter(o=>o.status===st).length;
  getDish=(id:string)=>this.s.dishes().find(d=>d.id===id);
  fmtDate=(d:Date)=>new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  setStatusFilter(key: any) { this.statusFilter = key; }
}
