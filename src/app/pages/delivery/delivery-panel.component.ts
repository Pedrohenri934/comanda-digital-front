import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from '../../models/models';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-delivery-panel',
  standalone: true,
  template: `
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-10 bg-[#111111] border-b border-neutral-800 px-4 py-3">
    <div class="max-w-2xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-1.5 bg-amber-900/40 rounded-lg border border-amber-800/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="13" x="1" y="3" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
        </div>
        <div>
          <h1 class="text-white font-semibold">Painel do Entregador</h1>
          <p class="text-neutral-500 text-xs">{{s.currentDeliverer()?.name}}</p>
        </div>
      </div>
      <button (click)="logout()" class="flex items-center gap-2 text-neutral-400 hover:text-red-400 transition-colors text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        Sair
      </button>
    </div>
  </header>

  <div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
    <!-- Online toggle -->
    <div class="rounded-2xl p-6 border flex items-center justify-between"
      [class]="s.currentDeliverer()?.online ? 'bg-green-900/20 border-green-700/50' : 'bg-neutral-800/30 border-neutral-700/50'">
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{s.currentDeliverer()?.online ? '📶' : '📵'}}</span>
        <div>
          <p class="font-medium" [class]="s.currentDeliverer()?.online ? 'text-green-300' : 'text-neutral-400'">
            {{s.currentDeliverer()?.online ? 'Online — Disponível' : 'Offline'}}
          </p>
          <p class="text-neutral-500 text-sm">
            {{s.currentDeliverer()?.online ? 'Você está recebendo pedidos' : 'Fique online para receber pedidos'}}
          </p>
        </div>
      </div>
      <button (click)="s.toggleDelivererOnline()"
        class="relative w-14 h-7 rounded-full transition-colors"
        [class]="s.currentDeliverer()?.online ? 'bg-green-600' : 'bg-neutral-700'">
        <span class="absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all"
          [class]="s.currentDeliverer()?.online ? 'left-7' : 'left-0.5'"></span>
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-3 text-center">
        <p class="text-amber-400 text-2xl font-bold">{{readyOrders().length}}</p>
        <p class="text-neutral-500 text-xs mt-1">Disponíveis</p>
      </div>
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-3 text-center">
        <p class="text-blue-400 text-2xl font-bold">{{myOrders().length}}</p>
        <p class="text-neutral-500 text-xs mt-1">Em Entrega</p>
      </div>
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-3 text-center">
        <p class="text-green-400 text-2xl font-bold">{{completed().length}}</p>
        <p class="text-neutral-500 text-xs mt-1">Entregues Hoje</p>
      </div>
    </div>

    <!-- My active deliveries -->
    @if(myOrders().length > 0){
      <div>
        <h2 class="text-white font-semibold mb-3">🚗 Minhas Entregas Ativas</h2>
        <div class="space-y-3">
          @for(order of myOrders(); track order.id){
            <div class="bg-[#141414] border border-blue-700/30 rounded-2xl p-4">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <p class="text-white font-medium">#{{order.id}}</p>
                  <p class="text-neutral-400 text-sm">{{order.clientName}}</p>
                </div>
                <span class="text-blue-400 text-sm bg-blue-900/30 px-2 py-1 rounded-lg">Em trânsito</span>
              </div>
              <p class="text-neutral-400 text-sm mb-3">📍 {{order.address.street}}, {{order.address.number}} — CEP {{order.address.cep}}</p>
              <p class="text-red-400 font-bold mb-3">R$ {{order.total.toFixed(2)}} — {{order.paymentMethod}}</p>
              <button (click)="s.markDelivered(order.id)" class="w-full bg-green-700 hover:bg-green-600 text-white rounded-xl py-2.5 text-sm transition-colors">✅ Confirmar Entrega</button>
            </div>
          }
        </div>
      </div>
    }

    <!-- Ready orders -->
    <div>
      <h2 class="text-white font-semibold mb-3">📦 Pedidos Prontos para Entrega</h2>
      @if(!s.currentDeliverer()?.online){
        <div class="bg-neutral-800/30 border border-neutral-700/50 rounded-xl p-6 text-center text-neutral-500 text-sm">
          Fique online para ver os pedidos disponíveis
        </div>
      } @else if(readyOrders().length === 0){
        <div class="bg-[#141414] border border-neutral-800 rounded-xl p-6 text-center">
          <p class="text-neutral-500 text-sm">Nenhum pedido disponível no momento</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for(order of readyOrders(); track order.id){
            <div class="bg-[#141414] border border-amber-700/30 rounded-2xl p-4">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <p class="text-white font-medium">#{{order.id}}</p>
                  <p class="text-neutral-400 text-sm">{{order.clientName}}</p>
                </div>
                <span class="text-neutral-500 text-xs">⏱ {{timeSince(order.createdAt)}}</span>
              </div>
              <p class="text-neutral-400 text-sm mb-1">{{getItemsSummary(order)}}</p>
              <p class="text-neutral-400 text-sm mb-3">📍 {{order.address.street}}, {{order.address.number}}</p>
              <p class="text-red-400 font-bold mb-3">R$ {{order.total.toFixed(2)}} — {{order.paymentMethod}}</p>
              <button (click)="s.acceptDelivery(order.id)" class="w-full bg-amber-700 hover:bg-amber-600 text-white rounded-xl py-2.5 text-sm transition-colors">Aceitar Entrega</button>
            </div>
          }
        </div>
      }
    </div>
  </div>
</div>`
})
export class DeliveryPanelComponent {
  constructor(public s: AppStateService, private r: Router) {}

  readyOrders = () => this.s.orders().filter(o => o.status === 'finalizado' && !o.delivererId);
  myOrders = () => this.s.orders().filter(o => o.delivererId === this.s.currentDeliverer()?.id && o.status === 'saiu_entrega');
  completed = () => this.s.orders().filter(o => o.delivererId === this.s.currentDeliverer()?.id && o.status === 'entregue');

  // Helper method — no arrow function in template
  getItemsSummary(order: Order): string {
    return order.items.map(i => i.dishName + ' x' + i.qty).join(', ');
  }
  timeSince(d: Date): string {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    return diff < 1 ? 'Agora' : `${diff}min atrás`;
  }
  logout() { this.s.logoutDeliverer(); this.r.navigateByUrl('/entregador/login'); }
}
