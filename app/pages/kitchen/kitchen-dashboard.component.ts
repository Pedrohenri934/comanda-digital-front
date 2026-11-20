import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { KitchenBoardComponent } from './kitchen-board.component';

@Component({ selector:'app-kitchen-dashboard', standalone:true, imports:[KitchenBoardComponent], template:`
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-10 bg-[#111111] border-b border-neutral-800 px-4 py-3">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl">👨‍🍳</span>
        <div><h1 class="text-white font-semibold">Painel da Cozinha</h1><p class="text-neutral-500 text-xs">{{auth.usuario()?.nome}}</p></div>
      </div>
      <button (click)="sair()" class="text-neutral-400 hover:text-red-400 transition-colors text-sm">Sair</button>
    </div>
  </header>
  <div class="max-w-6xl mx-auto px-4 py-6"><app-kitchen-board/></div>
</div>` })
export class KitchenDashboardComponent {
  auth = inject(AuthService);
  private r = inject(Router);
  sair() { this.auth.limparSessao(); this.r.navigateByUrl('/'); }
}
