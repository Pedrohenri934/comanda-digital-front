import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { OrderStatus } from '../../models/models';
const SI:Record<OrderStatus,number>={confirmado:0,em_preparo:1,finalizado:2,saiu_entrega:3,entregue:4};
const STEPS=[
  {status:'confirmado' as OrderStatus,label:'Pedido Confirmado',desc:'Recebemos seu pedido com sucesso!'},
  {status:'em_preparo' as OrderStatus,label:'Em Preparo',desc:'A cozinha está preparando seu pedido'},
  {status:'finalizado' as OrderStatus,label:'Finalizado',desc:'Pedido pronto para retirada pelo entregador'},
  {status:'saiu_entrega' as OrderStatus,label:'Saiu para Entrega',desc:'Seu pedido está a caminho!'},
  {status:'entregue' as OrderStatus,label:'Entregue',desc:'Pedido entregue. Bom apetite!'},
];
@Component({ selector:'app-client-tracking', standalone:true, template:`
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-neutral-800/50 px-4 py-3">
    <div class="max-w-2xl mx-auto flex items-center gap-4">
      <button (click)="r.navigateByUrl('/cliente/pedidos')" class="text-neutral-400 hover:text-white text-sm">←</button>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
      <span class="text-white font-semibold">Acompanhamento do Pedido</span>
      <button (click)="r.navigateByUrl('/cliente/pedidos')" class="ml-auto p-2 text-neutral-400 hover:text-red-400 transition-colors">📦</button>
    </div>
  </header>
  <div class="max-w-2xl mx-auto px-4 py-8">
    @if(!order()){
      <div class="text-center py-16"><p class="text-neutral-400 mb-4">Pedido não encontrado</p>
        <button (click)="r.navigateByUrl('/cliente/cardapio')" class="text-red-400 hover:text-red-300">Voltar ao cardápio</button></div>
    } @else {
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div><p class="text-neutral-400 text-sm">Pedido #{{order()!.id}}</p><p class="text-white">{{order()!.clientName}}</p></div>
          <span class="text-red-400 text-2xl">🛍️</span>
        </div>
        <p class="text-neutral-400 text-sm">{{fmtDate(order()!.createdAt)}} • {{order()!.paymentMethod}}</p>
      </div>
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 mb-6">
        <h2 class="text-white font-semibold mb-6">Status do Pedido</h2>
        @for(step of steps; track step.status; let idx=$index; let last=$last){
          @let done=idx<=currentStep(); @let active=idx===currentStep();
          <div class="flex gap-4">
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all"
                [class]="done?(active?'bg-red-800 border-red-600 ring-2 ring-red-500/50 scale-110':'bg-red-800 border-red-600'):'bg-neutral-800 border-neutral-700'">
                <span [class]="done?'text-white':'text-neutral-600'" class="text-sm">{{stepEmoji(step.status)}}</span>
              </div>
              @if(!last){<div class="w-0.5 h-8 mt-1" [class]="idx<currentStep()?'bg-red-700':'bg-neutral-700'"></div>}
            </div>
            <div class="pb-6">
              <p class="mb-0.5" [class]="done?(active?'text-red-300':'text-white'):'text-neutral-600'">{{step.label}}</p>
              <p class="text-sm" [class]="done?'text-neutral-400':'text-neutral-700'">{{step.desc}}</p>
            </div>
          </div>
        }
      </div>
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6 mb-6">
        <h2 class="text-white font-semibold mb-4">Itens do Pedido</h2>
        @for(item of order()!.items; track item.dishId){
          @let dish=getDish(item.dishId);
          <div class="flex items-center gap-3 mb-3">
            @if(dish){<img [src]="dish.image" [alt]="item.dishName" class="w-12 h-12 rounded-lg object-cover"/>}
            <div class="flex-1"><p class="text-white text-sm">{{item.dishName}}</p><p class="text-neutral-500 text-xs">x{{item.qty}}</p></div>
            <p class="text-red-400">R$ {{(item.price*item.qty).toFixed(2)}}</p>
          </div>
        }
        <div class="border-t border-neutral-800 mt-4 pt-4 flex justify-between">
          <span class="text-neutral-400">Total</span><span class="text-red-400 font-bold">R$ {{order()!.total.toFixed(2)}}</span>
        </div>
      </div>
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
        <h2 class="text-white font-semibold mb-3">Endereço de Entrega</h2>
        <p class="text-neutral-300">{{order()!.address.street}}, {{order()!.address.number}}</p>
        @if(order()!.address.complement){<p class="text-neutral-500 text-sm">{{order()!.address.complement}}</p>}
        <p class="text-neutral-500 text-sm">CEP: {{order()!.address.cep}}</p>
        @if(order()!.address.reference){<p class="text-neutral-500 text-sm">Ref: {{order()!.address.reference}}</p>}
      </div>
    }
  </div>
</div>` })
export class ClientTrackingComponent {
  steps=STEPS; orderId='';
  constructor(public s:AppStateService, public r:Router, route:ActivatedRoute){
    this.orderId=route.snapshot.paramMap.get('id')||'';
  }
  order=()=>this.s.orders().find(o=>o.id===this.orderId)??null;
  currentStep=()=>SI[this.order()?.status??'confirmado'];
  getDish=(id:string)=>this.s.dishes().find(d=>d.id===id);
  fmtDate=(d:Date)=>new Date(d).toLocaleString('pt-BR');
  stepEmoji=(s:OrderStatus)=>({confirmado:'✅',em_preparo:'👨‍🍳',finalizado:'⏰',saiu_entrega:'🚗',entregue:'🎉'}[s]);
}
