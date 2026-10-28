import { Component } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { OrderStatus } from '../../models/models';
const SL:Record<OrderStatus,string>={confirmado:'Recebido',em_preparo:'Em Preparo',finalizado:'Finalizado',saiu_entrega:'Saiu p/ Entrega',entregue:'Entregue'};
const SC:Record<OrderStatus,string>={confirmado:'bg-blue-900/40 text-blue-300 border-blue-700/50',em_preparo:'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',finalizado:'bg-orange-900/40 text-orange-300 border-orange-700/50',saiu_entrega:'bg-purple-900/40 text-purple-300 border-purple-700/50',entregue:'bg-green-900/40 text-green-300 border-green-700/50'};
const TR:Partial<Record<OrderStatus,{next:OrderStatus;label:string;color:string}>>={confirmado:{next:'em_preparo',label:'Iniciar Preparo',color:'bg-yellow-700 hover:bg-yellow-600'},em_preparo:{next:'finalizado',label:'Finalizar',color:'bg-orange-700 hover:bg-orange-600'}};
@Component({ selector:'app-admin-kitchen', standalone:true, template:`
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="mb-6"><h1 class="text-white text-2xl font-semibold flex items-center gap-2">👨‍🍳 Visão da Cozinha</h1><p class="text-neutral-400 text-sm mt-1">{{active().length}} pedido(s) em preparo</p></div>
  <div class="grid grid-cols-3 gap-4 mb-6">
    <div class="text-blue-400 bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 text-center"><p class="text-2xl font-bold">{{cnt('confirmado')}}</p><p class="text-sm mt-1 opacity-80">Recebidos</p></div>
    <div class="text-yellow-400 bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-4 text-center"><p class="text-2xl font-bold">{{cnt('em_preparo')}}</p><p class="text-sm mt-1 opacity-80">Em Preparo</p></div>
    <div class="text-orange-400 bg-orange-900/20 border border-orange-800/30 rounded-xl p-4 text-center"><p class="text-2xl font-bold">{{cnt('finalizado')}}</p><p class="text-sm mt-1 opacity-80">Prontos</p></div>
  </div>
  @if(active().length===0){<div class="text-center py-16"><p class="text-neutral-400">Sem pedidos pendentes na cozinha</p></div>}
  @else {
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      @for(order of active(); track order.id){
        @let tr = trs[order.status];
        <div class="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden">
          <div class="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-0.5"><span class="text-white font-mono text-sm">#{{order.id}}</span><span class="text-xs px-2 py-0.5 rounded-lg border" [class]="sc[order.status]">{{sl[order.status]}}</span></div>
              <p class="text-neutral-400 text-xs">{{order.clientName}}</p>
            </div>
            <p class="text-neutral-500 text-xs">⏱ {{timeSince(order.createdAt)}}</p>
          </div>
          <div class="p-4">
            @for(item of order.items; track item.dishId){<div class="flex justify-between text-sm mb-1.5"><span class="text-neutral-300">{{item.dishName}}</span><span class="text-neutral-500">x{{item.qty}}</span></div>}
            @if(tr){<button (click)="s.updateOrderStatus(order.id,tr.next)" class="w-full text-white rounded-xl py-2.5 text-sm transition-colors mt-2" [class]="tr.color">{{tr.label}}</button>}
            @else if(order.status==='finalizado'){<div class="w-full bg-green-900/30 border border-green-700/50 text-green-400 rounded-xl py-2.5 text-sm text-center mt-2">✅ Aguardando entregador</div>}
          </div>
        </div>
      }
    </div>
  }
</div>` })
export class AdminKitchenComponent {
  sl=SL; sc=SC; trs=TR;
  constructor(public s:AppStateService){}
  active=()=>this.s.orders().filter(o=>!['saiu_entrega','entregue'].includes(o.status)).sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());
  cnt=(st:string)=>this.s.orders().filter(o=>o.status===st).length;
  timeSince=(d:Date)=>{const diff=Math.floor((Date.now()-new Date(d).getTime())/60000);return diff<1?'Agora':`${diff}min atrás`;};
}
