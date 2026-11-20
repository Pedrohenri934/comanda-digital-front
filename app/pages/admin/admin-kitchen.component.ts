import { Component } from '@angular/core';
import { KitchenBoardComponent } from '../kitchen/kitchen-board.component';

// Mesma visao da cozinha, dentro do painel administrativo.
@Component({ selector:'app-admin-kitchen', standalone:true, imports:[KitchenBoardComponent], template:`
<div class="p-4 md:p-6 max-w-6xl mx-auto">
  <div class="mb-6"><h1 class="text-white text-2xl font-semibold">Cozinha</h1><p class="text-neutral-400 text-sm mt-1">Pedidos ativos, atualizados a cada 10 segundos</p></div>
  <app-kitchen-board/>
</div>` })
export class AdminKitchenComponent {}
