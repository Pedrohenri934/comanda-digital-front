import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { OrderStatus } from '../../models/models';
const COLORS:Record<string,string>={confirmado:'bg-blue-900/40 border-blue-700/50 text-blue-300',em_preparo:'bg-yellow-900/40 border-yellow-700/50 text-yellow-300',finalizado:'bg-orange-900/40 border-orange-700/50 text-orange-300'};
const LABELS:Record<string,string>={confirmado:'Recebido',em_preparo:'Em Preparo',finalizado:'Finalizado',saiu_entrega:'Saiu p/ Entrega',entregue:'Entregue'};
const TRS:Record<OrderStatus,{next?:OrderStatus;label:string;color:string}> = {
  confirmado:{next:'em_preparo',label:'Iniciar Preparo',color:'bg-yellow-700 hover:bg-yellow-600'},
  em_preparo:{next:'finalizado',label:'Finalizar Preparo',color:'bg-orange-700 hover:bg-orange-600'},
  finalizado:{next:undefined,label:'Pronto',color:'bg-green-700'},
  saiu_entrega:{next:undefined,label:'Saiu',color:'bg-neutral-700'},
  entregue:{next:undefined,label:'Entregue',color:'bg-neutral-700'},
};
@Component({ selector:'app-kitchen-dashboard', standalone:true, template:`
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-10 bg-[#111111] border-b border-neutral-800 px-4 py-3">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-1.5 bg-orange-900/40 rounded-lg border border-orange-800/50"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg></div>
        <div><h1 class="text-white font-semibold">Painel da Cozinha</h1><p class="text-neutral-500 text-xs">{{active().length}} pedido(s) ativo(s)</p></div>
      </div>
      <button (click)="logout()" class="flex items-center gap-2 text-neutral-400 hover:text-red-400 transition-colors text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg> Sair
      </button>
    </div>
  </header>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 text-center"><p class="text-blue-400 text-3xl font-bold">{{cnt('confirmado')}}</p><p class="text-neutral-400 text-sm mt-1">Recebidos</p></div>
      <div class="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-4 text-center"><p class="text-yellow-400 text-3xl font-bold">{{cnt('em_preparo')}}</p><p class="text-neutral-400 text-sm mt-1">Em Preparo</p></div>
      <div class="bg-green-900/20 border border-green-800/30 rounded-xl p-4 text-center"><p class="text-green-400 text-3xl font-bold">{{cnt('finalizado')}}</p><p class="text-neutral-400 text-sm mt-1">Prontos</p></div>
    </div>
    @if(active().length===0){
      <div class="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-green-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p class="text-neutral-400 text-lg">Nenhum pedido pendente</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for(order of active(); track order.id){
          @let tr = trs[order.status];
          <div class="bg-[#141414] rounded-2xl overflow-hidden border" [class]="urgency(order.createdAt)">
            <div class="p-4 border-b border-neutral-800">
              <div class="flex items-center justify-between mb-1">
                <span class="text-white font-mono text-sm">#{{order.id}}</span>
                <span class="text-xs px-2 py-1 rounded-lg border" [class]="colors[order.status]||'bg-neutral-800 text-neutral-400 border-neutral-700'">{{labels[order.status]}}</span>
              </div>
              <p class="text-neutral-300 text-sm">{{order.clientName}}</p>
              <p class="text-neutral-500 text-xs mt-1">⏱ {{timeSince(order.createdAt)}}</p>
            </div>
            <div class="p-4">
              @for(item of order.items; track item.dishId){
                <div class="flex justify-between text-sm mb-1.5"><span class="text-neutral-300">{{item.dishName}}</span><span class="text-neutral-500">x{{item.qty}}</span></div>
              }
              @if(tr.next){
                <button (click)="s.updateOrderStatus(order.id,tr.next!)" class="w-full text-white rounded-xl py-2.5 text-sm transition-colors mt-2" [class]="tr.color">{{tr.label}}</button>
              } @else if(order.status==='finalizado'){
                <div class="w-full bg-green-900/30 border border-green-700/50 text-green-400 rounded-xl py-2.5 text-sm text-center mt-2">✅ Aguardando entregador</div>
              }
            </div>
          </div>
        }
      </div>
    }
  </div>
</div>` })
export class KitchenDashboardComponent {
  colors=COLORS; labels=LABELS; trs=TRS;
  constructor(public s:AppStateService, private r:Router){}
  active=()=>this.s.orders().filter(o=>!['saiu_entrega','entregue'].includes(o.status)).sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());
  cnt=(st:string)=>this.s.orders().filter(o=>o.status===st).length;
  timeSince=(d:Date)=>{const diff=Math.floor((Date.now()-new Date(d).getTime())/60000);return diff<1?'Agora':`${diff}min atrás`;};
  urgency=(d:Date)=>{const diff=Math.floor((Date.now()-new Date(d).getTime())/60000);return diff>30?'border-red-700/70':diff>15?'border-yellow-700/70':'border-neutral-800';};
  logout(){this.s.logoutKitchen();this.r.navigateByUrl('/cozinha/login');}
}
