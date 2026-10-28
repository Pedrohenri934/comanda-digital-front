import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

const NAV = [
  { path: '/admin/dashboard',       label: 'Dashboard',          icon: '📊' },
  { path: '/admin/pratos',          label: 'Gerenciar Pratos',   icon: '🍽️' },
  { path: '/admin/cardapio-semana', label: 'Cardápio da Semana', icon: '📅' },
  { path: '/admin/pedidos',         label: 'Pedidos',            icon: '🛍️' },
  { path: '/admin/estoque',         label: 'Estoque',            icon: '📦' },
  { path: '/admin/entregadores',    label: 'Entregadores',       icon: '🚗' },
  { path: '/admin/cozinha',         label: 'Cozinha',            icon: '👨‍🍳' },
  { path: '/admin/relatorios',      label: 'Relatórios',         icon: '📈' },
  { path: '/admin/matriz-bcg',      label: 'Matriz BCG',         icon: '🎯' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet],
  template: `
<div class="min-h-screen bg-[#0a0a0a] flex">

  <!-- Desktop sidebar -->
  <aside class="hidden lg:flex w-60 bg-[#111111] border-r border-neutral-800 flex-col flex-shrink-0 h-screen sticky top-0">
    <ng-container [ngTemplateOutlet]="sidebarContent"></ng-container>
  </aside>

  <!-- Mobile overlay + sidebar -->
  @if(open()){
    <div class="lg:hidden fixed inset-0 z-50 flex">
      <div class="absolute inset-0 bg-black/70" (click)="open.set(false)"></div>
      <aside class="relative w-60 bg-[#111111] border-r border-neutral-800 flex flex-col h-full">
        <ng-container [ngTemplateOutlet]="sidebarContent"></ng-container>
      </aside>
    </div>
  }

  <!-- Main content -->
  <main class="flex-1 flex flex-col min-w-0 overflow-auto">
    <!-- Mobile top bar -->
    <div class="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#111111] border-b border-neutral-800 sticky top-0 z-10">
      <button (click)="open.set(true)" class="text-neutral-400 hover:text-white p-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>
        </svg>
      </button>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
      </svg>
      <span class="text-white text-sm font-semibold">Boi Na Brasa — Admin</span>
    </div>
    <div class="flex-1">
      <router-outlet/>
    </div>
  </main>
</div>

<!-- Sidebar template (shared between desktop & mobile) -->
<ng-template #sidebarContent>
  <div class="flex flex-col h-full overflow-hidden">

    <!-- Logo -->
    <div class="p-4 border-b border-neutral-800 flex-shrink-0">
      <div class="flex items-center gap-2">
        <div class="p-1.5 bg-red-900/40 rounded-lg border border-red-800/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
        </div>
        <div>
          <p class="text-white text-sm font-semibold leading-tight">Boi Na Brasa</p>
          <p class="text-neutral-500 text-xs">Painel Admin</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
      @for(item of nav; track item.path){
        <a [routerLink]="item.path"
           routerLinkActive="bg-red-900/40 text-white border border-red-800/50"
           [routerLinkActiveOptions]="{exact: true}"
           (click)="open.set(false)"
           class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-neutral-400 hover:text-white hover:bg-neutral-800/60 border border-transparent">
          <span class="text-base leading-none flex-shrink-0">{{item.icon}}</span>
          <span class="flex-1">{{item.label}}</span>
          @if(item.label === 'Pedidos' && pending() > 0){
            <span class="bg-red-700 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{{pending()}}</span>
          }
        </a>
      }
    </nav>

    <!-- Footer -->
    <div class="p-3 border-t border-neutral-800 flex-shrink-0">
      <button (click)="logout()"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
        Sair do painel
      </button>
    </div>
  </div>
</ng-template>
`
})
export class AdminLayoutComponent {
  nav = NAV;
  open = signal(false);

  constructor(private s: AppStateService, private r: Router) {}

  pending() { return this.s.orders().filter(o => o.status !== 'entregue').length; }
  logout() { this.s.logoutAdmin(); this.r.navigateByUrl('/admin/login'); }
}
