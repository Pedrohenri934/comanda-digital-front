import { Component } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
@Component({ selector:'app-admin-deliverers', standalone:true, template:`
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="mb-6"><h1 class="text-white text-2xl font-semibold">Entregadores</h1><p class="text-neutral-400 text-sm mt-1">{{approved().length}} aprovados · {{pending().length}} aguardando</p></div>
  @if(pending().length>0){
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-4"><span class="text-yellow-400">⏰</span><h2 class="text-white font-semibold">Aguardando Aprovação</h2><span class="bg-yellow-700 text-white text-xs px-2 py-0.5 rounded-full">{{pending().length}}</span></div>
      <div class="space-y-3">
        @for(d of pending(); track d.id){
          <div class="bg-[#141414] border border-yellow-700/30 rounded-2xl p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1"><p class="text-white font-medium">{{d.name}}</p><p class="text-neutral-400 text-sm">{{d.email}} · {{d.phone}}</p><p class="text-neutral-500 text-sm">CPF: {{d.cpf}}</p><p class="text-neutral-500 text-sm">{{d.vehicleType}} — {{d.plate}}</p></div>
              <div class="flex flex-col gap-2">
                <button (click)="s.approveDeliverer(d.id)" class="flex items-center gap-1 bg-green-800 hover:bg-green-700 text-white rounded-xl px-3 py-2 text-sm transition-colors">✅ Aprovar</button>
                <button (click)="s.rejectDeliverer(d.id)" class="flex items-center gap-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 rounded-xl px-3 py-2 text-sm transition-colors">❌ Recusar</button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  }
  <div>
    <div class="flex items-center gap-2 mb-4"><span class="text-amber-400">🚗</span><h2 class="text-white font-semibold">Entregadores Ativos</h2></div>
    @if(approved().length===0){<div class="text-center py-12 text-neutral-500">Nenhum entregador aprovado</div>}
    @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @for(d of approved(); track d.id){
          @let st = getStats(d.id);
          <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-4">
            <div class="flex items-start gap-3 mb-4">
              <div class="w-10 h-10 bg-amber-900/40 border border-amber-800/50 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🚗</div>
              <div class="flex-1">
                <div class="flex items-center gap-2"><p class="text-white font-medium">{{d.name}}</p><span class="text-xs px-2 py-0.5 rounded-full" [class]="d.online?'bg-green-900/40 text-green-400':'bg-neutral-800 text-neutral-500'">{{d.online?'🟢 Online':'⚫ Offline'}}</span></div>
                <p class="text-neutral-400 text-sm">{{d.email}}</p><p class="text-neutral-500 text-sm">{{d.vehicleType}} · {{d.plate}}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-[#1a1a1a] rounded-xl p-3 text-center"><p class="text-green-400 text-xl font-bold">{{st.delivered}}</p><p class="text-neutral-500 text-xs">Entregas Concluídas</p></div>
              <div class="bg-[#1a1a1a] rounded-xl p-3 text-center"><p class="text-blue-400 text-xl font-bold">{{st.active}}</p><p class="text-neutral-500 text-xs">Em Andamento</p></div>
            </div>
            <button (click)="s.rejectDeliverer(d.id)" class="w-full mt-3 text-xs text-neutral-600 hover:text-red-400 transition-colors py-1">Remover entregador</button>
          </div>
        }
      </div>
    }
  </div>
</div>` })
export class AdminDeliverersComponent {
  constructor(public s:AppStateService){}
  approved=()=>this.s.deliverers().filter(d=>d.approved);
  pending=()=>this.s.deliverers().filter(d=>!d.approved);
  getStats=(id:string)=>({delivered:this.s.orders().filter(o=>o.delivererId===id&&o.status==='entregue').length,active:this.s.orders().filter(o=>o.delivererId===id&&o.status==='saiu_entrega').length});
}
