import { Component, signal } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { OrderStatus } from '../../models/models';
const SL:Record<OrderStatus,string>={confirmado:'Confirmado',em_preparo:'Em Preparo',finalizado:'Finalizado',saiu_entrega:'Saiu p/ Entrega',entregue:'Entregue'};
const SC:Record<OrderStatus,string>={confirmado:'bg-blue-900/40 text-blue-300 border-blue-700/50',em_preparo:'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',finalizado:'bg-orange-900/40 text-orange-300 border-orange-700/50',saiu_entrega:'bg-purple-900/40 text-purple-300 border-purple-700/50',entregue:'bg-green-900/40 text-green-300 border-green-700/50'};
@Component({ selector:'app-admin-orders', standalone:true, template:`
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="mb-6"><h1 class="text-white text-2xl font-semibold">Pedidos</h1><p class="text-neutral-400 text-sm mt-1">{{s.orders().length}} pedidos no total</p></div>
  <div class="flex gap-2 overflow-x-auto pb-2 mb-6">
    @for(st of allStatuses; track st){
      <button (click)="setFilterStatus(st)" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors" [class]="filterStatus===st?'bg-red-800 text-white':'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">
        {{statusLabel(st)}}
      </button>
    }
  </div>
  <div class="space-y-3">
    @if(sorted().length===0){<div class="text-center py-12 text-neutral-500">Nenhum pedido encontrado</div>}
    @for(order of sorted(); track order.id){
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden">
        <div class="p-4 flex items-center gap-4 cursor-pointer" (click)="toggle(order.id)">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-white font-mono text-sm">#{{order.id}}</span>
              <span class="text-xs px-2 py-0.5 rounded-lg border" [class]="sc[order.status]">{{sl[order.status]}}</span>
            </div>
            <p class="text-neutral-300 text-sm">{{order.clientName}}</p>
            <p class="text-neutral-500 text-xs mt-1">⏱ {{timeSince(order.createdAt)}} · 💳 {{order.paymentMethod}}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-red-400 font-bold">R$ {{order.total.toFixed(2)}}</p>
            <p class="text-neutral-500 text-xs">{{itemCount(order)}} item(s)</p>
          </div>
          <span class="text-neutral-500 text-sm">{{expandedId()===order.id?'▲':'▼'}}</span>
        </div>
        @if(expandedId()===order.id){
          <div class="border-t border-neutral-800 p-4 space-y-4">
            <div><p class="text-neutral-400 text-xs mb-2">ITENS</p>
              @for(item of order.items; track item.dishId){
                <div class="flex justify-between text-sm py-1"><span class="text-neutral-300">{{item.dishName}} x{{item.qty}}</span><span class="text-neutral-400">R$ {{(item.price*item.qty).toFixed(2)}}</span></div>
              }
            </div>
            <div><p class="text-neutral-400 text-xs mb-1">📍 ENDEREÇO</p>
              <p class="text-neutral-300 text-sm">{{order.address.street}}, {{order.address.number}} — CEP {{order.address.cep}}</p>
              @if(order.address.complement){<p class="text-neutral-500 text-xs">{{order.address.complement}}</p>}
              @if(order.address.reference){<p class="text-neutral-500 text-xs">Ref: {{order.address.reference}}</p>}
            </div>
            <div><p class="text-neutral-400 text-xs mb-2">ALTERAR STATUS</p>
              <div class="flex flex-wrap gap-2">
                @for(st of statusList; track st){
                  <button (click)="s.updateOrderStatus(order.id,st)" class="px-3 py-1.5 rounded-xl text-xs transition-colors border" [class]="order.status===st?sc[st]:'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'">{{sl[st]}}</button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  </div>
</div>` })
export class AdminOrdersComponent {
  sl=SL; sc=SC;
  allStatuses:any[]=['todos','confirmado','em_preparo','finalizado','saiu_entrega','entregue'];
  statusList:OrderStatus[]=['confirmado','em_preparo','finalizado','saiu_entrega','entregue'];
  filterStatus:any='todos'; expandedId=signal<string|null>(null);
  constructor(public s:AppStateService){}
  sorted=()=>{const os=this.filterStatus==='todos'?this.s.orders():this.s.orders().filter(o=>o.status===this.filterStatus);return[...os].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());};
  toggle=(id:string)=>this.expandedId.set(this.expandedId()===id?null:id);
  timeSince=(d:Date)=>{const diff=Math.floor((Date.now()-new Date(d).getTime())/60000);if(diff<1)return'Agora';if(diff<60)return diff+'min';return Math.floor(diff/60)+'h'+diff%60+'m';};
  statusLabel(st: string): string {
    if (st === 'todos') return 'Todos (' + this.s.orders().length + ')';
    return (this.sl as any)[st] + ' (' + this.s.orders().filter(o => o.status === st).length + ')';
  }
  itemCount(order: any): number { return order.items.reduce((s: number, i: any) => s + i.qty, 0); }
  setFilterStatus(st: any) { this.filterStatus = st; }
}
